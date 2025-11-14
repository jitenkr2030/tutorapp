import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gamificationService } from '@/lib/gamification/gamification-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { leaderboardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const entries = await gamificationService.getLeaderboard(params.leaderboardId, limit);
    
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching leaderboard entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}