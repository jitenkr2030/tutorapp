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

    // Check if user is authorized to join this session
    const isTutor = sessionData.tutorId === sessionData.tutor.userId;
    const isStudent = sessionData.studentId === sessionData.student.userId;

    if (!isTutor && !isStudent) {
      return NextResponse.json({ error: 'Unauthorized to join this session' }, { status: 403 });
    }

    // Check if session can be joined
    if (sessionData.status === 'COMPLETED' || sessionData.status === 'CANCELLED') {
      return NextResponse.json({ 
        error: `Session cannot be joined. Current status: ${sessionData.status}` 
      }, { status: 400 });
    }

    // Check if it's time to join the session (within 30 minutes)
    const now = new Date();
    const sessionTime = new Date(sessionData.scheduledAt);
    const sessionEndTime = new Date(sessionTime.getTime() + sessionData.duration * 60000);
    
    const timeBeforeStart = sessionTime.getTime() - now.getTime();
    const timeAfterEnd = now.getTime() - sessionEndTime.getTime();
    const minutesBeforeStart = Math.floor(timeBeforeStart / (1000 * 60));
    const minutesAfterEnd = Math.floor(timeAfterEnd / (1000 * 60));

    if (minutesBeforeStart > 30) {
      return NextResponse.json({ 
        error: 'Session can only be joined within 30 minutes of scheduled time' 
      }, { status: 400 });
    }

    if (minutesAfterEnd > 15) {
      return NextResponse.json({ 
        error: 'Session join period has ended (15 minutes after scheduled end time)' 
      }, { status: 400 });
    }

    // Generate meeting link if not exists
    let meetingLink = sessionData.meetingLink;
    if (!meetingLink) {
      meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/session/${sessionId}/video`;
      
      // Update session with meeting link
      await db.session.update({
        where: { id: sessionId },
        data: { meetingLink }
      });
    }

    // If session is still scheduled and it's time to start, auto-start it
    if (sessionData.status === 'SCHEDULED' && minutesBeforeStart <= 15 && minutesBeforeStart >= -15) {
      await db.session.update({
        where: { id: sessionId },
        data: { status: 'IN_PROGRESS' }
      });

      // Notify the other participant
      const participantId = isTutor ? sessionData.student.userId : sessionData.tutor.userId;
      const joinerName = isTutor ? sessionData.tutor.user.name : sessionData.student.user.name;

      await db.notification.create({
        data: {
          userId: participantId,
          type: 'SESSION_REMINDER',
          title: 'Session Starting',
          message: `${joinerName} has joined the session "${sessionData.title}". Please join now!`,
          read: false
        }
      });
    }

    // Log session join event
    console.log(`User ${session.user.name} joined session ${sessionId} at ${new Date().toISOString()}`);

    // Return session information needed for video call
    return NextResponse.json({
      message: 'Successfully joined session',
      session: {
        id: sessionData.id,
        title: sessionData.title,
        status: sessionData.status,
        meetingLink,
        scheduledAt: sessionData.scheduledAt,
        duration: sessionData.duration,
        type: sessionData.type
      },
      participants: {
        tutor: {
          id: sessionData.tutor.userId,
          name: sessionData.tutor.user.name,
          email: sessionData.tutor.user.email
        },
        student: {
          id: sessionData.student.userId,
          name: sessionData.student.user.name,
          email: sessionData.student.user.email
        }
      },
      userRole: isTutor ? 'tutor' : 'student',
      canStart: sessionData.status === 'SCHEDULED' && isTutor,
      timeUntilStart: Math.max(0, minutesBeforeStart),
      timeUntilEnd: Math.max(0, -minutesAfterEnd)
    });

  } catch (error) {
    console.error('Error joining session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}