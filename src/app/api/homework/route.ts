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
    const status = searchParams.get('status');

    let homework;
    
    if (session.user.role === 'TUTOR') {
      // Get all homework assigned by the tutor
      homework = await db.homework.findMany({
        where: status ? { status } : {},
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
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Get homework assigned to the student
      homework = await db.homework.findMany({
        where: { 
          studentId: session.user.id,
          ...(status && { status })
        },
        include: {
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

    // Format the response to include studentName and tutorName
    const formattedHomework = homework.map(hw => ({
      ...hw,
      studentName: hw.student?.name || 'Unknown Student',
      tutorName: hw.tutor?.name || 'Unknown Tutor',
      resources: hw.resources ? JSON.parse(hw.resources) : []
    }));

    return NextResponse.json(formattedHomework);
  } catch (error) {
    console.error('Error fetching homework:', error);
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
    
    const homework = await db.homework.create({
      data: {
        tutorId: session.user.id,
        studentId: data.studentId,
        title: data.title,
        description: data.description,
        subject: data.subject,
        dueDate: new Date(data.dueDate),
        priority: data.priority || 'MEDIUM',
        estimatedTime: data.estimatedTime,
        instructions: data.instructions,
        resources: data.resources ? JSON.stringify(data.resources) : null,
        metadata: data.metadata || '{}'
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
    console.error('Error creating homework:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}