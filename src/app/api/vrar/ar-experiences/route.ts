import { NextRequest, NextResponse } from 'next/server';
import { VRARService } from '@/lib/vrar/vrar-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as any;
    const subject = searchParams.get('subject');
    const gradeLevel = searchParams.get('gradeLevel');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');

    const filters: any = {};
    if (type) filters.type = type;
    if (subject) filters.subject = subject;
    if (gradeLevel) filters.gradeLevel = gradeLevel;
    if (difficulty) filters.difficulty = parseInt(difficulty);
    if (isActive !== null) filters.isActive = isActive === 'true';

    const experiences = await VRARService.getARExperiences(filters);
    
    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('Error fetching AR experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AR experiences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      subject,
      gradeLevel,
      difficulty,
      markerUrl,
      contentUrl,
      metadata
    } = body;

    if (!title || !description || !type || !subject || !gradeLevel || !contentUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const experience = await VRARService.createARExperience({
      title,
      description,
      type,
      subject,
      gradeLevel,
      difficulty: difficulty || 1,
      markerUrl,
      contentUrl,
      metadata
    });

    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    console.error('Error creating AR experience:', error);
    return NextResponse.json(
      { error: 'Failed to create AR experience' },
      { status: 500 }
    );
  }
}