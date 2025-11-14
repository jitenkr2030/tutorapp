import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

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

    // Get historical data for predictions
    const historicalData = await getHistoricalData(startDate, endDate);

    // Generate predictions
    const predictions = await generatePredictions(historicalData);

    // Get risk assessment
    const riskAssessment = await getRiskAssessment(historicalData);

    // Get market trends analysis
    const marketTrends = await getMarketTrendsAnalysis(historicalData);

    // Get AI insights
    const aiInsights = await getAIInsights(historicalData, predictions);

    // Compile predictive analytics data
    const predictiveAnalytics = {
      predictions,
      riskAssessment,
      marketTrends,
      aiInsights,
      summary: {
        confidenceLevel: predictions.overallConfidence,
        keyPredictions: {
          studentGrowth: predictions.studentGrowth,
          revenueGrowth: predictions.revenueGrowth,
          tutorRetention: predictions.tutorRetention
        },
        topRisks: riskAssessment.topRisks.slice(0, 3),
        keyOpportunities: marketTrends.opportunities.slice(0, 3)
      }
    };

    return NextResponse.json(predictiveAnalytics);
  } catch (error) {
    console.error('Predictive analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictive analytics data' },
      { status: 500 }
    );
  }
}

async function getHistoricalData(startDate: Date, endDate: Date): Promise<any> {
  // Get user growth data
  const userGrowth = await db.user.groupBy({
    by: ['role'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _count: {
      id: true
    }
  });

  // Get session data
  const sessions = await db.session.findMany({
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      status: true,
      price: true,
      duration: true,
      scheduledAt: true
    }
  });

  // Get revenue data
  const payments = await db.payment.findMany({
    where: {
      paidAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'COMPLETED'
    },
    select: {
      amount: true,
      paidAt: true
    }
  });

  // Get tutor activity
  const tutorActivity = await db.session.groupBy({
    by: ['tutorId'],
    where: {
      scheduledAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _count: {
      id: true
    }
  });

  return {
    userGrowth,
    sessions,
    payments,
    tutorActivity,
    timeRange: {
      start: startDate,
      end: endDate
    }
  };
}

async function generatePredictions(historicalData: any): Promise<any> {
  // Calculate growth rates
  const studentGrowthRate = calculateGrowthRate(historicalData.userGrowth.filter(u => u.role === 'STUDENT'));
  const sessionGrowthRate = calculateSessionGrowthRate(historicalData.sessions);
  const revenueGrowthRate = calculateRevenueGrowthRate(historicalData.payments);

  // Generate predictions for next 6 months
  const predictions = {
    studentGrowth: {
      current: historicalData.userGrowth.find(u => u.role === 'STUDENT')?._count.id || 0,
      predicted3Months: Math.round((historicalData.userGrowth.find(u => u.role === 'STUDENT')?._count.id || 0) * Math.pow(1 + studentGrowthRate, 3)),
      predicted6Months: Math.round((historicalData.userGrowth.find(u => u.role === 'STUDENT')?._count.id || 0) * Math.pow(1 + studentGrowthRate, 6)),
      growthRate: studentGrowthRate,
      confidence: calculateConfidence(studentGrowthRate, historicalData.sessions.length)
    },
    revenueGrowth: {
      currentRevenue: historicalData.payments.reduce((sum, p) => sum + p.amount, 0),
      predicted3Months: Math.round(historicalData.payments.reduce((sum, p) => sum + p.amount, 0) * Math.pow(1 + revenueGrowthRate, 3)),
      predicted6Months: Math.round(historicalData.payments.reduce((sum, p) => sum + p.amount, 0) * Math.pow(1 + revenueGrowthRate, 6)),
      growthRate: revenueGrowthRate,
      confidence: calculateConfidence(revenueGrowthRate, historicalData.payments.length)
    },
    tutorRetention: {
      currentActiveTutors: historicalData.tutorActivity.length,
      predicted3Months: Math.round(historicalData.tutorActivity.length * 0.95), // Assume 5% churn
      predicted6Months: Math.round(historicalData.tutorActivity.length * 0.90), // Assume 10% churn over 6 months
      retentionRate: 0.90,
      confidence: 0.75
    },
    sessionDemand: {
      currentSessions: historicalData.sessions.length,
      predicted3Months: Math.round(historicalData.sessions.length * Math.pow(1 + sessionGrowthRate, 3)),
      predicted6Months: Math.round(historicalData.sessions.length * Math.pow(1 + sessionGrowthRate, 6)),
      growthRate: sessionGrowthRate,
      confidence: calculateConfidence(sessionGrowthRate, historicalData.sessions.length)
    },
    overallConfidence: 0.80
  };

  // Store predictions in database
  await storePredictions(predictions);

  return predictions;
}

function calculateGrowthRate(userGrowthData: any[]): number {
  if (userGrowthData.length === 0) return 0.05; // Default 5% growth
  
  // Simple growth rate calculation based on user count
  const totalUsers = userGrowthData.reduce((sum, group) => sum + group._count.id, 0);
  const daysDiff = (new Date().getTime() - new Date(userGrowthData[0].createdAt).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff === 0) return 0.05;
  
  return Math.min(totalUsers / daysDiff * 30, 0.20); // Cap at 20% monthly growth
}

function calculateSessionGrowthRate(sessions: any[]): number {
  if (sessions.length === 0) return 0.05;
  
  // Group sessions by month to calculate growth
  const monthlySessions = new Map();
  sessions.forEach(session => {
    const month = new Date(session.scheduledAt).toISOString().slice(0, 7);
    if (!monthlySessions.has(month)) {
      monthlySessions.set(month, 0);
    }
    monthlySessions.set(month, monthlySessions.get(month) + 1);
  });
  
  const sortedMonths = Array.from(monthlySessions.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  if (sortedMonths.length < 2) return 0.05;
  
  const current = sortedMonths[sortedMonths.length - 1][1];
  const previous = sortedMonths[sortedMonths.length - 2][1];
  
  return previous > 0 ? (current - previous) / previous : 0.05;
}

function calculateRevenueGrowthRate(payments: any[]): number {
  if (payments.length === 0) return 0.05;
  
  // Group payments by month
  const monthlyRevenue = new Map();
  payments.forEach(payment => {
    const month = new Date(payment.paidAt).toISOString().slice(0, 7);
    if (!monthlyRevenue.has(month)) {
      monthlyRevenue.set(month, 0);
    }
    monthlyRevenue.set(month, monthlyRevenue.get(month) + payment.amount);
  });
  
  const sortedMonths = Array.from(monthlyRevenue.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  if (sortedMonths.length < 2) return 0.05;
  
  const current = sortedMonths[sortedMonths.length - 1][1];
  const previous = sortedMonths[sortedMonths.length - 2][1];
  
  return previous > 0 ? (current - previous) / previous : 0.05;
}

function calculateConfidence(growthRate: number, dataPoints: number): number {
  // Higher confidence with more data points and reasonable growth rates
  const dataConfidence = Math.min(dataPoints / 100, 1.0); // More data = higher confidence
  const rateConfidence = Math.max(0, 1 - Math.abs(growthRate - 0.1) / 0.2); // Reasonable growth rates = higher confidence
  
  return (dataConfidence + rateConfidence) / 2;
}

async function storePredictions(predictions: any): Promise<void> {
  const targetDate3Months = new Date();
  targetDate3Months.setMonth(targetDate3Months.getMonth() + 3);
  
  const targetDate6Months = new Date();
  targetDate6Months.setMonth(targetDate6Months.getMonth() + 6);

  try {
    await db.predictionModel.createMany({
      data: [
        {
          type: 'student_growth',
          targetDate: targetDate3Months,
          predictedValue: predictions.studentGrowth.predicted3Months,
          confidence: predictions.studentGrowth.confidence,
          modelVersion: '1.0',
          trainingDataEnd: new Date(),
          factors: JSON.stringify({ growthRate: predictions.studentGrowth.growthRate })
        },
        {
          type: 'student_growth',
          targetDate: targetDate6Months,
          predictedValue: predictions.studentGrowth.predicted6Months,
          confidence: predictions.studentGrowth.confidence * 0.9,
          modelVersion: '1.0',
          trainingDataEnd: new Date(),
          factors: JSON.stringify({ growthRate: predictions.studentGrowth.growthRate })
        },
        {
          type: 'revenue',
          targetDate: targetDate3Months,
          predictedValue: predictions.revenueGrowth.predicted3Months,
          confidence: predictions.revenueGrowth.confidence,
          modelVersion: '1.0',
          trainingDataEnd: new Date(),
          factors: JSON.stringify({ growthRate: predictions.revenueGrowth.growthRate })
        },
        {
          type: 'revenue',
          targetDate: targetDate6Months,
          predictedValue: predictions.revenueGrowth.predicted6Months,
          confidence: predictions.revenueGrowth.confidence * 0.9,
          modelVersion: '1.0',
          trainingDataEnd: new Date(),
          factors: JSON.stringify({ growthRate: predictions.revenueGrowth.growthRate })
        },
        {
          type: 'tutor_retention',
          targetDate: targetDate3Months,
          predictedValue: predictions.tutorRetention.predicted3Months,
          confidence: predictions.tutorRetention.confidence,
          modelVersion: '1.0',
          trainingDataEnd: new Date(),
          factors: JSON.stringify({ retentionRate: predictions.tutorRetention.retentionRate })
        }
      ]
    });
  } catch (error) {
    console.error('Error storing predictions:', error);
  }
}

async function getRiskAssessment(historicalData: any): Promise<any> {
  const risks = [];
  
  // Student churn risk
  const studentGrowthRate = calculateGrowthRate(historicalData.userGrowth.filter(u => u.role === 'STUDENT'));
  if (studentGrowthRate < 0.02) {
    risks.push({
      type: 'STUDENT_CHURN',
      severity: 'HIGH',
      probability: 0.8,
      description: 'Low student growth rate indicates potential churn risk',
      mitigation: 'Implement student retention programs and improve engagement'
    });
  }
  
  // Revenue risk
  const revenueGrowthRate = calculateRevenueGrowthRate(historicalData.payments);
  if (revenueGrowthRate < 0.03) {
    risks.push({
      type: 'REVENUE_DECLINE',
      severity: 'MEDIUM',
      probability: 0.6,
      description: 'Revenue growth is below target',
      mitigation: 'Review pricing strategy and expand marketing efforts'
    });
  }
  
  // Tutor shortage risk
  const tutorUtilization = historicalData.tutorActivity.length > 0 ? 
    historicalData.sessions.length / historicalData.tutorActivity.length : 0;
  if (tutorUtilization > 50) {
    risks.push({
      type: 'TUTOR_SHORTAGE',
      severity: 'MEDIUM',
      probability: 0.7,
      description: 'High tutor utilization may indicate capacity constraints',
      mitigation: 'Accelerate tutor recruitment and onboarding'
    });
  }
  
  // Market risk
  const sessionCompletionRate = historicalData.sessions.length > 0 ?
    historicalData.sessions.filter(s => s.status === 'COMPLETED').length / historicalData.sessions.length : 0;
  if (sessionCompletionRate < 0.8) {
    risks.push({
      type: 'QUALITY_RISK',
      severity: 'HIGH',
      probability: 0.9,
      description: 'Low session completion rate indicates quality issues',
      mitigation: 'Improve tutor training and session management'
    });
  }

  return {
    risks,
    topRisks: risks.sort((a, b) => (b.severity === 'HIGH' ? 3 : b.severity === 'MEDIUM' ? 2 : 1) - 
                                   (a.severity === 'HIGH' ? 3 : a.severity === 'MEDIUM' ? 2 : 1)).slice(0, 5),
    overallRiskScore: risks.reduce((sum, risk) => sum + (risk.severity === 'HIGH' ? 3 : risk.severity === 'MEDIUM' ? 2 : 1), 0)
  };
}

async function getMarketTrendsAnalysis(historicalData: any): Promise<any> {
  // Analyze session patterns
  const sessionPatterns = analyzeSessionPatterns(historicalData.sessions);
  
  // Identify opportunities
  const opportunities = [];
  
  if (sessionPatterns.peakHours.length > 0) {
    opportunities.push({
      type: 'PEAK_HOURS_OPTIMIZATION',
      description: 'Optimize tutor availability during peak hours',
      potentialImpact: 'HIGH',
      estimatedValue: 'Increase capacity utilization by 15%'
    });
  }
  
  if (sessionPatterns.popularSubjects.length > 0) {
    opportunities.push({
      type: 'SUBJECT_EXPANSION',
      description: `Expand offerings in popular subjects: ${sessionPatterns.popularSubjects.slice(0, 3).join(', ')}`,
      potentialImpact: 'MEDIUM',
      estimatedValue: 'Increase revenue by 10%'
    });
  }
  
  opportunities.push({
    type: 'AI_ENHANCEMENT',
    description: 'Implement AI-powered matching and personalization',
    potentialImpact: 'HIGH',
    estimatedValue: 'Improve user satisfaction by 25%'
  });

  return {
    sessionPatterns,
    opportunities,
    emergingTrends: [
      'Increased demand for online tutoring',
      'Growing preference for specialized subjects',
      'Rising interest in skill-based learning'
    ]
  };
}

function analyzeSessionPatterns(sessions: any[]): any {
  const hourlyDistribution = new Array(24).fill(0);
  const subjectCount = new Map();
  
  sessions.forEach(session => {
    const hour = new Date(session.scheduledAt).getHours();
    hourlyDistribution[hour]++;
    
    const subject = session.title;
    subjectCount.set(subject, (subjectCount.get(subject) || 0) + 1);
  });
  
  const peakHours = hourlyDistribution
    .map((count, hour) => ({ hour, count }))
    .filter(item => item.count > sessions.length * 0.05)
    .sort((a, b) => b.count - a.count);
  
  const popularSubjects = Array.from(subjectCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([subject]) => subject);
  
  return {
    peakHours,
    popularSubjects,
    hourlyDistribution
  };
}

async function getAIInsights(historicalData: any, predictions: any): Promise<any> {
  try {
    const zai = await ZAI.create();
    
    const prompt = `
    Analyze the following tutoring platform data and provide strategic insights:
    
    Historical Data:
    - Student Growth Rate: ${predictions.studentGrowth.growthRate}
    - Revenue Growth Rate: ${predictions.revenueGrowth.growthRate}
    - Current Sessions: ${historicalData.sessions.length}
    - Active Tutors: ${historicalData.tutorActivity.length}
    
    Predictions:
    - 3-month student growth: ${predictions.studentGrowth.predicted3Months}
    - 3-month revenue prediction: ${predictions.revenueGrowth.predicted3Months}
    - Tutor retention rate: ${predictions.tutorRetention.retentionRate}
    
    Provide insights on:
    1. Key growth opportunities
    2. Potential operational improvements
    3. Strategic recommendations for the next 6 months
    4. Market positioning suggestions
    `;
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst specializing in educational technology platforms.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const aiResponse = completion.choices[0]?.message?.content || '';
    
    return {
      insights: aiResponse,
      generatedAt: new Date().toISOString(),
      confidence: 0.85
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return {
      insights: 'AI insights temporarily unavailable',
      generatedAt: new Date().toISOString(),
      confidence: 0
    };
  }
}