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

    const homework = await db.homework.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
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

    if (!homework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 });
    }

    // Check if user has permission to view this homework
    if (session.user.role !== 'ADMIN' && 
        session.user.id !== homework.tutorId && 
        session.user.id !== homework.studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formattedHomework = {
      ...homework,
      studentName: homework.student?.name || 'Unknown Student',
      tutorName: homework.tutor?.name || 'Unknown Tutor',
      resources: homework.resources ? JSON.parse(homework.resources) : []
    };

    return NextResponse.json(formattedHomework);
  } catch (error) {
    console.error('Error fetching homework:', error);
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
    
    // Check if homework exists and belongs to the tutor
    const existingHomework = await db.homework.findUnique({
      where: { id: params.id }
    });

    if (!existingHomework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 });
    }

    if (existingHomework.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const homework = await db.homework.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject,
        dueDate: new Date(data.dueDate),
        priority: data.priority,
        estimatedTime: data.estimatedTime,
        instructions: data.instructions,
        resources: data.resources ? JSON.stringify(data.resources) : null,
        grade: data.grade,
        score: data.score,
        maxScore: data.maxScore,
        feedback: data.feedback,
        status: data.status,
        submissionUrl: data.submissionUrl,
        gradedAt: data.status === 'GRADED' ? new Date() : existingHomework.gradedAt,
        submittedAt: data.status === 'SUBMITTED' ? new Date() : existingHomework.submittedAt
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
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

    const formattedHomework = {
      ...homework,
      studentName: homework.student?.name || 'Unknown Student',
      tutorName: homework.tutor?.name || 'Unknown Tutor',
      resources: homework.resources ? JSON.parse(homework.resources) : []
    };

    return NextResponse.json(formattedHomework);
  } catch (error) {
    console.error('Error updating homework:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if homework exists and belongs to the tutor
    const existingHomework = await db.homework.findUnique({
      where: { id: params.id }
    });

    if (!existingHomework) {
      return NextResponse.json({ error: 'Homework not found' }, { status: 404 });
    }

    if (existingHomework.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.homework.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Homework deleted successfully' });
  } catch (error) {
    console.error('Error deleting homework:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}