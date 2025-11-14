import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;
      case "charge.refunded":
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId;
    const userId = paymentIntent.metadata.userId;

    // Update payment record
    await db.payment.update({
      where: { transactionId: paymentIntent.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
      },
    });

    // Update booking status
    await db.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    // Update session status
    await db.session.update({
      where: { id: bookingId },
      data: { status: "SCHEDULED" },
    });

    // Create notification for student
    await db.notification.create({
      data: {
        userId,
        type: "PAYMENT_DUE",
        title: "Payment Successful",
        message: "Your payment has been processed successfully. Your session is now confirmed.",
        read: false,
      },
    });

    // Create notification for tutor
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { session: true },
    });

    if (booking) {
      await db.notification.create({
        data: {
          userId: booking.session.tutorId,
          type: "SESSION_REMINDER",
          title: "New Booking Confirmed",
          message: "A new session has been booked and paid for.",
          read: false,
        },
      });
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const bookingId = paymentIntent.metadata.bookingId;
    const userId = paymentIntent.metadata.userId;

    // Update payment record
    await db.payment.update({
      where: { transactionId: paymentIntent.id },
      data: {
        status: "FAILED",
      },
    });

    // Create notification for student
    await db.notification.create({
      data: {
        userId,
        type: "PAYMENT_DUE",
        title: "Payment Failed",
        message: "Your payment could not be processed. Please try again.",
        read: false,
      },
    });
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;
    
    // Find the payment record
    const payment = await db.payment.findFirst({
      where: { transactionId: paymentIntentId },
    });

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          refundReason: charge.refunds?.data[0]?.reason || "Customer requested",
        },
      });

      // Update booking status
      await db.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CANCELLED" },
      });

      // Create notification for student
      await db.notification.create({
        data: {
          userId: payment.userId,
          type: "PAYMENT_DUE",
          title: "Refund Processed",
          message: "Your refund has been processed successfully.",
          read: false,
        },
      });
    }
  } catch (error) {
    console.error("Error handling refund:", error);
  }
}