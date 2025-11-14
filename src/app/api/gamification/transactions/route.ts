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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const transactions = await gamificationService.getPointTransactions(session.user.id, limit);
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching point transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}