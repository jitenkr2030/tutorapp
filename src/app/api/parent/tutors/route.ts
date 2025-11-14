import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a parent
    const parent = await db.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: true
      }
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // Get tutors who have sessions with parent's students
    const tutors = await db.tutor.findMany({
      where: {
        user: {
          sessions: {
            some: {
              studentId: {
                in: parent.students.map(student => student.id)
              }
            }
          }
        },
        status: 'APPROVED' // Only show approved tutors
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        subjects: {
          include: {
            subject: true
          }
        }
      },
      distinct: ['id']
    });

    return NextResponse.json({ tutors });

  } catch (error) {
    console.error('Error fetching parent tutors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}