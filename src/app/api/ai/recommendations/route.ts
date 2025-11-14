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

    const { userId, type, context } = await request.json();

    // Get user profile
    const user = await db.user.findUnique({
      where: { id: userId || session.user.id },
      include: {
        studentProfile: true,
        tutorProfile: true,
        studentLearningPlans: {
          include: {
            goals: true
          }
        },
        studentProgressReports: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's session history for context
    const sessions = await db.session.findMany({
      where: {
        OR: [
          { tutorId: user.id },
          { studentId: user.id }
        ],
        status: 'COMPLETED'
      },
      include: {
        review: true,
        tutor: {
          include: {
            subjects: {
              include: {
                subject: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      take: 10
    });

    // Prepare data for AI recommendations
    const recommendationData = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        profile: user.studentProfile || user.tutorProfile,
        learningPlans: user.studentLearningPlans,
        recentProgress: user.studentProgressReports
      },
      sessions: sessions.map(session => ({
        subject: session.title,
        duration: session.duration,
        rating: session.review?.rating,
        tutorSubjects: session.tutor?.subjects.map(s => s.subject.name)
      })),
      type: type || 'LEARNING_CONTENT',
      context: context || {}
    };

    // Use AI for content recommendations
    const zai = await ZAI.create();
    
    const prompt = `
    You are an expert educational AI specializing in personalized learning recommendations. 
    Analyze the user profile and learning history to provide personalized recommendations.
    
    User Profile:
    ${JSON.stringify(recommendationData.user, null, 2)}
    
    Session History:
    ${JSON.stringify(recommendationData.sessions, null, 2)}
    
    Recommendation Type: ${recommendationData.type}
    Additional Context: ${JSON.stringify(recommendationData.context, null, 2)}
    
    Please provide personalized recommendations based on:
    1. User's learning history and progress
    2. Subject preferences and performance patterns
    3. Learning goals and current plans
    4. Areas for improvement and growth opportunities
    
    Format your response as JSON with the following structure:
    {
      "recommendations": [
        {
          "title": "Recommendation Title",
          "description": "Detailed description of the recommendation",
          "type": "LEARNING_CONTENT|STUDY_PLAN|CAREER_PATH",
          "priority": "high|medium|low",
          "content": {
            "subjects": ["subject1", "subject2"],
            "resources": ["resource1", "resource2"],
            "actionItems": ["action1", "action2"],
            "estimatedTime": "2-3 hours",
            "difficulty": "beginner|intermediate|advanced"
          },
          "reasoning": "Why this recommendation is suitable for the user"
        }
      ],
      "insights": [
        "Key insight about user's learning pattern",
        "Another insight about progress"
      ],
      "nextSteps": [
        "Immediate next step",
        "Follow-up recommendation"
      ]
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational AI specializing in personalized learning recommendations.'
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
        insights: [],
        nextSteps: []
      };
    }

    // Store recommendations in database
    const storedRecommendations = await Promise.all(
      aiResponse.recommendations.map((rec: any) =>
        db.aIRecommendation.create({
          data: {
            userId: user.id,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            content: JSON.stringify(rec.content),
            priority: rec.priority
          }
        })
      )
    );

    // Enhance response with database IDs
    const enhancedResponse = {
      ...aiResponse,
      recommendations: aiResponse.recommendations.map((rec: any, index: number) => ({
        ...rec,
        id: storedRecommendations[index]?.id,
        createdAt: storedRecommendations[index]?.createdAt,
        status: 'pending'
      }))
    };

    return NextResponse.json({
      recommendations: enhancedResponse.recommendations,
      insights: enhancedResponse.insights,
      nextSteps: enhancedResponse.nextSteps,
      totalRecommendations: enhancedResponse.recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const whereClause: any = { userId };
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const recommendations = await db.aIRecommendation.findMany({
      where: whereClause,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 20
    });

    return NextResponse.json({
      recommendations,
      total: recommendations.length
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}