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
      where: { userId: session.user.id }
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    const sessions = await db.session.findMany({
      where: {
        studentId: {
          in: parent.students.map(student => student.id)
        },
        scheduledAt: {
          gte: new Date()
        }
      },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Error fetching parent sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}