import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    const predictionType = searchParams.get('type') || 'all';

    // Check if user has permission to access the requested user's predictions
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build where clause
    const whereClause: any = { userId };
    if (predictionType !== 'all') {
      whereClause.predictionType = predictionType;
    }

    // Get learning predictions
    const predictions = await db.learningPrediction.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 predictions
    });

    // Filter out expired predictions
    const now = new Date();
    const validPredictions = predictions.filter(p => !p.validUntil || p.validUntil > now);

    return NextResponse.json({
      predictions: validPredictions,
      summary: {
        total: validPredictions.length,
        byType: validPredictions.reduce((acc, p) => {
          acc[p.predictionType] = (acc[p.predictionType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        avgAccuracy: validPredictions.filter(p => p.accuracy !== null).length > 0
          ? validPredictions.filter(p => p.accuracy !== null).reduce((sum, p) => sum + (p.accuracy || 0), 0) / 
            validPredictions.filter(p => p.accuracy !== null).length
          : null
      }
    });
  } catch (error) {
    console.error('Learning predictions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning predictions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { predictionType, generateWithAI = true } = body;

    if (!predictionType || !['PERFORMANCE', 'DROPOUT_RISK', 'LEARNING_PACE', 'OPTIMAL_PATH'].includes(predictionType)) {
      return NextResponse.json(
        { error: 'Invalid prediction type' },
        { status: 400 }
      );
    }

    // Get user's learning data
    const userLearningData = await getUserLearningData(session.user.id);

    let predictionData: any;
    let factors: any;
    let recommendations: string[] = [];

    if (generateWithAI) {
      // Generate prediction using AI
      const aiResult = await generateAIPrediction(predictionType, userLearningData);
      predictionData = aiResult.prediction;
      factors = aiResult.factors;
      recommendations = aiResult.recommendations;
    } else {
      // Generate prediction using rule-based logic
      const ruleBasedResult = generateRuleBasedPrediction(predictionType, userLearningData);
      predictionData = ruleBasedResult.prediction;
      factors = ruleBasedResult.factors;
      recommendations = ruleBasedResult.recommendations;
    }

    // Calculate validity period (predictions are valid for 30 days)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    // Store the prediction
    const prediction = await db.learningPrediction.create({
      data: {
        userId: session.user.id,
        predictionType,
        prediction: predictionData,
        factors,
        recommendations: { recommendations },
        validUntil
      }
    });

    return NextResponse.json({
      prediction,
      message: 'Learning prediction generated successfully'
    });
  } catch (error) {
    console.error('Create learning prediction API error:', error);
    return NextResponse.json(
      { error: 'Failed to create learning prediction' },
      { status: 500 }
    );
  }
}

async function getUserLearningData(userId: string) {
  // Get user's sessions
  const sessions = await db.session.findMany({
    where: {
      studentId: userId,
      status: 'COMPLETED'
    },
    include: {
      review: true
    },
    orderBy: {
      scheduledAt: 'desc'
    },
    take: 100
  });

  // Get user's performance data
  const performance = await db.studentPerformance.findMany({
    where: {
      userId
    },
    orderBy: {
      date: 'desc'
    },
    take: 50
  });

  // Get user's learning plans
  const learningPlans = await db.learningPlan.findMany({
    where: {
      studentId: userId,
      status: 'ACTIVE'
    },
    include: {
      goals: {
        include: {
          milestones: true
        }
      }
    }
  });

  // Get user's AI conversations
  const aiConversations = await db.aIConversation.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  });

  return {
    sessions,
    performance,
    learningPlans,
    aiConversations,
    summary: {
      totalSessions: sessions.length,
      avgRating: sessions.length > 0 && sessions.some(s => s.review)
        ? sessions.filter(s => s.review).reduce((sum, s) => sum + (s.review?.rating || 0), 0) / sessions.filter(s => s.review).length
        : 0,
      totalHours: sessions.reduce((sum, s) => sum + s.duration, 0) / 60,
      activeGoals: learningPlans.reduce((sum, plan) => sum + plan.goals.filter(g => g.status !== 'completed').length, 0),
      completedGoals: learningPlans.reduce((sum, plan) => sum + plan.goals.filter(g => g.status === 'completed').length, 0)
    }
  };
}

async function generateAIPrediction(predictionType: string, learningData: any) {
  try {
    const zai = await ZAI.create();
    
    const prompt = `
    Analyze the following student learning data and generate a ${predictionType.toLowerCase().replace('_', ' ')} prediction:
    
    Student Learning Data:
    - Total Sessions: ${learningData.summary.totalSessions}
    - Average Rating: ${learningData.summary.avgRating.toFixed(1)}
    - Total Learning Hours: ${learningData.summary.totalHours.toFixed(1)}
    - Active Goals: ${learningData.summary.activeGoals}
    - Completed Goals: ${learningData.summary.completedGoals}
    
    Recent Sessions: ${learningData.sessions.slice(0, 5).map(s => `${s.title} (${s.duration}min)`).join(', ')}
    
    Performance Metrics: ${learningData.performance.slice(0, 3).map(p => `${p.subject}: ${p.avgGrade}`).join(', ')}
    
    Generate a prediction in JSON format with the following structure:
    {
      "predictedValue": "string or number",
      "confidence": number (0-100),
      "timeframe": "string",
      "factors": ["array of influencing factors"],
      "recommendations": ["array of actionable recommendations"]
    }
    
    For PERFORMANCE prediction: predict grade improvement or academic performance
    For DROPOUT_RISK prediction: predict risk percentage and likelihood
    For LEARNING_PACE prediction: predict optimal learning pace and speed
    For OPTIMAL_PATH prediction: predict best learning path and next steps
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI learning analytics expert that generates accurate educational predictions based on student data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    try {
      const parsed = JSON.parse(aiResponse);
      return {
        prediction: {
          value: parsed.predictedValue,
          confidence: parsed.confidence,
          timeframe: parsed.timeframe
        },
        factors: parsed.factors,
        recommendations: parsed.recommendations
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to rule-based prediction
      return generateRuleBasedPrediction(predictionType, learningData);
    }
  } catch (error) {
    console.error('AI prediction generation error:', error);
    // Fallback to rule-based prediction
    return generateRuleBasedPrediction(predictionType, learningData);
  }
}

function generateRuleBasedPrediction(predictionType: string, learningData: any) {
  const { summary } = learningData;
  
  switch (predictionType) {
    case 'PERFORMANCE':
      const performanceScore = calculatePerformanceScore(learningData);
      const predictedGrade = performanceScore > 80 ? 'A' : performanceScore > 70 ? 'B' : performanceScore > 60 ? 'C' : 'D';
      
      return {
        prediction: {
          value: predictedGrade,
          confidence: Math.min(performanceScore + 10, 95),
          timeframe: '3 months'
        },
        factors: [
          `Current performance score: ${performanceScore}%`,
          `Session consistency: ${summary.totalSessions > 10 ? 'High' : 'Low'}`,
          `Rating average: ${summary.avgRating.toFixed(1)}/5`
        ],
        recommendations: [
          'Maintain consistent session schedule',
          'Focus on areas with lower performance',
          'Set specific learning goals'
        ]
      };
      
    case 'DROPOUT_RISK':
      const riskScore = calculateDropoutRisk(learningData);
      
      return {
        prediction: {
          value: `${riskScore}%`,
          confidence: 85,
          timeframe: '6 months'
        },
        factors: [
          `Session frequency: ${summary.totalSessions}`,
          `Goal completion rate: ${summary.completedGoals / (summary.completedGoals + summary.activeGoals) * 100 || 0}%`,
          `Engagement level: ${summary.avgRating > 4 ? 'High' : 'Low'}`
        ],
        recommendations: riskScore > 30 ? [
          'Increase session frequency',
          'Set smaller, achievable goals',
          'Consider additional support resources'
        ] : [
          'Maintain current engagement level',
          'Continue with current learning plan'
        ]
      };
      
    case 'LEARNING_PACE':
      const currentPace = summary.totalHours / Math.max(summary.totalSessions, 1);
      const optimalPace = currentPace > 2 ? 'Fast' : currentPace > 1 ? 'Optimal' : 'Slow';
      
      return {
        prediction: {
          value: optimalPace,
          confidence: 75,
          timeframe: 'Current'
        },
        factors: [
          `Average session duration: ${currentPace.toFixed(1)} hours`,
          `Total learning hours: ${summary.totalHours}`,
          `Session consistency: ${summary.totalSessions > 10 ? 'Consistent' : 'Inconsistent'}`
        ],
        recommendations: optimalPace === 'Slow' ? [
          'Increase session duration',
          'Add more frequent sessions',
          'Focus on intensive learning periods'
        ] : optimalPace === 'Fast' ? [
          'Maintain current pace',
          'Ensure adequate rest between sessions',
          'Monitor for burnout signs'
        ] : [
          'Maintain current optimal pace',
          'Continue with balanced learning approach'
        ]
      };
      
    case 'OPTIMAL_PATH':
      const weakAreas = identifyWeakAreas(learningData);
      const strongAreas = identifyStrongAreas(learningData);
      
      return {
        prediction: {
          value: `Focus on ${weakAreas[0] || 'general improvement'}`,
          confidence: 80,
          timeframe: 'Next 30 days'
        },
        factors: [
          `Strong areas: ${strongAreas.slice(0, 2).join(', ')}`,
          `Weak areas: ${weakAreas.slice(0, 2).join(', ')}`,
          `Current goals: ${summary.activeGoals} active`
        ],
        recommendations: [
          `Prioritize ${weakAreas[0] || 'skill development'}`,
          `Leverage strengths in ${strongAreas[0] || 'existing areas'}`,
          'Set specific milestones for improvement'
        ]
      };
      
    default:
      throw new Error('Unknown prediction type');
  }
}

function calculatePerformanceScore(learningData: any): number {
  const { summary, performance } = learningData;
  
  let score = 0;
  
  // Rating contribution (40%)
  score += Math.min(summary.avgRating * 20, 40);
  
  // Session consistency (30%)
  score += Math.min(summary.totalSessions * 2, 30);
  
  // Goal completion (20%)
  const goalCompletionRate = summary.completedGoals / (summary.completedGoals + summary.activeGoals) || 0;
  score += goalCompletionRate * 20;
  
  // Performance grades (10%)
  if (performance.length > 0) {
    const avgGrade = performance.reduce((sum: number, p: any) => sum + (p.avgGrade || 0), 0) / performance.length;
    score += Math.min(avgGrade * 2, 10);
  }
  
  return Math.round(score);
}

function calculateDropoutRisk(learningData: any): number {
  const { summary } = learningData;
  
  let riskScore = 0;
  
  // Low session frequency increases risk
  if (summary.totalSessions < 5) riskScore += 30;
  else if (summary.totalSessions < 10) riskScore += 15;
  
  // Low ratings increase risk
  if (summary.avgRating < 3) riskScore += 25;
  else if (summary.avgRating < 4) riskScore += 10;
  
  // Low goal completion increases risk
  const goalCompletionRate = summary.completedGoals / (summary.completedGoals + summary.activeGoals) || 0;
  if (goalCompletionRate < 0.3) riskScore += 20;
  else if (goalCompletionRate < 0.6) riskScore += 10;
  
  // Low engagement increases risk
  if (summary.totalHours < 10) riskScore += 15;
  
  return Math.min(riskScore, 100);
}

function identifyWeakAreas(learningData: any): string[] {
  const { performance } = learningData;
  
  if (performance.length === 0) return ['General improvement'];
  
  // Find subjects with lowest grades
  const subjectGrades = performance.reduce((acc: any, p: any) => {
    if (!acc[p.subject] || acc[p.subject] > p.avgGrade) {
      acc[p.subject] = p.avgGrade;
    }
    return acc;
  }, {});
  
  return Object.entries(subjectGrades)
    .sort(([,a], [,b]) => (a as number) - (b as number))
    .slice(0, 3)
    .map(([subject]) => subject);
}

function identifyStrongAreas(learningData: any): string[] {
  const { performance } = learningData;
  
  if (performance.length === 0) return ['Current strengths'];
  
  // Find subjects with highest grades
  const subjectGrades = performance.reduce((acc: any, p: any) => {
    if (!acc[p.subject] || acc[p.subject] < p.avgGrade) {
      acc[p.subject] = p.avgGrade;
    }
    return acc;
  }, {});
  
  return Object.entries(subjectGrades)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([subject]) => subject);
}