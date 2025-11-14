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
    const type = searchParams.get('type'); // 'user', 'global', or 'proficiency'
    const exerciseId = searchParams.get('exerciseId');
    const language = searchParams.get('language') as any;

    let analytics;
    
    if (type === 'user') {
      // Get user summary
      analytics = await VoiceRecognitionService.getUserVoiceSummary(session.user.id);
    } else if (type === 'proficiency') {
      // Get user proficiency assessment
      if (!language) {
        return NextResponse.json(
          { error: 'Language parameter is required for proficiency assessment' },
          { status: 400 }
        );
      }
      analytics = await VoiceRecognitionService.assessUserProficiency(session.user.id, language);
    } else {
      // Get global analytics
      analytics = await VoiceRecognitionService.getVoiceAnalytics(exerciseId || undefined, language || undefined);
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching voice analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice analytics' },
      { status: 500 }
    );
  }
}