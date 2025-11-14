import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const where: any = {
      start: {
        gte: startDate
      },
      end: {
        lte: endDate
      }
    };

    // Filter by tutor or student if provided
    if (tutorId) {
      where.tutorId = tutorId;
    } else if (studentId) {
      where.studentId = studentId;
    }

    const events = await db.session.findMany({
      where,
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        start: 'asc'
      }
    });

    // Transform events to calendar format
    const calendarEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.scheduledAt,
      end: new Date(event.scheduledAt.getTime() + event.duration * 60000),
      type: 'session' as const,
      status: event.status.toLowerCase() as any,
      tutor: event.tutor ? {
        name: event.tutor.user.name,
        id: event.tutor.user.id
      } : undefined,
      student: event.student ? {
        name: event.student.user.name,
        id: event.student.user.id
      } : undefined,
      location: event.location,
      isOnline: event.type === 'ONLINE',
      price: event.price,
      description: event.description,
      color: getStatusColor(event.status)
    }));

    return NextResponse.json({ events: calendarEvents });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      description,
      start,
      end,
      location,
      isOnline,
      price,
      tutorId,
      studentId,
      type = 'session'
    } = await request.json();

    if (!title || !start || !end) {
      return NextResponse.json({ error: 'Title, start, and end are required' }, { status: 400 });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    // Validate duration
    if (duration <= 0 || duration > 480) { // Max 8 hours
      return NextResponse.json({ error: 'Invalid session duration' }, { status: 400 });
    }

    // Check for scheduling conflicts
    const conflicts = await db.session.findMany({
      where: {
        OR: [
          {
            tutorId: tutorId,
            start: {
              lt: endDate
            },
            end: {
              gt: startDate
            }
          },
          {
            studentId: studentId,
            start: {
              lt: endDate
            },
            end: {
              gt: startDate
            }
          }
        ],
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        }
      }
    });

    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'Scheduling conflict detected' }, { status: 400 });
    }

    // Create the session/event
    const newEvent = await db.session.create({
      data: {
        title,
        description,
        scheduledAt: startDate,
        duration,
        type: isOnline ? 'ONLINE' : 'IN_PERSON',
        location,
        price: price || 0,
        tutorId,
        studentId,
        status: 'SCHEDULED'
      },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Create notification for the other participant
    const participantId = session.user.id === tutorId ? studentId : tutorId;
    if (participantId) {
      await db.notification.create({
        data: {
          userId: participantId,
          type: 'SESSION_REMINDER',
          title: 'New Session Scheduled',
          message: `A new session "${title}" has been scheduled for ${startDate.toLocaleString()}.`,
          read: false
        }
      });
    }

    // Transform to calendar format
    const calendarEvent = {
      id: newEvent.id,
      title: newEvent.title,
      start: newEvent.scheduledAt,
      end: new Date(newEvent.scheduledAt.getTime() + newEvent.duration * 60000),
      type: 'session' as const,
      status: newEvent.status.toLowerCase() as any,
      tutor: newEvent.tutor ? {
        name: newEvent.tutor.user.name,
        id: newEvent.tutor.user.id
      } : undefined,
      student: newEvent.student ? {
        name: newEvent.student.user.name,
        id: newEvent.student.user.id
      } : undefined,
      location: newEvent.location,
      isOnline: newEvent.type === 'ONLINE',
      price: newEvent.price,
      description: newEvent.description,
      color: getStatusColor(newEvent.status)
    };

    return NextResponse.json({ event: calendarEvent });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'completed': return 'bg-green-100 text-green-800 border-green-300';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}