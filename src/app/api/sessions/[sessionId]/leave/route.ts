import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = params.sessionId;
    const { reason } = await request.json();

    // Get session details
    const sessionData = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        tutor: {
          include: {
            user: true
          }
        },
        student: {
          include: {
            user: true
          }
        }
      }
    });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is authorized to leave this session
    const isTutor = sessionData.tutorId === sessionData.tutor.userId;
    const isStudent = sessionData.studentId === sessionData.student.userId;

    if (!isTutor && !isStudent) {
      return NextResponse.json({ error: 'Unauthorized to leave this session' }, { status: 403 });
    }

    // Check if session is in progress
    if (sessionData.status !== 'IN_PROGRESS') {
      return NextResponse.json({ 
        error: `Session is not in progress. Current status: ${sessionData.status}` 
      }, { status: 400 });
    }

    // Create notification for the other participant
    const participantId = isTutor ? sessionData.student.userId : sessionData.tutor.userId;
    const participantName = isTutor ? sessionData.student.user.name : sessionData.tutor.user.name;
    const leaverName = isTutor ? sessionData.tutor.user.name : sessionData.student.user.name;

    await db.notification.create({
      data: {
        userId: participantId,
        type: 'SYSTEM_UPDATE',
        title: 'Participant Left',
        message: `${leaverName} has left the session "${sessionData.title}". ${reason ? `Reason: ${reason}` : ''}`,
        read: false
      }
    });

    // If tutor leaves, consider ending the session
    if (isTutor) {
      // Optionally auto-end session when tutor leaves
      // Or mark it as tutor-abandoned
      console.log(`Tutor ${session.user.name} left session ${sessionId}`);
    }

    // Log session leave event
    console.log(`User ${session.user.name} left session ${sessionId} at ${new Date().toISOString()}`, { reason });

    return NextResponse.json({
      message: 'Successfully left session',
      session: {
        id: sessionData.id,
        title: sessionData.title,
        status: sessionData.status
      },
      participant: {
        id: participantId,
        name: participantName
      }
    });

  } catch (error) {
    console.error('Error leaving session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}