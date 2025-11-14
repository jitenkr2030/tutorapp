import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assistants = await db.aITutorAssistant.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(assistants);
  } catch (error) {
    console.error('Error fetching AI tutor assistants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI tutor assistants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, expertise, personality, capabilities } = body;

    if (!subject || !expertise || !personality || !capabilities) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assistant = await db.aITutorAssistant.create({
      data: {
        userId: session.user.id,
        subject,
        expertise: JSON.stringify(expertise),
        personality,
        capabilities: JSON.stringify(capabilities),
        isActive: true
      }
    });

    return NextResponse.json(assistant, { status: 201 });
  } catch (error) {
    console.error('Error creating AI tutor assistant:', error);
    return NextResponse.json(
      { error: 'Failed to create AI tutor assistant' },
      { status: 500 }
    );
  }
}