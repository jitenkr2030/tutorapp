import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { advancedLearningEngine } from '@/lib/ai/advanced-learning-engine';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();
    const userId = session.user.id;

    switch (action) {
      case 'analyze-pattern':
        const { subject } = data;
        const pattern = await advancedLearningEngine.analyzeLearningPattern(userId, subject);
        return NextResponse.json(pattern);

      case 'generate-path':
        const { subject: pathSubject, targetLevel, currentLevel } = data;
        const learningPath = await advancedLearningEngine.generateAdaptiveLearningPath(
          userId, 
          pathSubject, 
          targetLevel, 
          currentLevel
        );
        return NextResponse.json(learningPath);

      case 'assess-cognitive':
        const cognitive = await advancedLearningEngine.assessCognitiveProfile(userId);
        return NextResponse.json(cognitive);

      case 'generate-content':
        const { subject: contentSubject, topic, difficulty } = data;
        const content = await advancedLearningEngine.generatePersonalizedContent(
          userId, 
          contentSubject, 
          topic, 
          difficulty
        );
        return NextResponse.json(content);

      case 'predict-outcomes':
        const { subject: predictSubject, timeframe } = data;
        const prediction = await advancedLearningEngine.predictLearningOutcomes(
          userId, 
          predictSubject, 
          timeframe
        );
        return NextResponse.json(prediction);

      case 'optimize-schedule':
        const { subjects, availableHours, preferences } = data;
        const schedule = await advancedLearningEngine.optimizeLearningSchedule(
          userId, 
          subjects, 
          availableHours, 
          preferences
        );
        return NextResponse.json(schedule);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Advanced learning AI error:', error);
    return NextResponse.json(
      { error: 'Failed to process advanced learning request' },
      { status: 500 }
    );
  }
}