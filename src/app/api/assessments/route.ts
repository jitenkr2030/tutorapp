import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    let assessments;
    
    if (tutorId) {
      // Get assessments for a specific tutor
      assessments = await db.assessment.findMany({
        where: { tutorId },
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
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (session.user.role === 'TUTOR') {
      // Get all assessments for the current tutor
      assessments = await db.assessment.findMany({
        where: { tutorId: session.user.id },
        include: {
          questions: true,
          submissions: {
            include: {
              student: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Get assessments available to the student
      assessments = await db.assessment.findMany({
        where: { 
          status: 'PUBLISHED',
          OR: [
            { dueDate: null },
            { dueDate: { gte: new Date() } }
          ]
        },
        include: {
          questions: true,
          tutor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const assessment = await db.assessment.create({
      data: {
        tutorId: session.user.id,
        title: data.title,
        description: data.description,
        type: data.type,
        subject: data.subject,
        grade: data.grade,
        timeLimit: data.timeLimit,
        totalPoints: data.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0,
        instructions: data.instructions,
        allowRetake: data.allowRetake || false,
        shuffleQuestions: data.shuffleQuestions || false,
        showResults: data.showResults || true,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        metadata: data.metadata || '{}',
        questions: {
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
    console.error('Error creating assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}