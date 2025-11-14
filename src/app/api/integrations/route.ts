import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { educationPlatformIntegration } from '@/lib/integrations/education-platforms';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'platforms':
        const platforms = educationPlatformIntegration.getAvailablePlatforms();
        return NextResponse.json(platforms);

      case 'category':
        const category = searchParams.get('category');
        if (!category) {
          return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }
        const categoryPlatforms = educationPlatformIntegration.getPlatformsByCategory(category);
        return NextResponse.json(categoryPlatforms);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Integrations GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process integrations request' },
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

    const { action, data } = await request.json();
    const userId = session.user.id;

    switch (action) {
      case 'connect':
        const { platformId, credentials } = data;
        const config = await educationPlatformIntegration.connectPlatform(platformId, credentials);
        return NextResponse.json(config);

      case 'disconnect':
        const { platformId: disconnectId } = data;
        await educationPlatformIntegration.disconnectPlatform(disconnectId);
        return NextResponse.json({ success: true });

      case 'sync-content':
        const { platformId: syncId, subject } = data;
        const content = await educationPlatformIntegration.syncContent(syncId, subject);
        return NextResponse.json(content);

      case 'sync-assessments':
        const { platformId: assessmentId } = data;
        const assessments = await educationPlatformIntegration.syncAssessments(assessmentId);
        return NextResponse.json(assessments);

      case 'search':
        const { query, platforms } = data;
        const searchResults = await educationPlatformIntegration.searchContent(query, platforms);
        return NextResponse.json(searchResults);

      case 'analytics':
        const { platformId: analyticsId } = data;
        const analytics = await educationPlatformIntegration.getPlatformAnalytics(analyticsId, userId);
        return NextResponse.json(analytics);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Integrations POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process integrations request' },
      { status: 500 }
    );
  }
}