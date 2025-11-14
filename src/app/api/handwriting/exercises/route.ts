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
    const type = searchParams.get('type') as any;
    const subject = searchParams.get('subject') as any;
    const difficulty = searchParams.get('difficulty') as any;
    const isActive = searchParams.get('isActive');

    const filters: any = {};
    if (type) filters.type = type;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    if (isActive !== null) filters.isActive = isActive === 'true';

    const exercises = await HandwritingRecognitionService.getHandwritingExercises(filters);
    
    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Error fetching handwriting exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handwriting exercises' },
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
      subject,
      difficulty,
      content,
      referenceUrl,
      metadata
    } = body;

    if (!title || !description || !type || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const exercise = await HandwritingRecognitionService.createHandwritingExercise({
      title,
      description,
      type,
      subject,
      difficulty,
      content,
      referenceUrl,
      metadata
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    console.error('Error creating handwriting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create handwriting exercise' },
      { status: 500 }
    );
  }
}