import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID or create one
    let stripeCustomer = await stripe.customers.retrieve(session.user.stripeCustomerId);
    
    if (!stripeCustomer || stripeCustomer.deleted) {
      stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || "",
        metadata: {
          userId: session.user.id,
        },
      });

      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    }

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomer.id,
      type: "card",
    });

    const formattedMethods = paymentMethods.data.map((method) => ({
      id: method.id,
      type: method.type,
      card: {
        brand: method.card?.brand,
        last4: method.card?.last4,
        expMonth: method.card?.exp_month,
        expYear: method.card?.exp_year,
      },
    }));

    return NextResponse.json({ paymentMethods: formattedMethods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    // Get or create Stripe customer
    let stripeCustomer = await stripe.customers.retrieve(session.user.stripeCustomerId);
    
    if (!stripeCustomer || stripeCustomer.deleted) {
      stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || "",
        metadata: {
          userId: session.user.id,
        },
      });

      await db.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer.id,
    });

    // Set as default payment method
    await stripe.customers.update(stripeCustomer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding payment method:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethodId } = await request.query;

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing payment method:", error);
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    );
  }
}