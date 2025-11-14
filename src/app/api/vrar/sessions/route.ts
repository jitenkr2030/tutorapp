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
    const type = searchParams.get('type'); // 'vr' or 'ar'
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!type || !['vr', 'ar'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "vr" or "ar"' },
        { status: 400 }
      );
    }

    let sessions;
    if (type === 'vr') {
      sessions = await VRARService.getUserVRSessions(session.user.id, limit);
    } else {
      sessions = await VRARService.getUserARSessions(session.user.id, limit);
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching VR/AR sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type, // 'vr' or 'ar'
      experienceId,
      sessionId,
      deviceType,
      location,
      metadata
    } = body;

    if (!type || !experienceId || !deviceType || !['vr', 'ar'].includes(type)) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid type' },
        { status: 400 }
      );
    }

    let newSession;
    if (type === 'vr') {
      newSession = await VRARService.createVRSession({
        userId: session.user.id,
        experienceId,
        sessionId,
        deviceType,
        metadata
      });
    } else {
      newSession = await VRARService.createARSession({
        userId: session.user.id,
        experienceId,
        sessionId,
        deviceType,
        location,
        metadata
      });
    }

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating VR/AR session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}