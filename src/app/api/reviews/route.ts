import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  sessionId: z.string(),
  tutorId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check if session exists and belongs to the current user
    const sessionData = await db.session.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        student: true,
        tutor: true,
        booking: true,
      },
    });

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (sessionData.studentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if session is completed
    if (sessionData.status !== "COMPLETED") {
      return NextResponse.json({ error: "Session must be completed before reviewing" }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: { sessionId: validatedData.sessionId },
    });

    if (existingReview) {
      return NextResponse.json({ error: "Review already exists for this session" }, { status: 400 });
    }

    // Create review
    const review = await db.review.create({
      data: {
        sessionId: validatedData.sessionId,
        tutorId: validatedData.tutorId,
        studentId: session.user.id,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
      },
    });

    // Create notification for tutor
    await db.notification.create({
      data: {
        userId: validatedData.tutorId,
        type: "REVIEW_REQUEST",
        title: "New Review Received",
        message: `You received a ${validatedData.rating}-star review from ${sessionData.student.name || "a student"}.`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get("tutorId");
    const sessionId = searchParams.get("sessionId");

    if (tutorId) {
      // Get reviews for a specific tutor
      const reviews = await db.review.findMany({
        where: { tutorId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          session: {
            select: {
              title: true,
              scheduledAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate average rating
      const stats = await db.review.aggregate({
        where: { tutorId },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

      return NextResponse.json({
        reviews,
        stats: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count.rating,
        },
      });
    }

    if (sessionId) {
      // Get review for a specific session
      const review = await db.review.findUnique({
        where: { sessionId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          tutor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({ review });
    }

    return NextResponse.json({ error: "Missing tutorId or sessionId parameter" }, { status: 400 });
  } catch (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}