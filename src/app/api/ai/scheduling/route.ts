import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, tutorId, studentId, sessionId, preferences, constraints } = await request.json();

    // Get relevant data based on scheduling type
    let schedulingData;
    
    switch (type) {
      case 'OPTIMIZATION':
        schedulingData = await getOptimizationData(tutorId, studentId, preferences);
        break;
      case 'CONFLICT_RESOLUTION':
        schedulingData = await getConflictResolutionData(sessionId, tutorId, studentId);
        break;
      case 'PREDICTION':
        schedulingData = await getPredictionData(tutorId, studentId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid scheduling type' }, { status: 400 });
    }

    // Use AI for scheduling optimization
    const zai = await ZAI.create();
    
    const prompt = `
    You are an expert AI scheduling assistant specializing in educational session optimization. 
    Analyze the scheduling data and provide intelligent scheduling recommendations.
    
    Scheduling Type: ${type}
    
    Data:
    ${JSON.stringify(schedulingData, null, 2)}
    
    Constraints:
    ${JSON.stringify(constraints || {}, null, 2)}
    
    Please provide optimized scheduling recommendations based on:
    1. Tutor availability and preferences
    2. Student learning patterns and availability
    3. Historical session performance
    4. Optimal learning times and session frequency
    5. Conflict resolution strategies
    
    Format your response as JSON with the following structure:
    {
      "recommendations": [
        {
          "type": "TIME_SLOT|FREQUENCY|RESOLUTION",
          "title": "Recommendation Title",
          "description": "Detailed description",
          "suggestedSlots": [
            {
              "day": "Monday",
              "startTime": "14:00",
              "endTime": "15:00",
              "confidence": 0.85
            }
          ],
          "benefits": ["benefit1", "benefit2"],
          "considerations": ["consideration1"],
          "priority": "high|medium|low"
        }
      ],
      "optimizationMetrics": {
        "efficiency": 0.85,
        "satisfaction": 0.90,
        "utilization": 0.75
      },
      "implementation": {
        "immediateActions": ["action1", "action2"],
        "longTermStrategy": "strategy description"
      }
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI scheduling assistant specializing in educational session optimization.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      aiResponse = {
        recommendations: [],
        optimizationMetrics: {},
        implementation: {}
      };
    }

    // Store scheduling result in database
    const schedulingResult = await db.aIScheduling.create({
      data: {
        sessionId,
        tutorId,
        studentId,
        type,
        input: JSON.stringify({ schedulingData, constraints }),
        result: JSON.stringify(aiResponse),
        confidence: calculateSchedulingConfidence(aiResponse.recommendations)
      }
    });

    return NextResponse.json({
      schedulingId: schedulingResult.id,
      recommendations: aiResponse.recommendations,
      optimizationMetrics: aiResponse.optimizationMetrics,
      implementation: aiResponse.implementation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI scheduling error:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduling optimization' },
      { status: 500 }
    );
  }
}

async function getOptimizationData(tutorId: string, studentId: string, preferences: any) {
  const [tutor, student, existingSessions] = await Promise.all([
    db.user.findUnique({
      where: { id: tutorId },
      include: {
        tutorProfile: true,
        availability: true
      }
    }),
    db.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true
      }
    }),
    db.session.findMany({
      where: {
        OR: [
          { tutorId, status: 'SCHEDULED' },
          { studentId, status: 'SCHEDULED' }
        ]
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })
  ]);

  // Get session performance data
  const performanceData = await db.session.findMany({
    where: {
      tutorId,
      status: 'COMPLETED'
    },
    include: {
      review: true
    },
    orderBy: {
      scheduledAt: 'desc'
    },
    take: 20
  });

  return {
    tutor: {
      id: tutor?.id,
      name: tutor?.name,
      availability: tutor?.availability,
      preferences: preferences?.tutor || {}
    },
    student: {
      id: student?.id,
      name: student?.name,
      grade: student?.studentProfile?.grade,
      preferences: preferences?.student || {}
    },
    existingSessions,
    performanceMetrics: {
      avgRating: performanceData.length > 0 
        ? performanceData.filter(s => s.review).reduce((sum, s) => sum + s.review!.rating, 0) / performanceData.filter(s => s.review).length 
        : 0,
      completionRate: performanceData.length > 0 
        ? performanceData.filter(s => s.status === 'COMPLETED').length / performanceData.length 
        : 0,
      preferredTimes: analyzePreferredTimes(existingSessions)
    }
  };
}

async function getConflictResolutionData(sessionId: string, tutorId: string, studentId: string) {
  const [session, conflictingSessions, tutorAvailability] = await Promise.all([
    db.session.findUnique({
      where: { id: sessionId },
      include: {
        tutor: true,
        student: true
      }
    }),
    db.session.findMany({
      where: {
        id: { not: sessionId },
        OR: [
          { tutorId, status: 'SCHEDULED' },
          { studentId, status: 'SCHEDULED' }
        ]
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    }),
    db.availability.findMany({
      where: { tutorId }
    })
  ]);

  return {
    session,
    conflictingSessions,
    tutorAvailability,
    conflictAnalysis: {
      tutorConflicts: conflictingSessions.filter(s => s.tutorId === tutorId),
      studentConflicts: conflictingSessions.filter(s => s.studentId === studentId),
      severity: calculateConflictSeverity(session, conflictingSessions)
    }
  };
}

async function getPredictionData(tutorId: string, studentId: string) {
  const [historicalSessions, tutorAvailability, studentGoals] = await Promise.all([
    db.session.findMany({
      where: {
        OR: [
          { tutorId },
          { studentId }
        ],
        status: 'COMPLETED'
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      take: 30
    }),
    db.availability.findMany({
      where: { tutorId }
    }),
    db.learningGoal.findMany({
      where: {
        learningPlan: {
          studentId
        }
      }
    })
  ]);

  return {
    historicalPatterns: {
      sessionFrequency: analyzeSessionFrequency(historicalSessions),
      preferredDays: analyzePreferredDays(historicalSessions),
      preferredTimes: analyzePreferredTimes(historicalSessions),
      seasonalTrends: analyzeSeasonalTrends(historicalSessions)
    },
    tutorAvailability,
    studentGoals,
    predictions: {
      optimalFrequency: predictOptimalFrequency(historicalSessions, studentGoals),
      bestTimeSlots: predictBestTimeSlots(historicalSessions, tutorAvailability),
      successProbability: predictSuccessProbability(historicalSessions)
    }
  };
}

function analyzePreferredTimes(sessions: any[]): string[] {
  const timeSlots = sessions.map(s => {
    const date = new Date(s.scheduledAt);
    return `${date.getDay()}-${date.getHours()}`;
  });
  
  const timeCounts = timeSlots.reduce((acc, time) => {
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(timeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([time]) => time);
}

function calculateConflictSeverity(session: any, conflictingSessions: any[]): 'low' | 'medium' | 'high' {
  if (!session) return 'low';
  
  const sessionTime = new Date(session.scheduledAt);
  const directConflicts = conflictingSessions.filter(s => {
    const conflictTime = new Date(s.scheduledAt);
    const timeDiff = Math.abs(sessionTime.getTime() - conflictTime.getTime());
    return timeDiff < 2 * 60 * 60 * 1000; // 2 hours
  });
  
  if (directConflicts.length > 2) return 'high';
  if (directConflicts.length > 0) return 'medium';
  return 'low';
}

function analyzeSessionFrequency(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const daysDiff = (new Date().getTime() - new Date(sessions[sessions.length - 1].scheduledAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 0 ? sessions.length / daysDiff : 0;
}

function analyzePreferredDays(sessions: any[]): number[] {
  const dayCounts = new Array(7).fill(0);
  sessions.forEach(session => {
    const day = new Date(session.scheduledAt).getDay();
    dayCounts[day]++;
  });
  
  return dayCounts.map((count, index) => ({ day: index, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => item.day);
}

function analyzeSeasonalTrends(sessions: any[]): any {
  const monthlyCounts = new Array(12).fill(0);
  sessions.forEach(session => {
    const month = new Date(session.scheduledAt).getMonth();
    monthlyCounts[month]++;
  });
  
  return {
    peakMonths: monthlyCounts
      .map((count, month) => ({ month, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.month),
    lowMonths: monthlyCounts
      .map((count, month) => ({ month, count }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 3)
      .map(item => item.month)
  };
}

function predictOptimalFrequency(historicalSessions: any[], goals: any[]): number {
  const currentFreq = analyzeSessionFrequency(historicalSessions);
  const goalComplexity = goals.length;
  
  // Simple heuristic: more goals = higher recommended frequency
  return Math.min(currentFreq + (goalComplexity * 0.5), 7); // Max 1 session per day
}

function predictBestTimeSlots(historicalSessions: any[], availability: any[]): any[] {
  const preferredTimes = analyzePreferredTimes(historicalSessions);
  
  return preferredTimes.map(timeSlot => {
    const [day, hour] = timeSlot.split('-').map(Number);
    return {
      day,
      hour,
      confidence: 0.8
    };
  });
}

function predictSuccessProbability(historicalSessions: any[]): number {
  if (historicalSessions.length === 0) return 0.5;
  
  const completionRate = historicalSessions.filter(s => s.status === 'COMPLETED').length / historicalSessions.length;
  const avgRating = historicalSessions
    .filter(s => s.review)
    .reduce((sum, s) => sum + s.review!.rating, 0) / historicalSessions.filter(s => s.review).length || 3;
  
  return (completionRate * 0.6) + ((avgRating / 5) * 0.4);
}

function calculateSchedulingConfidence(recommendations: any[]): number {
  if (recommendations.length === 0) return 0;
  
  const avgConfidence = recommendations.reduce((sum, rec) => {
    const slotConfidence = rec.suggestedSlots?.reduce((slotSum: number, slot: any) => 
      slotSum + (slot.confidence || 0.5), 0) / (rec.suggestedSlots?.length || 1);
    return sum + slotConfidence;
  }, 0) / recommendations.length;
  
  return Math.min(avgConfidence, 1);
}