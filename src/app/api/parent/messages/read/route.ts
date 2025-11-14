import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tutorId, studentId } = await request.json();

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

    // Mark messages from this tutor as read
    await db.message.updateMany({
      where: {
        senderId: tutorId,
        receiverId: session.user.id,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({ message: 'Messages marked as read' });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}