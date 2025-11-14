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

    const userRank = await gamificationService.getUserRank(params.leaderboardId, session.user.id);
    
    return NextResponse.json(userRank);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}