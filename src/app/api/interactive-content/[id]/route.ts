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

    const content = await db.interactiveContent.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Interactive content not found' }, { status: 404 });
    }

    // Check if user has permission to view this content
    if (session.user.role !== 'ADMIN' && 
        session.user.id !== content.tutorId && 
        !content.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formattedContent = {
      ...content,
      tutorName: content.tutor?.name || 'Unknown Tutor',
      tags: content.tags ? JSON.parse(content.tags) : [],
      userProgress: content.progress[0] || null
    };

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error('Error fetching interactive content:', error);
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
    
    // Check if content exists and belongs to the tutor
    const existingContent = await db.interactiveContent.findUnique({
      where: { id: params.id }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Interactive content not found' }, { status: 404 });
    }

    if (existingContent.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const content = await db.interactiveContent.update({
      where: { id: params.id },
      data: {
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
        status: data.status || 'DRAFT',
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
    console.error('Error updating interactive content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if content exists and belongs to the tutor
    const existingContent = await db.interactiveContent.findUnique({
      where: { id: params.id }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Interactive content not found' }, { status: 404 });
    }

    if (existingContent.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.interactiveContent.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Interactive content deleted successfully' });
  } catch (error) {
    console.error('Error deleting interactive content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}