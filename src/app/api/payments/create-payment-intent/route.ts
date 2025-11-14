import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, paymentMethodId } = await request.json();

    // Get the booking details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: {
          include: {
            tutor: true,
            student: true,
          },
        },
        student: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: "Booking is not available for payment" }, { status: 400 });
    }

    // Calculate the amount (in cents)
    const amount = Math.round(booking.session.price * 100);

    // Create or get PaymentIntent
    let paymentIntent;
    
    if (paymentMethodId) {
      // Use existing payment method
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: session.user.stripeCustomerId,
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        metadata: {
          bookingId: booking.id,
          userId: session.user.id,
        },
      });
    } else {
      // Create new PaymentIntent for client-side confirmation
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: session.user.stripeCustomerId,
        payment_method_types: ["card"],
        metadata: {
          bookingId: booking.id,
          userId: session.user.id,
        },
      });
    }

    // Update payment record
    await db.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        status: "PENDING",
        transactionId: paymentIntent.id,
        paymentMethod: paymentMethodId ? "saved_card" : "card",
      },
      create: {
        bookingId: booking.id,
        userId: session.user.id,
        amount: booking.session.price,
        currency: "USD",
        status: "PENDING",
        transactionId: paymentIntent.id,
        paymentMethod: paymentMethodId ? "saved_card" : "card",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: booking.session.price,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}