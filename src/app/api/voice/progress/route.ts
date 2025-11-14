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
    const exerciseId = searchParams.get('exerciseId');
    const language = searchParams.get('language') as any;

    if (exerciseId) {
      // Get specific exercise progress
      const progress = await VoiceRecognitionService.getVoiceProgress(session.user.id, exerciseId);
      return NextResponse.json({ progress });
    } else {
      // Get all user progress
      const progress = await VoiceRecognitionService.getUserVoiceProgress(session.user.id, language);
      return NextResponse.json({ progress });
    }
  } catch (error) {
    console.error('Error fetching voice progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice progress' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      exerciseId,
      language,
      score,
      completed,
      streakDays,
      metadata
    } = body;

    if (!exerciseId || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId and language' },
        { status: 400 }
      );
    }

    const progress = await VoiceRecognitionService.updateVoiceProgress({
      userId: session.user.id,
      exerciseId,
      language,
      score,
      completed,
      streakDays,
      metadata
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating voice progress:', error);
    return NextResponse.json(
      { error: 'Failed to update voice progress' },
      { status: 500 }
    );
  }
}