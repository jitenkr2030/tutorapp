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
    const exerciseId = searchParams.get('exerciseId');
    const subject = searchParams.get('subject') as any;

    if (exerciseId) {
      // Get specific exercise progress
      const progress = await HandwritingRecognitionService.getHandwritingProgress(session.user.id, exerciseId);
      return NextResponse.json({ progress });
    } else {
      // Get all user progress
      const progress = await HandwritingRecognitionService.getUserHandwritingProgress(session.user.id, subject);
      return NextResponse.json({ progress });
    }
  } catch (error) {
    console.error('Error fetching handwriting progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handwriting progress' },
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
      subject,
      score,
      accuracy,
      improvement,
      completed,
      metadata
    } = body;

    if (!exerciseId || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: exerciseId and subject' },
        { status: 400 }
      );
    }

    const progress = await HandwritingRecognitionService.updateHandwritingProgress({
      userId: session.user.id,
      exerciseId,
      subject,
      score,
      accuracy,
      improvement,
      completed,
      metadata
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating handwriting progress:', error);
    return NextResponse.json(
      { error: 'Failed to update handwriting progress' },
      { status: 500 }
    );
  }
}