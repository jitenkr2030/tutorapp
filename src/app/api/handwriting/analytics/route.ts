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
    const type = searchParams.get('type'); // 'user', 'quality', or 'global'
    const exerciseId = searchParams.get('exerciseId');
    const subject = searchParams.get('subject') as any;

    let analytics;
    
    if (type === 'user') {
      // Get user summary
      analytics = await HandwritingRecognitionService.getUserHandwritingSummary(session.user.id);
    } else if (type === 'quality') {
      // Get handwriting quality assessment
      if (!subject) {
        return NextResponse.json(
          { error: 'Subject parameter is required for quality assessment' },
          { status: 400 }
        );
      }
      analytics = await HandwritingRecognitionService.assessHandwritingQuality(session.user.id, subject);
    } else {
      // Get global analytics
      analytics = await HandwritingRecognitionService.getHandwritingAnalytics(exerciseId || undefined, subject || undefined);
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching handwriting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch handwriting analytics' },
      { status: 500 }
    );
  }
}