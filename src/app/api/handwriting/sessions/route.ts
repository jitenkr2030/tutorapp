import { NextRequest, NextResponse } from 'next/server';
import { HandwritingRecognitionService } from '@/lib/handwriting/handwriting-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const sessions = await HandwritingRecognitionService.getUserHandwritingSessions(session.user.id, limit);
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching handwriting sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handwriting sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      exerciseId,
      sessionId,
      imageUrl,
      transcript,
      confidence,
      accuracy,
      feedback,
      score,
      processingTime,
      metadata
    } = body;

    if (!exerciseId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId and imageUrl' },
        { status: 400 }
      );
    }

    const handwritingSession = await HandwritingRecognitionService.createHandwritingSession({
      userId: session.user.id,
      exerciseId,
      sessionId,
      imageUrl,
      transcript,
      confidence,
      accuracy,
      feedback,
      score,
      processingTime,
      metadata
    });

    // Update user progress
    if (score !== undefined) {
      const exercise = await HandwritingRecognitionService.getHandwritingExerciseById(exerciseId);
      if (exercise) {
        await HandwritingRecognitionService.updateHandwritingProgress({
          userId: session.user.id,
          exerciseId,
          subject: exercise.subject,
          score,
          accuracy,
          completed: score >= 80, // Consider completed if score is 80% or higher
          metadata
        });
      }
    }

    return NextResponse.json({ session: handwritingSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating handwriting session:', error);
    return NextResponse.json(
      { error: 'Failed to create handwriting session' },
      { status: 500 }
    );
  }
}