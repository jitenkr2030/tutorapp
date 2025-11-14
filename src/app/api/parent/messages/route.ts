import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');

    if (!tutorId || !studentId) {
      return NextResponse.json({ error: 'Tutor ID and Student ID are required' }, { status: 400 });
    }

    // Check if user is a parent and has access to the student
    const parent = await db.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          where: { id: studentId }
        }
      }
    });

    if (!parent || parent.students.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await db.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: tutorId
          },
          {
            senderId: tutorId,
            receiverId: session.user.id
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content, studentId } = await request.json();

    if (!receiverId || !content || !studentId) {
      return NextResponse.json({ error: 'Receiver ID, content, and student ID are required' }, { status: 400 });
    }

    // Check if user is a parent and has access to the student
    const parent = await db.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          where: { id: studentId }
        }
      }
    });

    if (!parent || parent.students.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify the receiver is a tutor
    const tutor = await db.tutor.findUnique({
      where: { userId: receiverId }
    });

    if (!tutor) {
      return NextResponse.json({ error: 'Invalid tutor' }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        sessionId: null // Not associated with a specific session
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({ message });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}