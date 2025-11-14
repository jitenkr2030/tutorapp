import { NextRequest, NextResponse } from 'next/server';
import { VoiceRecognitionService } from '@/lib/voice/voice-service';
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

    const sessions = await VoiceRecognitionService.getUserVoiceSessions(session.user.id, limit);
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching voice sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice sessions' },
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
      audioUrl,
      transcript,
      accuracy,
      pronunciation,
      fluency,
      feedback,
      score,
      duration,
      metadata
    } = body;

    if (!exerciseId || !audioUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId and audioUrl' },
        { status: 400 }
      );
    }

    const voiceSession = await VoiceRecognitionService.createVoiceSession({
      userId: session.user.id,
      exerciseId,
      sessionId,
      audioUrl,
      transcript,
      accuracy,
      pronunciation,
      fluency,
      feedback,
      score,
      duration,
      metadata
    });

    // Update user progress
    if (score !== undefined) {
      const exercise = await VoiceRecognitionService.getVoiceExerciseById(exerciseId);
      if (exercise) {
        await VoiceRecognitionService.updateVoiceProgress({
          userId: session.user.id,
          exerciseId,
          language: exercise.language,
          score,
          completed: score >= 80, // Consider completed if score is 80% or higher
          metadata
        });
      }
    }

    return NextResponse.json({ session: voiceSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating voice session:', error);
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    );
  }
}