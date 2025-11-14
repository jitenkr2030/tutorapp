import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    // Get payments with related data
    const [payments, totalCount] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              session: {
                include: {
                  tutor: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      tutorProfile: {
                        select: {
                          bio: true,
                          hourlyRate: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.payment.count({ where }),
    ]);

    // Format payments for response
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      bookingId: payment.bookingId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
      refundedAt: payment.refundedAt,
      refundReason: payment.refundReason,
      createdAt: payment.createdAt,
      session: {
        id: payment.booking.session.id,
        title: payment.booking.session.title,
        scheduledAt: payment.booking.session.scheduledAt,
        duration: payment.booking.session.duration,
        type: payment.booking.session.type,
        tutor: {
          id: payment.booking.session.tutor.id,
          name: payment.booking.session.tutor.name,
          email: payment.booking.session.tutor.email,
          hourlyRate: payment.booking.session.tutor.tutorProfile?.hourlyRate || 0,
        },
      },
    }));

    return NextResponse.json({
      payments: formattedPayments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}