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

    const { plan, billingCycle } = await request.json();

    if (!plan || !billingCycle) {
      return NextResponse.json({ error: 'Plan and billing cycle are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      }
    });

    if (existingSubscription) {
      return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 });
    }

    // Calculate price based on plan and billing cycle
    const prices = {
      basic: { monthly: 9.99, yearly: 99.99 },
      premium: { monthly: 29.99, yearly: 299.99 },
      pro: { monthly: 59.99, yearly: 599.99 },
      enterprise: { monthly: 199.99, yearly: 1999.99 }
    };

    const price = prices[plan as keyof typeof prices]?.[billingCycle as keyof typeof prices.basic];
    
    if (!price) {
      return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 });
    }

    // Create subscription record
    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        plan: plan.toUpperCase(),
        status: 'PENDING',
        metadata: JSON.stringify({
          billingCycle,
          price,
          createdAt: new Date().toISOString()
        })
      }
    });

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        amount: price,
        currency: 'USD',
        status: 'PENDING',
        type: 'SUBSCRIPTION',
        subscriptionId: subscription.id
      }
    });

    // In a real implementation, you would integrate with Stripe here
    // For now, we'll simulate the checkout process
    const checkoutUrl = `/payment/checkout?paymentId=${payment.id}&subscriptionId=${subscription.id}`;

    return NextResponse.json({
      subscriptionId: subscription.id,
      paymentId: payment.id,
      checkoutUrl
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}