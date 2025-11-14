import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { satisfaction } = body;

    if (typeof satisfaction !== 'number' || satisfaction < 1 || satisfaction > 5) {
      return NextResponse.json(
        { error: 'Satisfaction rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify the conversation belongs to the user
    const conversation = await db.aIConversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const updatedConversation = await db.aIConversation.update({
      where: {
        id: params.id
      },
      data: {
        satisfaction,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation rating:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation rating' },
      { status: 500 }
    );
  }
}