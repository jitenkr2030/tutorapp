import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assessment = await db.assessment.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
        submissions: {
          include: {
            student: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Check if user has permission to view this assessment
    if (session.user.role !== 'ADMIN' && session.user.id !== assessment.tutorId) {
      // Students can only view published assessments
      if (session.user.role === 'STUDENT' && assessment.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Check if assessment exists and belongs to the tutor
    const existingAssessment = await db.assessment.findUnique({
      where: { id: params.id }
    });

    if (!existingAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (existingAssessment.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const assessment = await db.assessment.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        subject: data.subject,
        grade: data.grade,
        timeLimit: data.timeLimit,
        totalPoints: data.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || existingAssessment.totalPoints,
        instructions: data.instructions,
        allowRetake: data.allowRetake || false,
        shuffleQuestions: data.shuffleQuestions || false,
        showResults: data.showResults || true,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status || 'DRAFT',
        metadata: data.metadata || '{}',
        questions: {
          deleteMany: {},
          create: data.questions?.map((q: any, index: number) => ({
            content: q.content,
            type: q.type,
            points: q.points || 1,
            order: index,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            mediaUrl: q.mediaUrl
          })) || []
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if assessment exists and belongs to the tutor
    const existingAssessment = await db.assessment.findUnique({
      where: { id: params.id }
    });

    if (!existingAssessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (existingAssessment.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.assessment.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}