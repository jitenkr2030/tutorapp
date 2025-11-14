import { NextRequest, NextResponse } from 'next/server';
import { VRARService } from '@/lib/vrar/vrar-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'vr', 'ar', or 'summary'
    const experienceId = searchParams.get('experienceId');

    if (!type || !['vr', 'ar', 'summary'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "vr", "ar", or "summary"' },
        { status: 400 }
      );
    }

    let analytics;
    
    if (type === 'summary') {
      // Get user summary
      analytics = await VRARService.getUserVRARSummary(session.user.id);
    } else if (type === 'vr') {
      // Get VR analytics
      analytics = await VRARService.getVRAnalytics(experienceId || undefined);
    } else {
      // Get AR analytics
      analytics = await VRARService.getARAnalytics(experienceId || undefined);
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching VR/AR analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}