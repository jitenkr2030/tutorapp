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

    const parent = await db.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: true
      }
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    const studentIds = parent.students.map(student => student.id);

    // Get active sessions (scheduled and in progress)
    const activeSessions = await db.session.count({
      where: {
        studentId: {
          in: studentIds
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        },
        scheduledAt: {
          gte: new Date()
        }
      }
    });

    // Get completed sessions
    const completedSessions = await db.session.count({
      where: {
        studentId: {
          in: studentIds
        },
        status: 'COMPLETED'
      }
    });

    // Get total spent
    const payments = await db.payment.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      },
      select: {
        amount: true
      }
    });

    const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

    const stats = {
      totalStudents: parent.students.length,
      activeSessions,
      completedSessions,
      totalSpent
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching family stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}