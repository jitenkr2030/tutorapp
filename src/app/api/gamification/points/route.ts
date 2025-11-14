import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gamificationService } from '@/lib/gamification/gamification-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userPoints = await gamificationService.getUserPoints(session.user.id);
    
    if (!userPoints) {
      return NextResponse.json({
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        streakDays: 0
      });
    }

    return NextResponse.json(userPoints);
  } catch (error) {
    console.error('Error fetching user points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}