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
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const tutorId = searchParams.get('tutorId');

    let whereClause: any = {};
    
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (subject) whereClause.subject = subject;
    if (tutorId) whereClause.tutorId = tutorId;
    
    // If not a tutor, only show public resources
    if (session.user.role !== 'TUTOR') {
      whereClause.isPublic = true;
    }

    const resources = await db.resource.findMany({
      where: whereClause,
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const formattedResources = resources.map(resource => ({
      ...resource,
      tutorName: resource.tutor?.name || 'Unknown Tutor',
      tags: resource.tags ? JSON.parse(resource.tags) : []
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
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
    
    const resource = await db.resource.create({
      data: {
        tutorId: session.user.id,
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        subject: data.subject,
        grade: data.grade,
        fileUrl: data.fileUrl,
        externalUrl: data.externalUrl,
        thumbnailUrl: data.thumbnailUrl,
        isPublic: data.isPublic || false,
        isFeatured: data.isFeatured || false,
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

    const formattedResource = {
      ...resource,
      tutorName: resource.tutor?.name || 'Unknown Tutor',
      tags: resource.tags ? JSON.parse(resource.tags) : []
    };

    return NextResponse.json(formattedResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}