import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: 'CANCELLED'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = user.subscriptions[0];

    if (!subscription) {
      return NextResponse.json({ error: 'No cancelled subscription found' }, { status: 404 });
    }

    // Check if subscription can be reactivated (within current period)
    const now = new Date();
    const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
    
    if (now > currentPeriodEnd) {
      return NextResponse.json({ error: 'Subscription period has ended. Please subscribe again.' }, { status: 400 });
    }

    // Reactivate subscription
    const updatedSubscription = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelledAt: null,
        status: 'ACTIVE'
      }
    });

    // In a real implementation, you would also reactivate the Stripe subscription here

    return NextResponse.json({
      message: 'Subscription reactivated successfully',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}