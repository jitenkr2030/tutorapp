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
    const insightType = searchParams.get('type') || 'all';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Check if user has permission to access the requested user's insights
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build where clause
    const whereClause: any = { userId };
    if (insightType !== 'all') {
      whereClause.insightType = insightType;
    }
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Get learning insights
    const insights = await db.learningInsight.findMany({
      where: whereClause,
      orderBy: [
        { importance: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    });

    return NextResponse.json({
      insights,
      summary: {
        total: insights.length,
        unread: insights.filter(i => !i.isRead).length,
        byType: insights.reduce((acc, i) => {
          acc[i.insightType] = (acc[i.insightType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        avgImportance: insights.length > 0
          ? insights.reduce((sum, i) => sum + i.importance, 0) / insights.length
          : 0,
        actionableCount: insights.filter(i => i.actionable).length
      }
    });
  } catch (error) {
    console.error('Learning insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning insights' },
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
    const { insightType, generateWithAI = true, customData } = body;

    if (!insightType || !['LEARNING_PATTERN', 'STRENGTH', 'WEAKNESS', 'OPPORTUNITY'].includes(insightType)) {
      return NextResponse.json(
        { error: 'Invalid insight type' },
        { status: 400 }
      );
    }

    // Get user's learning data
    const userLearningData = await getUserLearningData(session.user.id, customData);

    let insightTitle: string;
    let insightDescription: string;
    let insightData: any;
    let importance: number;

    if (generateWithAI) {
      // Generate insight using AI
      const aiResult = await generateAIInsight(insightType, userLearningData);
      insightTitle = aiResult.title;
      insightDescription = aiResult.description;
      insightData = aiResult.data;
      importance = aiResult.importance;
    } else {
      // Generate insight using rule-based logic
      const ruleBasedResult = generateRuleBasedInsight(insightType, userLearningData);
      insightTitle = ruleBasedResult.title;
      insightDescription = ruleBasedResult.description;
      insightData = ruleBasedResult.data;
      importance = ruleBasedResult.importance;
    }

    // Store the insight
    const insight = await db.learningInsight.create({
      data: {
        userId: session.user.id,
        insightType,
        title: insightTitle,
        description: insightDescription,
        data: insightData,
        importance,
        actionable: true
      }
    });

    return NextResponse.json({
      insight,
      message: 'Learning insight generated successfully'
    });
  } catch (error) {
    console.error('Create learning insight API error:', error);
    return NextResponse.json(
      { error: 'Failed to create learning insight' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { insightIds, isRead } = body;

    if (!Array.isArray(insightIds) || typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update insights read status
    const updatedInsights = await db.learningInsight.updateMany({
      where: {
        id: {
          in: insightIds
        },
        userId: session.user.id
      },
      data: {
        isRead
      }
    });

    return NextResponse.json({
      updatedCount: updatedInsights.count,
      message: `Marked ${updatedInsights.count} insights as ${isRead ? 'read' : 'unread'}`
    });
  } catch (error) {
    console.error('Update learning insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to update learning insights' },
      { status: 500 }
    );
  }
}

async function getUserLearningData(userId: string, customData?: any) {
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
    customData,
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

async function generateAIInsight(insightType: string, learningData: any) {
  try {
    const zai = await ZAI.create();
    
    const prompt = `
    Analyze the following student learning data and generate a ${insightType.toLowerCase().replace('_', ' ')} insight:
    
    Student Learning Data:
    - Total Sessions: ${learningData.summary.totalSessions}
    - Average Rating: ${learningData.summary.avgRating.toFixed(1)}
    - Total Learning Hours: ${learningData.summary.totalHours.toFixed(1)}
    - Active Goals: ${learningData.summary.activeGoals}
    - Completed Goals: ${learningData.summary.completedGoals}
    
    Recent Sessions: ${learningData.sessions.slice(0, 5).map(s => `${s.title} (${s.duration}min)`).join(', ')}
    
    Performance Metrics: ${learningData.performance.slice(0, 3).map(p => `${p.subject}: ${p.avgGrade}`).join(', ')}
    
    Generate an insight in JSON format with the following structure:
    {
      "title": "concise insight title",
      "description": "detailed description of the insight",
      "data": {
        "keyMetrics": {},
        "supportingData": {},
        "trends": []
      },
      "importance": number (1-10)
    }
    
    For LEARNING_PATTERN insight: identify patterns in learning behavior, session timing, subject preferences
    For STRENGTH insight: identify areas where the student excels or shows exceptional performance
    For WEAKNESS insight: identify areas where the student struggles or needs improvement
    For OPPORTUNITY insight: identify opportunities for growth, optimization, or new learning paths
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI learning analytics expert that generates insightful educational observations based on student data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 600
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    try {
      const parsed = JSON.parse(aiResponse);
      return {
        title: parsed.title,
        description: parsed.description,
        data: parsed.data,
        importance: Math.max(1, Math.min(10, parsed.importance || 5))
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to rule-based insight
      return generateRuleBasedInsight(insightType, learningData);
    }
  } catch (error) {
    console.error('AI insight generation error:', error);
    // Fallback to rule-based insight
    return generateRuleBasedInsight(insightType, learningData);
  }
}

function generateRuleBasedInsight(insightType: string, learningData: any) {
  const { summary, sessions, performance } = learningData;
  
  switch (insightType) {
    case 'LEARNING_PATTERN':
      const sessionPattern = analyzeSessionPattern(sessions);
      return {
        title: `Consistent ${sessionPattern.pattern} Learning Pattern`,
        description: `You show a ${sessionPattern.pattern.toLowerCase()} pattern in your learning sessions, with peak activity during ${sessionPattern.peakTimes.join(' and ')}.`,
        data: {
          keyMetrics: {
            avgSessionLength: sessionPattern.avgDuration,
            preferredDays: sessionPattern.preferredDays,
            consistencyScore: sessionPattern.consistencyScore
          },
          supportingData: {
            totalSessions: summary.totalSessions,
            weeklyDistribution: sessionPattern.weeklyDistribution
          },
          trends: [
            `Most active on ${sessionPattern.mostActiveDay}`,
            `Average session length: ${sessionPattern.avgDuration} minutes`,
            `${sessionPattern.consistencyScore > 70 ? 'High' : sessionPattern.consistencyScore > 40 ? 'Medium' : 'Low'} consistency`
          ]
        },
        importance: sessionPattern.consistencyScore > 70 ? 8 : sessionPattern.consistencyScore > 40 ? 6 : 4
      };
      
    case 'STRENGTH':
      const strengths = identifyStrengths(learningData);
      return {
        title: `Excellence in ${strengths.topArea}`,
        description: `You demonstrate exceptional performance in ${strengths.topArea.toLowerCase()} with ${strengths.metrics.join(', ')}.`,
        data: {
          keyMetrics: {
            topArea: strengths.topArea,
            performanceScore: strengths.performanceScore,
            consistency: strengths.consistency
          },
          supportingData: {
            relatedSessions: strengths.relatedSessions,
            avgRating: strengths.avgRating
          },
          trends: [
            `Performance score: ${strengths.performanceScore}%`,
            `Consistency: ${strengths.consistency > 70 ? 'High' : 'Medium'}`,
            `Related sessions: ${strengths.relatedSessions}`
          ]
        },
        importance: strengths.performanceScore > 80 ? 9 : strengths.performanceScore > 70 ? 7 : 5
      };
      
    case 'WEAKNESS':
      const weaknesses = identifyWeaknesses(learningData);
      return {
        title: `Area for Improvement: ${weaknesses.weakArea}`,
        description: `You show opportunities for growth in ${weaknesses.weakArea.toLowerCase()}. Focus on ${weaknesses.improvementAreas.join(' and ')} to enhance performance.`,
        data: {
          keyMetrics: {
            weakArea: weaknesses.weakArea,
            currentPerformance: weaknesses.currentPerformance,
            potential: weaknesses.potential
          },
          supportingData: {
            relatedSessions: weaknesses.relatedSessions,
            improvementNeeded: weaknesses.improvementNeeded
          },
          trends: [
            `Current performance: ${weaknesses.currentPerformance}%`,
            `Potential improvement: ${weaknesses.potential}%`,
            `Sessions needing focus: ${weaknesses.relatedSessions}`
          ]
        },
        importance: weaknesses.improvementNeeded > 30 ? 8 : weaknesses.improvementNeeded > 15 ? 6 : 4
      };
      
    case 'OPPORTUNITY':
      const opportunities = identifyOpportunities(learningData);
      return {
        title: `Growth Opportunity: ${opportunities.opportunity}`,
        description: `You have a significant opportunity to ${opportunities.opportunity.toLowerCase()}. This could lead to ${opportunities.expectedOutcomes.join(' and ')}.`,
        data: {
          keyMetrics: {
            opportunity: opportunities.opportunity,
            potentialImpact: opportunities.potentialImpact,
            timeframe: opportunities.timeframe
          },
          supportingData: {
            currentBasis: opportunities.currentBasis,
            requiredActions: opportunities.requiredActions
          },
          trends: [
            `Potential impact: ${opportunities.potentialImpact}`,
            `Timeframe: ${opportunities.timeframe}`,
            `Current foundation: ${opportunities.currentBasis}`
          ]
        },
        importance: opportunities.potentialImpact === 'High' ? 9 : opportunities.potentialImpact === 'Medium' ? 7 : 5
      };
      
    default:
      throw new Error('Unknown insight type');
  }
}

function analyzeSessionPattern(sessions: any[]) {
  if (sessions.length === 0) {
    return {
      pattern: 'No Data',
      peakTimes: [],
      avgDuration: 0,
      consistencyScore: 0,
      preferredDays: [],
      weeklyDistribution: {},
      mostActiveDay: 'N/A'
    };
  }

  // Analyze session timing
  const hourlyDistribution = new Array(24).fill(0);
  const dailyDistribution = new Array(7).fill(0); // 0 = Sunday
  
  sessions.forEach(session => {
    const date = new Date(session.scheduledAt);
    const hour = date.getHours();
    const day = date.getDay();
    
    hourlyDistribution[hour]++;
    dailyDistribution[day]++;
  });

  // Find peak times
  const peakHours = hourlyDistribution
    .map((count, hour) => ({ hour, count }))
    .filter(item => item.count > sessions.length * 0.1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const peakDays = dailyDistribution
    .map((count, day) => ({ day, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const peakTimes = peakHours.map(h => `${h.hour}:00`);
  const preferredDays = peakDays.map(d => dayNames[d.day]);
  const mostActiveDay = dayNames[peakDays[0]?.day] || 'N/A';

  // Calculate average duration
  const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

  // Calculate consistency score
  const sessionCountsByWeek = new Map();
  sessions.forEach(session => {
    const week = getWeekNumber(new Date(session.scheduledAt));
    sessionCountsByWeek.set(week, (sessionCountsByWeek.get(week) || 0) + 1);
  });

  const weeklyCounts = Array.from(sessionCountsByWeek.values());
  const avgWeeklySessions = weeklyCounts.reduce((sum, count) => sum + count, 0) / weeklyCounts.length;
  const variance = weeklyCounts.reduce((sum, count) => sum + Math.pow(count - avgWeeklySessions, 2), 0) / weeklyCounts.length;
  const consistencyScore = Math.max(0, 100 - Math.sqrt(variance) * 10);

  return {
    pattern: consistencyScore > 70 ? 'Consistent' : consistencyScore > 40 ? 'Variable' : 'Irregular',
    peakTimes,
    avgDuration: Math.round(avgDuration),
    consistencyScore: Math.round(consistencyScore),
    preferredDays,
    weeklyDistribution: Object.fromEntries(dailyDistribution.map((count, day) => [dayNames[day], count])),
    mostActiveDay
  };
}

function identifyStrengths(learningData: any) {
  const { performance, sessions } = learningData;
  
  if (performance.length === 0) {
    return {
      topArea: 'General Learning',
      performanceScore: 60,
      consistency: 50,
      relatedSessions: 0,
      avgRating: 0
    };
  }

  // Find best performing subject
  const subjectPerformance = performance.reduce((acc: any, p: any) => {
    if (!acc[p.subject] || acc[p.subject].avgGrade < p.avgGrade) {
      acc[p.subject] = {
        avgGrade: p.avgGrade,
        sessions: sessions.filter(s => s.title.includes(p.subject)).length
      };
    }
    return acc;
  }, {});

  const topSubject = Object.entries(subjectPerformance)
    .sort(([,a], [,b]) => (b as any).avgGrade - (a as any).avgGrade)[0];

  const topArea = topSubject[0];
  const topPerformance = (topSubject[1] as any).avgGrade;
  const relatedSessions = (topSubject[1] as any).sessions;
  
  // Calculate consistency
  const consistency = relatedSessions > 5 ? 80 : relatedSessions > 2 ? 60 : 40;
  
  // Get average rating for related sessions
  const relatedSessionRatings = sessions
    .filter(s => s.title.includes(topArea) && s.review)
    .map(s => s.review?.rating || 0);
  const avgRating = relatedSessionRatings.length > 0 
    ? relatedSessionRatings.reduce((sum, r) => sum + r, 0) / relatedSessionRatings.length 
    : 0;

  return {
    topArea,
    performanceScore: Math.round(topPerformance),
    consistency,
    relatedSessions,
    avgRating: Math.round(avgRating * 10) / 10
  };
}

function identifyWeaknesses(learningData: any) {
  const { performance, sessions } = learningData;
  
  if (performance.length === 0) {
    return {
      weakArea: 'General Learning',
      currentPerformance: 50,
      potential: 80,
      relatedSessions: 0,
      improvementNeeded: 30
    };
  }

  // Find worst performing subject
  const subjectPerformance = performance.reduce((acc: any, p: any) => {
    if (!acc[p.subject] || acc[p.subject].avgGrade > p.avgGrade) {
      acc[p.subject] = {
        avgGrade: p.avgGrade,
        sessions: sessions.filter(s => s.title.includes(p.subject)).length
      };
    }
    return acc;
  }, {});

  const weakSubject = Object.entries(subjectPerformance)
    .sort(([,a], [,b]) => (a as any).avgGrade - (b as any).avgGrade)[0];

  const weakArea = weakSubject[0];
  const currentPerformance = (weakSubject[1] as any).avgGrade;
  const relatedSessions = (weakSubject[1] as any).sessions;
  
  // Calculate potential improvement
  const potential = Math.min(95, currentPerformance + 25);
  const improvementNeeded = potential - currentPerformance;

  const improvementAreas = [];
  if (currentPerformance < 70) improvementAreas.push('concept understanding');
  if (relatedSessions < 3) improvementAreas.push('practice frequency');
  if (currentPerformance < 60) improvementAreas.push('foundational skills');

  return {
    weakArea,
    currentPerformance: Math.round(currentPerformance),
    potential: Math.round(potential),
    relatedSessions,
    improvementNeeded: Math.round(improvementNeeded),
    improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['general improvement']
  };
}

function identifyOpportunities(learningData: any) {
  const { summary, sessions, performance } = learningData;
  
  // Identify potential opportunities based on data patterns
  const opportunities = [];
  
  if (summary.totalSessions < 10) {
    opportunities.push({
      opportunity: 'Increase Learning Frequency',
      potentialImpact: 'High',
      timeframe: '3 months',
      currentBasis: 'Low session count indicates room for growth',
      requiredActions: ['Schedule regular sessions', 'Set learning goals']
    });
  }
  
  if (summary.avgRating < 4.0 && summary.totalSessions > 5) {
    opportunities.push({
      opportunity: 'Enhance Session Quality',
      potentialImpact: 'Medium',
      timeframe: '2 months',
      currentBasis: 'Below-average ratings suggest quality issues',
      requiredActions: ['Provide feedback to tutors', 'Adjust learning approach']
    });
  }
  
  if (performance.length > 0) {
    const avgGrade = performance.reduce((sum: number, p: any) => sum + p.avgGrade, 0) / performance.length;
    if (avgGrade < 75) {
      opportunities.push({
        opportunity: 'Academic Performance Improvement',
        potentialImpact: 'High',
        timeframe: '6 months',
        currentBasis: 'Below-average performance across subjects',
        requiredActions: ['Focus on weak areas', 'Increase study time']
      });
    }
  }
  
  // Default opportunity if none identified
  if (opportunities.length === 0) {
    opportunities.push({
      opportunity: 'Advanced Skill Development',
      potentialImpact: 'Medium',
      timeframe: '4 months',
      currentBasis: 'Solid foundation ready for advanced topics',
      requiredActions: ['Explore advanced concepts', 'Take on challenging projects']
    });
  }
  
  const opportunity = opportunities[0];
  
  return {
    opportunity: opportunity.opportunity,
    potentialImpact: opportunity.potentialImpact,
    timeframe: opportunity.timeframe,
    currentBasis: opportunity.currentBasis,
    requiredActions: opportunity.requiredActions,
    expectedOutcomes: ['Improved performance', 'Enhanced skills', 'Better understanding']
  };
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}