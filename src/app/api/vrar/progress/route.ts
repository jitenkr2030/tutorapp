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
    const experienceId = searchParams.get('experienceId');

    if (!type || !['vr', 'ar'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "vr" or "ar"' },
        { status: 400 }
      );
    }

    if (experienceId) {
      // Get specific experience progress
      let progress;
      if (type === 'vr') {
        progress = await VRARService.getVRProgress(session.user.id, experienceId);
      } else {
        progress = await VRARService.getARProgress(session.user.id, experienceId);
      }
      return NextResponse.json({ progress });
    } else {
      // Get all user progress
      let progress;
      if (type === 'vr') {
        progress = await VRARService.getUserVRProgress(session.user.id);
      } else {
        progress = await VRARService.getUserARProgress(session.user.id);
      }
      return NextResponse.json({ progress });
    }
  } catch (error) {
    console.error('Error fetching VR/AR progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type, // 'vr' or 'ar'
      experienceId,
      progress,
      timeSpent,
      score,
      completed,
      metadata
    } = body;

    if (!type || !experienceId || progress === undefined || timeSpent === undefined || !['vr', 'ar'].includes(type)) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid type' },
        { status: 400 }
      );
    }

    let updatedProgress;
    if (type === 'vr') {
      updatedProgress = await VRARService.updateVRProgress({
        userId: session.user.id,
        experienceId,
        progress,
        timeSpent,
        score,
        completed,
        metadata
      });
    } else {
      updatedProgress = await VRARService.updateARProgress({
        userId: session.user.id,
        experienceId,
        progress,
        timeSpent,
        score,
        completed,
        metadata
      });
    }

    return NextResponse.json({ progress: updatedProgress });
  } catch (error) {
    console.error('Error updating VR/AR progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}