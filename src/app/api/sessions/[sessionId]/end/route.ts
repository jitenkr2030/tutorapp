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
    const { reason, rating, feedback } = await request.json();

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
        },
        booking: {
          include: {
            payment: true
          }
        }
      }
    });

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is authorized to end this session
    const isTutor = sessionData.tutorId === sessionData.tutor.userId;
    const isStudent = sessionData.studentId === sessionData.student.userId;

    if (!isTutor && !isStudent) {
      return NextResponse.json({ error: 'Unauthorized to end this session' }, { status: 403 });
    }

    // Check if session is in progress
    if (sessionData.status !== 'IN_PROGRESS') {
      return NextResponse.json({ 
        error: `Session cannot be ended. Current status: ${sessionData.status}` 
      }, { status: 400 });
    }

    // Calculate session duration and actual cost
    const startTime = sessionData.scheduledAt; // You might want to track actual start time
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
    const actualDuration = Math.min(duration, sessionData.duration); // Don't exceed scheduled duration
    const actualCost = (actualDuration / sessionData.duration) * sessionData.price;

    // Update session status
    const updatedSession = await db.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        // Add actual end time and duration
        // Note: You might want to add endedAt and actualDuration fields to the schema
      },
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

    // Update booking status
    if (sessionData.booking) {
      await db.booking.update({
        where: { id: sessionData.booking.id },
        data: {
          status: 'COMPLETED'
        }
      });

      // Process payment adjustment if duration was different
      if (sessionData.booking.payment && actualCost !== sessionData.price) {
        await db.payment.update({
          where: { id: sessionData.booking.payment.id },
          data: {
            amount: actualCost,
            status: 'COMPLETED',
            paidAt: new Date()
          }
        });
      }
    }

    // Create review if provided
    if (rating && feedback) {
      const reviewerId = isStudent ? sessionData.student.userId : sessionData.tutor.userId;
      const revieweeId = isStudent ? sessionData.tutor.userId : sessionData.student.userId;

      await db.review.create({
        data: {
          sessionId,
          tutorId: sessionData.tutorId,
          studentId: sessionData.studentId,
          rating,
          comment: feedback,
          createdAt: new Date()
        }
      });
    }

    // Create notification for the other participant
    const participantId = isTutor ? sessionData.student.userId : sessionData.tutor.userId;
    const participantName = isTutor ? sessionData.student.user.name : sessionData.tutor.user.name;
    const enderName = isTutor ? sessionData.tutor.user.name : sessionData.student.user.name;

    await db.notification.create({
      data: {
        userId: participantId,
        type: 'SYSTEM_UPDATE',
        title: 'Session Ended',
        message: `${enderName} has ended the session "${sessionData.title}". ${reason ? `Reason: ${reason}` : ''}`,
        read: false
      }
    });

    // Generate session summary
    const sessionSummary = {
      sessionId,
      title: sessionData.title,
      scheduledDuration: sessionData.duration,
      actualDuration,
      scheduledPrice: sessionData.price,
      actualCost,
      endedBy: session.user.name,
      endedAt: endTime,
      reason: reason || 'Session completed normally'
    };

    // Log session end event
    console.log(`Session ${sessionId} ended by ${session.user.name} at ${endTime.toISOString()}`, sessionSummary);

    return NextResponse.json({
      message: 'Session ended successfully',
      session: updatedSession,
      summary: sessionSummary
    });

  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}