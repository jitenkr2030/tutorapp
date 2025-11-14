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

    // Check if user is authorized to start this session
    const isTutor = sessionData.tutorId === sessionData.tutor.userId;
    const isStudent = sessionData.studentId === sessionData.student.userId;

    if (!isTutor && !isStudent) {
      return NextResponse.json({ error: 'Unauthorized to start this session' }, { status: 403 });
    }

    // Check if session can be started
    if (sessionData.status !== 'SCHEDULED') {
      return NextResponse.json({ 
        error: `Session cannot be started. Current status: ${sessionData.status}` 
      }, { status: 400 });
    }

    // Check if it's time to start the session (within 15 minutes)
    const now = new Date();
    const sessionTime = new Date(sessionData.scheduledAt);
    const timeDiff = Math.abs(now.getTime() - sessionTime.getTime());
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 15 && now < sessionTime) {
      return NextResponse.json({ 
        error: 'Session can only be started within 15 minutes of scheduled time' 
      }, { status: 400 });
    }

    // Generate meeting link if not exists
    let meetingLink = sessionData.meetingLink;
    if (!meetingLink) {
      meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/session/${sessionId}/video`;
    }

    // Update session status
    const updatedSession = await db.session.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
        meetingLink,
        // Add actual start time
        // Note: You might want to add a startedAt field to the schema
      },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Create notification for the other participant
    const participantId = isTutor ? sessionData.student.userId : sessionData.tutor.userId;
    const participantName = isTutor ? sessionData.student.user.name : sessionData.tutor.user.name;
    const starterName = isTutor ? sessionData.tutor.user.name : sessionData.student.user.name;

    await db.notification.create({
      data: {
        userId: participantId,
        type: 'SESSION_REMINDER',
        title: 'Session Started',
        message: `${starterName} has started the session "${sessionData.title}". Join now!`,
        read: false
      }
    });

    // Log session start event
    console.log(`Session ${sessionId} started by ${session.user.name} at ${new Date().toISOString()}`);

    return NextResponse.json({
      message: 'Session started successfully',
      session: updatedSession,
      meetingLink,
      participant: {
        id: participantId,
        name: participantName
      }
    });

  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}