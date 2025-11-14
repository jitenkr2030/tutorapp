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
    const subject = searchParams.get('subject') || 'all';

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

    // Get student performance data
    const studentPerformance = await db.studentPerformance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        ...(subject !== 'all' && { subject })
      },
      include: {
        student: {
          include: {
            studentProfile: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Get session data for engagement analysis
    const sessions = await db.session.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        student: {
          include: {
            studentProfile: true
          }
        },
        review: true
      }
    });

    // Group sessions by student
    const studentSessionData = new Map();
    sessions.forEach(session => {
      const studentId = session.studentId;
      if (!studentSessionData.has(studentId)) {
        studentSessionData.set(studentId, {
          student: session.student,
          sessions: [],
          totalHours: 0,
          avgRating: 0,
          subjects: new Set()
        });
      }
      
      const data = studentSessionData.get(studentId);
      data.sessions.push(session);
      data.totalHours += session.duration / 60;
      data.subjects.add(session.title);
      
      if (session.review) {
        data.avgRating = (data.avgRating * (data.sessions.length - 1) + session.review.rating) / data.sessions.length;
      }
    });

    // Calculate engagement metrics
    const engagementData = Array.from(studentSessionData.values()).map(data => ({
      studentId: data.student.id,
      studentName: data.student.name,
      totalSessions: data.sessions.length,
      totalHours: data.totalHours,
      avgRating: data.avgRating,
      subjects: Array.from(data.subjects),
      engagementScore: calculateEngagementScore(data.sessions.length, data.totalHours, data.avgRating)
    }));

    // Get learning plan progress
    const learningPlans = await db.learningPlan.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        status: 'ACTIVE'
      },
      include: {
        goals: {
          include: {
            milestones: true
          }
        },
        student: {
          include: {
            studentProfile: true
          }
        }
      }
    });

    // Calculate learning plan metrics
    const learningPlanMetrics = learningPlans.map(plan => {
      const totalGoals = plan.goals.length;
      const completedGoals = plan.goals.filter(g => g.status === 'completed').length;
      const totalMilestones = plan.goals.reduce((sum, g) => sum + g.milestones.length, 0);
      const completedMilestones = plan.goals.reduce((sum, g) => sum + g.milestones.filter(m => m.completed).length, 0);
      
      return {
        planId: plan.id,
        studentId: plan.studentId,
        studentName: plan.student.name,
        subject: plan.subject,
        totalGoals,
        completedGoals,
        goalCompletionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
        totalMilestones,
        completedMilestones,
        milestoneCompletionRate: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
        createdAt: plan.createdAt
      };
    });

    // Get subject-wise performance
    const subjectPerformance = await db.studentPerformance.groupBy({
      by: ['subject'],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        ...(subject !== 'all' && { subject })
      },
      _avg: {
        avgGrade: true,
        completionRate: true,
        engagementScore: true,
        sessionHours: true
      },
      _sum: {
        goalsCompleted: true,
        skillsMastered: true
      },
      _count: {
        studentId: true
      }
    });

    // Compile learning analytics data
    const learningAnalytics = {
      studentPerformance,
      engagementData,
      learningPlanMetrics,
      subjectPerformance,
      summary: {
        totalStudentsAnalyzed: engagementData.length,
        avgEngagementScore: engagementData.length > 0 
          ? engagementData.reduce((sum, e) => sum + e.engagementScore, 0) / engagementData.length 
          : 0,
        avgSessionHoursPerStudent: engagementData.length > 0 
          ? engagementData.reduce((sum, e) => sum + e.totalHours, 0) / engagementData.length 
          : 0,
        activeLearningPlans: learningPlans.length,
        avgGoalCompletionRate: learningPlanMetrics.length > 0 
          ? learningPlanMetrics.reduce((sum, m) => sum + m.goalCompletionRate, 0) / learningPlanMetrics.length 
          : 0
      }
    };

    return NextResponse.json(learningAnalytics);
  } catch (error) {
    console.error('Learning analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning analytics data' },
      { status: 500 }
    );
  }
}

function calculateEngagementScore(sessionCount: number, totalHours: number, avgRating: number): number {
  // Simple engagement score calculation
  const sessionScore = Math.min(sessionCount * 2, 30); // Max 30 points for sessions
  const hoursScore = Math.min(totalHours * 3, 30); // Max 30 points for hours
  const ratingScore = avgRating * 8; // Max 40 points for rating
  
  return Math.round(sessionScore + hoursScore + ratingScore);
}