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

    const resource = await db.resource.findUnique({
      where: { id: params.id },
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

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if user has permission to view this resource
    if (session.user.role !== 'ADMIN' && 
        session.user.id !== resource.tutorId && 
        !resource.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formattedResource = {
      ...resource,
      tutorName: resource.tutor?.name || 'Unknown Tutor',
      tags: resource.tags ? JSON.parse(resource.tags) : []
    };

    return NextResponse.json(formattedResource);
  } catch (error) {
    console.error('Error fetching resource:', error);
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
    
    // Check if resource exists and belongs to the tutor
    const existingResource = await db.resource.findUnique({
      where: { id: params.id }
    });

    if (!existingResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (existingResource.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resource = await db.resource.update({
      where: { id: params.id },
      data: {
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
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if resource exists and belongs to the tutor
    const existingResource = await db.resource.findUnique({
      where: { id: params.id }
    });

    if (!existingResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (existingResource.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.resource.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}