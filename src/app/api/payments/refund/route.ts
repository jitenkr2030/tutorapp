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

    const { paymentId, reason, amount } = await request.json();

    // Get payment details
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if user is authorized (student who made the payment or admin)
    if (payment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if payment can be refunded
    if (payment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment cannot be refunded" }, { status: 400 });
    }

    // Check if session has already occurred
    if (payment.booking.session.scheduledAt < new Date()) {
      return NextResponse.json({ error: "Cannot refund past sessions" }, { status: 400 });
    }

    // Calculate refund amount (partial or full)
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(payment.amount * 100);

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.transactionId,
      amount: refundAmount,
      reason: "requested_by_customer",
      metadata: {
        paymentId: payment.id,
        reason,
      },
    });

    // Update payment record
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: refundAmount === Math.round(payment.amount * 100) ? "REFUNDED" : "PARTIALLY_REFUNDED",
        refundedAt: new Date(),
        refundReason: reason,
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
        message: `Your refund of $${(refundAmount / 100).toFixed(2)} has been processed.`,
        read: false,
      },
    });

    // Create notification for tutor
    await db.notification.create({
      data: {
        userId: payment.booking.session.tutorId,
        type: "SESSION_REMINDER",
        title: "Session Cancelled",
        message: "A session has been cancelled and refunded.",
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refundAmount / 100,
      status: refund.status,
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}