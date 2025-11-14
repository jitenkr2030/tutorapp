import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await db.aIConversation.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        assistant: {
          select: {
            id: true,
            subject: true,
            personality: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50 // Limit to last 50 conversations
    });

    // Parse JSON fields
    const parsedConversations = conversations.map(conv => ({
      ...conv,
      messages: JSON.parse(conv.messages),
      topicsCovered: conv.topicsCovered ? JSON.parse(conv.topicsCovered) : []
    }));

    return NextResponse.json(parsedConversations);
  } catch (error) {
    console.error('Error fetching AI conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI conversations' },
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
    const { assistantId, sessionId, messages, context, topicsCovered } = body;

    if (!assistantId || !messages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the assistant belongs to the user
    const assistant = await db.aITutorAssistant.findFirst({
      where: {
        id: assistantId,
        userId: session.user.id,
        isActive: true
      }
    });

    if (!assistant) {
      return NextResponse.json(
        { error: 'Assistant not found or access denied' },
        { status: 404 }
      );
    }

    const conversation = await db.aIConversation.create({
      data: {
        assistantId,
        userId: session.user.id,
        sessionId,
        messages: JSON.stringify(messages),
        context,
        topicsCovered: topicsCovered ? JSON.stringify(topicsCovered) : JSON.stringify([])
      }
    });

    const parsedConversation = {
      ...conversation,
      messages: JSON.parse(conversation.messages),
      topicsCovered: conversation.topicsCovered ? JSON.parse(conversation.topicsCovered) : []
    };

    return NextResponse.json(parsedConversation, { status: 201 });
  } catch (error) {
    console.error('Error creating AI conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create AI conversation' },
      { status: 500 }
    );
  }
}