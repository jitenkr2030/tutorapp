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

    // Get revenue data
    const payments = await db.payment.findMany({
      where: {
        paidAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        booking: {
          include: {
            session: true
          }
        }
      }
    });

    // Calculate revenue metrics
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const revenueByMonth = getRevenueByMonth(payments);
    const revenueGrowth = calculateRevenueGrowth(revenueByMonth);

    // Get customer segmentation
    const customerSegmentation = await getCustomerSegmentation(startDate, endDate);

    // Get financial metrics
    const financialMetrics = await getFinancialMetrics(startDate, endDate, totalRevenue);

    // Get operational efficiency metrics
    const operationalMetrics = await getOperationalMetrics(startDate, endDate);

    // Get business metrics from database
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

    // Get user growth data
    const userGrowth = await getUserGrowth(startDate, endDate);

    // Get market trends
    const marketTrends = await getMarketTrends(startDate, endDate);

    // Compile business intelligence data
    const businessIntelligence = {
      revenue: {
        totalRevenue,
        revenueByMonth,
        revenueGrowth,
        avgRevenuePerDay: totalRevenue / ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      customerSegmentation,
      financialMetrics,
      operationalMetrics,
      businessMetrics,
      userGrowth,
      marketTrends,
      summary: {
        totalRevenue,
        revenueGrowthRate: revenueGrowth.overall,
        profitMargin: financialMetrics.profitMargin,
        customerAcquisitionCost: financialMetrics.customerAcquisitionCost,
        operationalEfficiency: operationalMetrics.efficiencyScore
      }
    };

    return NextResponse.json(businessIntelligence);
  } catch (error) {
    console.error('Business intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business intelligence data' },
      { status: 500 }
    );
  }
}

function getRevenueByMonth(payments: any[]): any[] {
  const monthlyRevenue = new Map();
  
  payments.forEach(payment => {
    const month = new Date(payment.paidAt).toISOString().slice(0, 7);
    if (!monthlyRevenue.has(month)) {
      monthlyRevenue.set(month, 0);
    }
    monthlyRevenue.set(month, monthlyRevenue.get(month) + payment.amount);
  });
  
  return Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
    month,
    revenue
  }));
}

function calculateRevenueGrowth(revenueByMonth: any[]): any {
  if (revenueByMonth.length < 2) {
    return { overall: 0, monthly: [] };
  }
  
  const monthlyGrowth = [];
  let totalGrowth = 0;
  
  for (let i = 1; i < revenueByMonth.length; i++) {
    const current = revenueByMonth[i].revenue;
    const previous = revenueByMonth[i - 1].revenue;
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    
    monthlyGrowth.push({
      month: revenueByMonth[i].month,
      growth
    });
    
    totalGrowth += growth;
  }
  
  return {
    overall: totalGrowth / (revenueByMonth.length - 1),
    monthly: monthlyGrowth
  };
}

async function getCustomerSegmentation(startDate: Date, endDate: Date): Promise<any> {
  // Get all users who had sessions in the period
  const activeUsers = await db.session.findMany({
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      studentId: true,
      price: true
    }
  });

  // Group users by spending
  const userSpending = new Map();
  activeUsers.forEach(session => {
    const userId = session.studentId;
    if (!userSpending.has(userId)) {
      userSpending.set(userId, 0);
    }
    userSpending.set(userId, userSpending.get(userId) + session.price);
  });

  // Segment users
  const segments = {
    premium: [],      // High spending users
    regular: [],      // Medium spending users
    casual: []        // Low spending users
  };

  const spendingValues = Array.from(userSpending.values()).sort((a, b) => b - a);
  const premiumThreshold = spendingValues[Math.floor(spendingValues.length * 0.2)] || 0;
  const regularThreshold = spendingValues[Math.floor(spendingValues.length * 0.7)] || 0;

  userSpending.forEach((spending, userId) => {
    if (spending >= premiumThreshold) {
      segments.premium.push({ userId, spending });
    } else if (spending >= regularThreshold) {
      segments.regular.push({ userId, spending });
    } else {
      segments.casual.push({ userId, spending });
    }
  });

  return {
    segments,
    totalCustomers: userSpending.size,
    premiumCustomers: segments.premium.length,
    regularCustomers: segments.regular.length,
    casualCustomers: segments.casual.length,
    avgSpendingPerCustomer: spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length
  };
}

async function getFinancialMetrics(startDate: Date, endDate: Date, totalRevenue: number): Promise<any> {
  // Estimate costs (simplified model)
  const estimatedPlatformCost = totalRevenue * 0.15; // 15% platform cost
  const estimatedTutorPayout = totalRevenue * 0.70; // 70% to tutors
  const estimatedOperatingCost = totalRevenue * 0.10; // 10% operating costs
  const totalCosts = estimatedPlatformCost + estimatedTutorPayout + estimatedOperatingCost;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Calculate customer acquisition cost
  const newCustomers = await db.user.count({
    where: {
      role: 'STUDENT',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const marketingCost = estimatedOperatingCost * 0.3; // 30% of operating costs for marketing
  const customerAcquisitionCost = newCustomers > 0 ? marketingCost / newCustomers : 0;

  return {
    totalRevenue,
    totalCosts,
    netProfit,
    profitMargin,
    estimatedPlatformCost,
    estimatedTutorPayout,
    estimatedOperatingCost,
    customerAcquisitionCost,
    newCustomers
  };
}

async function getOperationalMetrics(startDate: Date, endDate: Date): Promise<any> {
  // Get session completion rates
  const totalSessions = await db.session.count({
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const completedSessions = await db.session.count({
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'COMPLETED'
    }
  });

  const cancelledSessions = await db.session.count({
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'CANCELLED'
    }
  });

  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0;

  // Get tutor utilization
  const activeTutors = await db.tutor.count({
    where: {
      status: 'APPROVED'
    }
  });

  const tutorsWithSessions = await db.session.findMany({
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      tutorId: true
    },
    distinct: ['tutorId']
  });

  const tutorUtilization = activeTutors > 0 ? (tutorsWithSessions.length / activeTutors) * 100 : 0;

  // Calculate efficiency score
  const efficiencyScore = (completionRate * 0.4) + (tutorUtilization * 0.3) + ((100 - cancellationRate) * 0.3);

  return {
    totalSessions,
    completedSessions,
    cancelledSessions,
    completionRate,
    cancellationRate,
    activeTutors,
    tutorsWithSessions: tutorsWithSessions.length,
    tutorUtilization,
    efficiencyScore
  };
}

async function getUserGrowth(startDate: Date, endDate: Date): Promise<any[]> {
  const growthData = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const newUsers = await db.user.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });
    
    const activeUsers = await db.session.findMany({
      where: {
        scheduledAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      select: {
        studentId: true,
        tutorId: true
      },
      distinct: ['studentId', 'tutorId']
    });
    
    growthData.push({
      month: monthStart.toISOString().slice(0, 7),
      newUsers,
      activeUsers: activeUsers.length
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return growthData;
}

async function getMarketTrends(startDate: Date, endDate: Date): Promise<any> {
  // Get subject popularity
  const sessions = await db.session.findMany({
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      title: true,
      price: true,
      duration: true
    }
  });

  const subjectPopularity = new Map();
  sessions.forEach(session => {
    const subject = session.title;
    if (!subjectPopularity.has(subject)) {
      subjectPopularity.set(subject, {
        count: 0,
        totalRevenue: 0,
        totalHours: 0
      });
    }
    
    const data = subjectPopularity.get(subject);
    data.count++;
    data.totalRevenue += session.price;
    data.totalHours += session.duration / 60;
  });

  const subjectTrends = Array.from(subjectPopularity.entries()).map(([subject, data]) => ({
    subject,
    sessionCount: data.count,
    totalRevenue: data.totalRevenue,
    totalHours: data.totalHours,
    avgPricePerHour: data.totalHours > 0 ? data.totalRevenue / data.totalHours : 0
  }));

  // Sort by popularity
  subjectTrends.sort((a, b) => b.sessionCount - a.sessionCount);

  return {
    subjectTrends,
    topSubjects: subjectTrends.slice(0, 5),
    emergingSubjects: subjectTrends.slice(-5).reverse()
  };
}