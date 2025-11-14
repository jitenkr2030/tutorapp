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

    // Calculate date range based on timeRange
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

    // Get analytics snapshot data
    const snapshots = await db.analyticsSnapshot.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get user metrics
    const totalUsers = await db.user.count();
    const newUsers = await db.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    // Get session metrics
    const sessions = await db.session.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        tutor: true,
        student: true,
        review: true
      }
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const cancelledSessions = sessions.filter(s => s.status === 'CANCELLED').length;
    
    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length 
      : 0;

    // Get revenue metrics
    const payments = await db.payment.findMany({
      where: {
        paidAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const avgRevenuePerSession = totalSessions > 0 ? totalRevenue / totalSessions : 0;

    // Get performance metrics
    const reviews = sessions.filter(s => s.review).map(s => s.review!);
    const avgTutorRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

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
      }
    });

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
      }
    });

    // Get business metrics
    const businessMetrics = await db.businessMetric.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get prediction data
    const predictions = await db.predictionModel.findMany({
      where: {
        targetDate: {
          gte: new Date()
        },
        type: {
          in: ['student_growth', 'revenue', 'tutor_retention']
        }
      },
      orderBy: {
        targetDate: 'asc'
      }
    });

    // Compile analytics data
    const analyticsData = {
      overview: {
        totalUsers,
        newUsers,
        totalSessions,
        completedSessions,
        cancelledSessions,
        totalRevenue,
        avgRevenuePerSession,
        avgTutorRating,
        avgSessionDuration
      },
      snapshots,
      studentPerformance,
      tutorPerformance,
      businessMetrics,
      predictions,
      timeRange,
      subject
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}