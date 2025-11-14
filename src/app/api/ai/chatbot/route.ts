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

    const { message, sessionId, context } = await request.json();

    // Get user profile and context
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentProfile: true,
        tutorProfile: true,
        studentLearningPlans: {
          include: {
            goals: true
          }
        },
        studentSessions: {
          where: { status: 'SCHEDULED' },
          include: {
            tutor: true
          },
          take: 5
        },
        tutorSessions: {
          where: { status: 'SCHEDULED' },
          include: {
            student: true
          },
          take: 5
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get session context if provided
    let sessionContext = null;
    if (sessionId) {
      sessionContext = await db.session.findUnique({
        where: { id: sessionId },
        include: {
          tutor: true,
          student: true,
          booking: true
        }
      });
    }

    // Get recent chat history for context
    const recentChats = await db.aIChatbot.findMany({
      where: {
        userId: user.id,
        ...(sessionId && { sessionId })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Prepare context for AI
    const chatContext = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        profile: user.studentProfile || user.tutorProfile,
        learningPlans: user.studentLearningPlans,
        upcomingSessions: user.role === 'STUDENT' ? user.studentSessions : user.tutorSessions
      },
      sessionContext,
      recentChats: recentChats.map(chat => ({
        message: chat.message,
        response: chat.response,
        intent: chat.intent
      })),
      currentMessage: message,
      additionalContext: context || {}
    };

    // Use AI for chatbot response
    const zai = await ZAI.create();
    
    const prompt = `
    You are an AI customer service assistant for an online tutoring platform. 
    Provide helpful, accurate, and friendly responses to user inquiries.
    
    User Context:
    ${JSON.stringify(chatContext.user, null, 2)}
    
    Session Context:
    ${JSON.stringify(sessionContext || {}, null, 2)}
    
    Recent Chat History:
    ${JSON.stringify(chatContext.recentChats, null, 2)}
    
    Current Message: "${message}"
    
    Additional Context:
    ${JSON.stringify(chatContext.additionalContext, null, 2)}
    
    Please respond to the user's message by:
    1. Understanding their intent (booking, scheduling, support, information, etc.)
    2. Providing accurate and helpful information
    3. Being friendly and professional
    4. Offering specific actions or next steps when appropriate
    5. Escalating to human support when necessary
    
    Format your response as JSON with the following structure:
    {
      "response": "Your friendly and helpful response to the user",
      "intent": "booking|scheduling|support|information|technical|billing|other",
      "confidence": 0.85,
      "suggestedActions": [
        {
          "type": "button|link|form",
          "label": "Book a Session",
          "action": "/book",
          "priority": "high"
        }
      ],
      "followUpQuestions": [
        "Would you like me to help you find a tutor?",
        "Do you have a specific subject in mind?"
      ],
      "escalation": {
        "needed": false,
        "reason": "",
        "department": "support"
      }
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI customer service assistant for an online tutoring platform. Be helpful, accurate, and friendly.'
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
        response: "I'm sorry, I'm having trouble understanding your request. Could you please rephrase that?",
        intent: 'other',
        confidence: 0.3,
        suggestedActions: [],
        followUpQuestions: [],
        escalation: { needed: false, reason: '', department: 'support' }
      };
    }

    // Store chat interaction in database
    const chatInteraction = await db.aIChatbot.create({
      data: {
        userId: user.id,
        sessionId,
        message,
        response: aiResponse.response,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence
      }
    });

    // If escalation is needed, create a support ticket
    if (aiResponse.escalation.needed) {
      await createSupportTicket(user, message, aiResponse.escalation.department);
    }

    return NextResponse.json({
      chatId: chatInteraction.id,
      response: aiResponse.response,
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      suggestedActions: aiResponse.suggestedActions,
      followUpQuestions: aiResponse.followUpQuestions,
      escalation: aiResponse.escalation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process chatbot request' },
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
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = { userId };
    if (sessionId) whereClause.sessionId = sessionId;

    const chats = await db.aIChatbot.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      chats,
      total: chats.length
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

async function createSupportTicket(user: any, message: string, department: string) {
  try {
    // In a real implementation, this would create a support ticket in your support system
    console.log(`Creating support ticket for user ${user.id} in department ${department}`);
    console.log(`Message: ${message}`);
    
    // For now, we'll just log it, but you could integrate with:
    // - Zendesk, Freshdesk, or other support systems
    // - Email notifications
    // - Internal ticketing system
    
    return {
      ticketId: `ticket-${Date.now()}`,
      status: 'created',
      department,
      userId: user.id
    };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return null;
  }
}