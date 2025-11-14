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
    const type = searchParams.get('type') as any;
    const language = searchParams.get('language') as any;
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');

    const filters: any = {};
    if (type) filters.type = type;
    if (language) filters.language = language;
    if (difficulty) filters.difficulty = parseInt(difficulty);
    if (isActive !== null) filters.isActive = isActive === 'true';

    const exercises = await VoiceRecognitionService.getVoiceExercises(filters);
    
    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Error fetching voice exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      language,
      difficulty,
      content,
      audioUrl,
      metadata
    } = body;

    if (!title || !description || !type || !language || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const exercise = await VoiceRecognitionService.createVoiceExercise({
      title,
      description,
      type,
      language,
      difficulty: difficulty || 1,
      content,
      audioUrl,
      metadata
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    console.error('Error creating voice exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create voice exercise' },
      { status: 500 }
    );
  }
}