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

    // For now, we'll return some default leaderboards
    // In a real implementation, these would be stored in the database
    const leaderboards = [
      {
        id: 'weekly-global',
        name: 'Weekly Global',
        type: 'WEEKLY',
        scope: 'GLOBAL',
        isActive: true
      },
      {
        id: 'monthly-global',
        name: 'Monthly Global',
        type: 'MONTHLY',
        scope: 'GLOBAL',
        isActive: true
      },
      {
        id: 'all-time-global',
        name: 'All Time Global',
        type: 'ALL_TIME',
        scope: 'GLOBAL',
        isActive: true
      }
    ];

    return NextResponse.json(leaderboards);
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, scope, subject } = body;

    if (!name || !type || !scope) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const leaderboard = await gamificationService.createLeaderboard(name, type, scope, subject);
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error creating leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}