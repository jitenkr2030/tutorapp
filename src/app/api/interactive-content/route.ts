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
    const type = searchParams.get('type');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');

    let whereClause: any = { status: 'PUBLISHED' };
    
    if (type) whereClause.type = type;
    if (subject) whereClause.subject = subject;
    if (difficulty) whereClause.difficulty = difficulty;
    
    // If not a tutor, only show public content
    if (session.user.role !== 'TUTOR') {
      whereClause.isPublic = true;
    }

    const content = await db.interactiveContent.findMany({
      where: whereClause,
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        progress: {
          where: {
            studentId: session.user.id
          },
          take: 1
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const formattedContent = content.map(item => ({
      ...item,
      tutorName: item.tutor?.name || 'Unknown Tutor',
      tags: item.tags ? JSON.parse(item.tags) : [],
      userProgress: item.progress[0] || null
    }));

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error('Error fetching interactive content:', error);
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
    
    const content = await db.interactiveContent.create({
      data: {
        tutorId: session.user.id,
        title: data.title,
        description: data.description,
        type: data.type,
        subject: data.subject,
        grade: data.grade,
        contentUrl: data.contentUrl,
        thumbnailUrl: data.thumbnailUrl,
        embedCode: data.embedCode,
        configuration: data.configuration,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime,
        status: 'DRAFT',
        isPublic: data.isPublic || false,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        metadata: data.metadata || '{}'
      },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const formattedContent = {
      ...content,
      tutorName: content.tutor?.name || 'Unknown Tutor',
      tags: content.tags ? JSON.parse(content.tags) : []
    };

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error('Error creating interactive content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}