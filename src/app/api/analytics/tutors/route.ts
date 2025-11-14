import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get tutor performance data
    const tutorPerformance = await db.tutorPerformance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        tutor: {
          include: {
            tutorProfile: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Get session data for detailed analysis
    const sessions = await db.session.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        tutor: {
          include: {
            tutorProfile: true
          }
        },
        student: true,
        review: true,
        payment: true
      }
    });

    // Group sessions by tutor
    const tutorSessionData = new Map();
    sessions.forEach(session => {
      const tutorId = session.tutorId;
      if (!tutorSessionData.has(tutorId)) {
        tutorSessionData.set(tutorId, {
          tutor: session.tutor,
          sessions: [],
          totalEarnings: 0,
          totalHours: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          ratings: [],
          subjects: new Set()
        });
      }
      
      const data = tutorSessionData.get(tutorId);
      data.sessions.push(session);
      data.subjects.add(session.title);
      data.totalHours += session.duration / 60;
      
      if (session.status === 'COMPLETED') {
        data.completedSessions++;
        if (session.payment && session.payment.status === 'COMPLETED') {
          data.totalEarnings += session.payment.amount;
        }
        if (session.review) {
          data.ratings.push(session.review.rating);
        }
      } else if (session.status === 'CANCELLED') {
        data.cancelledSessions++;
      }
    });

    // Calculate tutor metrics
    const tutorMetrics = Array.from(tutorSessionData.values()).map(data => {
      const avgRating = data.ratings.length > 0 
        ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length 
        : 0;
      
      const completionRate = data.sessions.length > 0 
        ? (data.completedSessions / data.sessions.length) * 100 
        : 0;
      
      const cancellationRate = data.sessions.length > 0 
        ? (data.cancelledSessions / data.sessions.length) * 100 
        : 0;
      
      const hourlyRate = data.totalHours > 0 
        ? data.totalEarnings / data.totalHours 
        : 0;

      return {
        tutorId: data.tutor.id,
        tutorName: data.tutor.name,
        hourlyRate: data.tutor.tutorProfile?.hourlyRate || 0,
        totalSessions: data.sessions.length,
        completedSessions: data.completedSessions,
        cancelledSessions: data.cancelledSessions,
        totalHours: data.totalHours,
        totalEarnings: data.totalEarnings,
        avgRating,
        completionRate,
        cancellationRate,
        actualHourlyRate: hourlyRate,
        subjects: Array.from(data.subjects),
        performanceScore: calculateTutorPerformanceScore(avgRating, completionRate, data.totalHours)
      };
    });

    // Get top performing tutors
    const topTutors = tutorMetrics
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10);

    // Get revenue analysis
    const revenueAnalysis = {
      totalRevenue: tutorMetrics.reduce((sum, t) => sum + t.totalEarnings, 0),
      avgRevenuePerTutor: tutorMetrics.length > 0 
        ? tutorMetrics.reduce((sum, t) => sum + t.totalEarnings, 0) / tutorMetrics.length 
        : 0,
      topEarners: tutorMetrics
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 5),
      revenueByExperience: getRevenueByExperience(tutorMetrics)
    };

    // Get performance trends
    const performanceTrends = await getPerformanceTrends(startDate, endDate);

    // Get subject-wise performance
    const subjectPerformance = await getSubjectPerformance(sessions);

    // Compile tutor analytics data
    const tutorAnalytics = {
      tutorPerformance,
      tutorMetrics,
      topTutors,
      revenueAnalysis,
      performanceTrends,
      subjectPerformance,
      summary: {
        totalTutors: tutorMetrics.length,
        avgRating: tutorMetrics.length > 0 
          ? tutorMetrics.reduce((sum, t) => sum + t.avgRating, 0) / tutorMetrics.length 
          : 0,
        avgCompletionRate: tutorMetrics.length > 0 
          ? tutorMetrics.reduce((sum, t) => sum + t.completionRate, 0) / tutorMetrics.length 
          : 0,
        avgHourlyEarnings: tutorMetrics.length > 0 
          ? tutorMetrics.reduce((sum, t) => sum + t.actualHourlyRate, 0) / tutorMetrics.length 
          : 0,
        totalSessions: tutorMetrics.reduce((sum, t) => sum + t.totalSessions, 0)
      }
    };

    return NextResponse.json(tutorAnalytics);
  } catch (error) {
    console.error('Tutor analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutor analytics data' },
      { status: 500 }
    );
  }
}

function calculateTutorPerformanceScore(avgRating: number, completionRate: number, totalHours: number): number {
  // Performance score calculation
  const ratingScore = avgRating * 20; // Max 100 points for rating
  const completionScore = completionRate; // Max 100 points for completion
  const hoursScore = Math.min(totalHours * 2, 100); // Max 100 points for hours
  
  return Math.round((ratingScore + completionScore + hoursScore) / 3);
}

function getRevenueByExperience(tutorMetrics: any[]): any[] {
  const experienceGroups = {
    '0-2 years': [],
    '3-5 years': [],
    '6-10 years': [],
    '10+ years': []
  };

  tutorMetrics.forEach(tutor => {
    // This is a simplified grouping - in real implementation, you'd use actual experience data
    const experience = tutor.hourlyRate < 30 ? '0-2 years' :
                     tutor.hourlyRate < 50 ? '3-5 years' :
                     tutor.hourlyRate < 80 ? '6-10 years' : '10+ years';
    
    experienceGroups[experience].push(tutor.totalEarnings);
  });

  return Object.entries(experienceGroups).map(([experience, earnings]) => ({
    experience,
    totalRevenue: (earnings as number[]).reduce((sum, e) => sum + e, 0),
    avgRevenue: (earnings as number[]).length > 0 
      ? (earnings as number[]).reduce((sum, e) => sum + e, 0) / (earnings as number[]).length 
      : 0,
    tutorCount: (earnings as number[]).length
  }));
}

async function getPerformanceTrends(startDate: Date, endDate: Date): Promise<any[]> {
  // Get monthly performance trends
  const trends = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthSessions = await db.session.findMany({
      where: {
        scheduledAt: {
          gte: monthStart,
          lte: monthEnd
        },
        status: 'COMPLETED'
      },
      include: {
        review: true
      }
    });
    
    const avgRating = monthSessions.length > 0 
      ? monthSessions
          .filter(s => s.review)
          .reduce((sum, s) => sum + s.review!.rating, 0) / 
        monthSessions.filter(s => s.review).length 
      : 0;
    
    trends.push({
      month: monthStart.toISOString().slice(0, 7),
      totalSessions: monthSessions.length,
      avgRating
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return trends;
}

async function getSubjectPerformance(sessions: any[]): Promise<any[]> {
  const subjectData = new Map();
  
  sessions.forEach(session => {
    const subject = session.title;
    if (!subjectData.has(subject)) {
      subjectData.set(subject, {
        subject,
        sessions: [],
        ratings: [],
        earnings: 0
      });
    }
    
    const data = subjectData.get(subject);
    data.sessions.push(session);
    
    if (session.review) {
      data.ratings.push(session.review.rating);
    }
    
    if (session.payment && session.payment.status === 'COMPLETED') {
      data.earnings += session.payment.amount;
    }
  });
  
  return Array.from(subjectData.values()).map(data => ({
    subject: data.subject,
    totalSessions: data.sessions.length,
    avgRating: data.ratings.length > 0 
      ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length 
      : 0,
    totalRevenue: data.earnings
  }));
}