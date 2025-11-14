import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assistantId, message, conversationId, sessionId } = body;

    if (!assistantId || !message) {
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

    // Parse assistant data
    const expertise = JSON.parse(assistant.expertise);
    const capabilities = JSON.parse(assistant.capabilities);

    // Get or create conversation
    let conversation;
    let messages;

    if (conversationId) {
      // Update existing conversation
      conversation = await db.aIConversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
          assistantId
        }
      });

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      messages = JSON.parse(conversation.messages);
      messages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
    } else {
      // Create new conversation
      messages = [{
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }];

      conversation = await db.aIConversation.create({
        data: {
          assistantId,
          userId: session.user.id,
          sessionId,
          messages: JSON.stringify(messages),
          topicsCovered: JSON.stringify([])
        }
      });
    }

    // Generate AI response using z-ai-web-dev-sdk
    const zai = await ZAI.create();

    // Create system prompt based on assistant configuration
    const systemPrompt = `You are an AI tutor assistant specializing in ${assistant.subject}. 
Your teaching style is ${assistant.personality}.
Your areas of expertise include: ${expertise.join(', ')}.
Your capabilities include: ${capabilities.join(', ')}.

Provide helpful, educational responses that are appropriate for the student's level.
Be patient, encouraging, and provide clear explanations.
If appropriate, include examples or step-by-step explanations.
Keep your responses focused on educational content and maintain a professional, supportive tone.`;

    // Prepare conversation history for AI
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const aiResponse = completion.choices[0]?.message?.content || 
        "I apologize, but I'm having trouble responding right now. Please try again.";

      // Add AI response to messages
      messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      });

      // Extract topics covered (simple keyword extraction)
      const topics = extractTopics(message + ' ' + aiResponse, expertise);

      // Update conversation in database
      const updatedConversation = await db.aIConversation.update({
        where: {
          id: conversation.id
        },
        data: {
          messages: JSON.stringify(messages),
          topicsCovered: JSON.stringify(topics),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        conversation: {
          ...updatedConversation,
          messages: JSON.parse(updatedConversation.messages),
          topicsCovered: JSON.parse(updatedConversation.topicsCovered)
        },
        response: aiResponse
      });

    } catch (aiError) {
      console.error('AI service error:', aiError);
      
      // Fallback response if AI service fails
      const fallbackResponse = `I'm your ${assistant.subject} AI tutor assistant. I'm here to help you learn about ${expertise.join(', ')}. Could you please rephrase your question or try again?`;

      messages.push({
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date().toISOString()
      });

      const updatedConversation = await db.aIConversation.update({
        where: {
          id: conversation.id
        },
        data: {
          messages: JSON.stringify(messages),
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        conversation: {
          ...updatedConversation,
          messages: JSON.parse(updatedConversation.messages),
          topicsCovered: []
        },
        response: fallbackResponse,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error in AI tutor chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// Simple topic extraction function
function extractTopics(text: string, expertise: string[]): string[] {
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  expertise.forEach(topic => {
    const lowerTopic = topic.toLowerCase();
    if (lowerText.includes(lowerTopic)) {
      topics.push(topic);
    }
  });

  // Add some basic topic detection
  const commonTopics = [
    'algebra', 'calculus', 'geometry', 'physics', 'chemistry', 'biology',
    'literature', 'writing', 'grammar', 'history', 'science', 'mathematics'
  ];

  commonTopics.forEach(topic => {
    if (lowerText.includes(topic) && !topics.includes(topic)) {
      topics.push(topic);
    }
  });

  return topics.slice(0, 5); // Limit to 5 topics
}