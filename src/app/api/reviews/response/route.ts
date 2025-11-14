import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const responseSchema = z.object({
  reviewId: z.string(),
  response: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = responseSchema.parse(body);

    // Get the review and check if the user is the tutor
    const review = await db.review.findUnique({
      where: { id: validatedData.reviewId },
      include: {
        tutor: true,
        student: true,
        session: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.tutorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update review with response
    const updatedReview = await db.review.update({
      where: { id: validatedData.reviewId },
      data: {
        tutorResponse: validatedData.response,
        tutorRespondedAt: new Date(),
      },
    });

    // Create notification for student
    await db.notification.create({
      data: {
        userId: review.studentId,
        type: "TUTOR_MESSAGE",
        title: "Tutor Responded to Your Review",
        message: `${review.tutor.name} has responded to your review.`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        tutorResponse: updatedReview.tutorResponse,
        tutorRespondedAt: updatedReview.tutorRespondedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Review response error:", error);
    return NextResponse.json(
      { error: "Failed to respond to review" },
      { status: 500 }
    );
  }
}