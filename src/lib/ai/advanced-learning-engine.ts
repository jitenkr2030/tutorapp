import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface LearningPattern {
  userId: string;
  subject: string;
  difficulty: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'slow' | 'medium' | 'fast';
  strengths: string[];
  weaknesses: string[];
  preferredTimeOfDay: string;
  attentionSpan: number;
  retentionRate: number;
}

interface AdaptiveLearningPath {
  userId: string;
  subject: string;
  currentLevel: number;
  targetLevel: number;
  estimatedCompletion: Date;
  milestones: {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    estimatedTime: number;
    prerequisites: string[];
    resources: string[];
  }[];
  adaptiveAdjustments: {
    timestamp: Date;
    adjustment: string;
    reason: string;
    effectiveness: number;
  }[];
}

interface CognitiveProfile {
  userId: string;
  workingMemory: number;
  processingSpeed: number;
  reasoningAbility: number;
  spatialAwareness: number;
  verbalComprehension: number;
  perceptualReasoning: number;
  learningEfficiency: number;
  metacognitiveSkills: number;
}

export class AdvancedLearningEngine {
  private zai: any;

  constructor() {
    this.zai = new ZAI();
  }

  private async initializeZAI() {
    try {
      this.zai = await ZAI.create();
    } catch (error) {
      console.error('Failed to initialize ZAI:', error);
      throw error;
    }
  }

  private async ensureZAIInitialized() {
    if (!this.zai || typeof this.zai.chat === 'undefined') {
      await this.initializeZAI();
    }
  }

  async analyzeLearningPattern(userId: string, subject: string): Promise<LearningPattern> {
    try {
      await this.ensureZAIInitialized();
      // Get user's session data
      const sessions = await db.session.findMany({
        where: {
          studentId: userId,
          OR: [
            { title: { contains: subject, mode: 'insensitive' } },
            { tutor: { tutorProfile: { subjects: { some: { subject: { name: { contains: subject, mode: 'insensitive' } } } } } } }
          ]
        },
        include: {
          review: true,
          tutor: {
            include: {
              tutorProfile: {
                include: {
                  subjects: {
                    include: {
                      subject: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          scheduledAt: 'desc'
        },
        take: 50
      });

      // Get assessment results
      const assessments = await db.assessmentSubmission.findMany({
        where: {
          userId,
          assessment: {
            subject: { contains: subject, mode: 'insensitive' }
          }
        },
        include: {
          assessment: true
        },
        orderBy: {
          submittedAt: 'desc'
        },
        take: 20
      });

      // Get interactive content progress
      const progress = await db.interactiveProgress.findMany({
        where: {
          userId,
          content: {
            subject: { contains: subject, mode: 'insensitive' }
          }
        },
        include: {
          content: true
        },
        orderBy: {
          lastAccessed: 'desc'
        },
        take: 30
      });

      // Analyze patterns using AI
      const analysisPrompt = `
        Analyze the following learning data for user ${userId} in subject ${subject}:
        
        Sessions: ${JSON.stringify(sessions.map(s => ({
          duration: s.duration,
          status: s.status,
          rating: s.review?.rating,
          tutorFeedback: s.review?.comment,
          scheduledAt: s.scheduledAt
        })))}
        
        Assessments: ${JSON.stringify(assessments.map(a => ({
          score: a.score,
          maxScore: a.assessment.maxScore,
          timeSpent: a.timeSpent,
          submittedAt: a.submittedAt
        })))}
        
        Progress: ${JSON.stringify(progress.map(p => ({
          progress: p.progress,
          timeSpent: p.timeSpent,
          lastAccessed: p.lastAccessed,
          contentType: p.content.type
        })))}
        
        Provide a detailed learning pattern analysis including:
        1. Learning style (visual, auditory, kinesthetic, reading)
        2. Learning pace (slow, medium, fast)
        3. Strengths and weaknesses
        4. Preferred time of day for learning
        5. Attention span estimation
        6. Retention rate calculation
        7. Difficulty level progression
        
        Return the analysis in JSON format.
      `;

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an advanced learning analytics AI that analyzes student learning patterns and provides detailed insights.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      return {
        userId,
        subject,
        difficulty: analysis.difficulty || 0.5,
        learningStyle: analysis.learningStyle || 'visual',
        pace: analysis.pace || 'medium',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        preferredTimeOfDay: analysis.preferredTimeOfDay || 'afternoon',
        attentionSpan: analysis.attentionSpan || 30,
        retentionRate: analysis.retentionRate || 0.7
      };
    } catch (error) {
      console.error('Error analyzing learning pattern:', error);
      throw new Error('Failed to analyze learning pattern');
    }
  }

  async generateAdaptiveLearningPath(
    userId: string,
    subject: string,
    targetLevel: number,
    currentLevel: number = 1
  ): Promise<AdaptiveLearningPath> {
    try {
      await this.ensureZAIInitialized();
      // Get learning pattern
      const pattern = await this.analyzeLearningPattern(userId, subject);

      // Get subject-specific resources
      const resources = await db.resource.findMany({
        where: {
          subject: { contains: subject, mode: 'insensitive' }
        },
        take: 20
      });

      // Generate learning path using AI
      const pathPrompt = `
        Create an adaptive learning path for user ${userId} in subject ${subject}:
        
        Current Level: ${currentLevel}
        Target Level: ${targetLevel}
        Learning Pattern: ${JSON.stringify(pattern)}
        Available Resources: ${JSON.stringify(resources.map(r => ({
          type: r.type,
          title: r.title,
          difficulty: r.difficulty,
          estimatedTime: r.estimatedTime
        })))}
        
        Generate a comprehensive learning path that includes:
        1. Estimated completion date
        2. Learning milestones with prerequisites
        3. Adaptive adjustments based on learning pattern
        4. Resource recommendations for each milestone
        
        Consider the user's learning style, pace, strengths, and weaknesses.
        Make the path challenging but achievable.
        
        Return the learning path in JSON format.
      `;

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational path designer that creates personalized adaptive learning paths.'
          },
          {
            role: 'user',
            content: pathPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      });

      const pathData = JSON.parse(response.choices[0].message.content || '{}');

      return {
        userId,
        subject,
        currentLevel,
        targetLevel,
        estimatedCompletion: new Date(pathData.estimatedCompletion || Date.now() + 30 * 24 * 60 * 60 * 1000),
        milestones: pathData.milestones || [],
        adaptiveAdjustments: pathData.adaptiveAdjustments || []
      };
    } catch (error) {
      console.error('Error generating adaptive learning path:', error);
      throw new Error('Failed to generate adaptive learning path');
    }
  }

  async assessCognitiveProfile(userId: string): Promise<CognitiveProfile> {
    try {
      await this.ensureZAIInitialized();
      // Get user's performance data across all subjects
      const sessions = await db.session.findMany({
        where: { studentId: userId },
        include: { review: true },
        take: 100
      });

      const assessments = await db.assessmentSubmission.findMany({
        where: { userId },
        include: { assessment: true },
        take: 50
      });

      const interactiveProgress = await db.interactiveProgress.findMany({
        where: { userId },
        include: { content: true },
        take: 50
      });

      // Analyze cognitive patterns
      const cognitivePrompt = `
        Analyze the cognitive profile of user ${userId} based on their learning data:
        
        Session Performance: ${JSON.stringify(sessions.map(s => ({
          duration: s.duration,
          rating: s.review?.rating,
          completionRate: s.status === 'COMPLETED' ? 1 : 0,
          subject: s.title
        })))}
        
        Assessment Performance: ${JSON.stringify(assessments.map(a => ({
          score: a.score,
          maxScore: a.assessment.maxScore,
          accuracy: a.score / a.assessment.maxScore,
          timeSpent: a.timeSpent,
          questionTypes: a.assessment.questionTypes
        })))}
        
        Interactive Learning: ${JSON.stringify(interactiveProgress.map(p => ({
          progress: p.progress,
          timeSpent: p.timeSpent,
          contentType: p.content.type,
          difficulty: p.content.difficulty,
          completionTime: p.completionTime
        })))}
        
        Assess the following cognitive abilities on a scale of 0-1:
        1. Working Memory
        2. Processing Speed
        3. Reasoning Ability
        4. Spatial Awareness
        5. Verbal Comprehension
        6. Perceptual Reasoning
        7. Learning Efficiency
        8. Metacognitive Skills
        
        Provide detailed analysis and return the cognitive profile in JSON format.
      `;

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a cognitive assessment AI that evaluates users\' cognitive abilities based on their learning performance data.'
          },
          {
            role: 'user',
            content: cognitivePrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const cognitiveData = JSON.parse(response.choices[0].message.content || '{}');

      return {
        userId,
        workingMemory: cognitiveData.workingMemory || 0.5,
        processingSpeed: cognitiveData.processingSpeed || 0.5,
        reasoningAbility: cognitiveData.reasoningAbility || 0.5,
        spatialAwareness: cognitiveData.spatialAwareness || 0.5,
        verbalComprehension: cognitiveData.verbalComprehension || 0.5,
        perceptualReasoning: cognitiveData.perceptualReasoning || 0.5,
        learningEfficiency: cognitiveData.learningEfficiency || 0.5,
        metacognitiveSkills: cognitiveData.metacognitiveSkills || 0.5
      };
    } catch (error) {
      console.error('Error assessing cognitive profile:', error);
      throw new Error('Failed to assess cognitive profile');
    }
  }

  async generatePersonalizedContent(
    userId: string,
    subject: string,
    topic: string,
    difficulty: number
  ): Promise<{
    title: string;
    content: string;
    exercises: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
    adaptations: string[];
  }> {
    try {
      await this.ensureZAIInitialized();
      // Get user's learning pattern and cognitive profile
      const [pattern, cognitive] = await Promise.all([
        this.analyzeLearningPattern(userId, subject),
        this.assessCognitiveProfile(userId)
      ]);

      // Generate personalized content
      const contentPrompt = `
        Generate personalized learning content for user ${userId}:
        
        Subject: ${subject}
        Topic: ${topic}
        Difficulty: ${difficulty}
        Learning Pattern: ${JSON.stringify(pattern)}
        Cognitive Profile: ${JSON.stringify(cognitive)}
        
        Create content that:
        1. Matches the user's learning style (${pattern.learningStyle})
        2. Adapts to their learning pace (${pattern.pace})
        3. Leverages their strengths: ${pattern.strengths.join(', ')}
        4. Addresses their weaknesses: ${pattern.weaknesses.join(', ')}
        5. Considers their cognitive abilities
        
        Include:
        - Engaging title
        - Main content explanation
        - Practice exercises with multiple choice
        - Adaptations for different learning needs
        
        Return the content in JSON format.
      `;

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert content creator that generates personalized educational content adapted to individual learning patterns and cognitive profiles.'
          },
          {
            role: 'user',
            content: contentPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2500
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error generating personalized content:', error);
      throw new Error('Failed to generate personalized content');
    }
  }

  async predictLearningOutcomes(
    userId: string,
    subject: string,
    timeframe: number // days
  ): Promise<{
    predictedScore: number;
    confidence: number;
    factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
    recommendations: string[];
  }> {
    try {
      await this.ensureZAIInitialized();
      // Get historical data
      const [sessions, assessments, pattern] = await Promise.all([
        db.session.findMany({
          where: { studentId: userId },
          include: { review: true },
          take: 50
        }),
        db.assessmentSubmission.findMany({
          where: { userId },
          include: { assessment: true },
          take: 30
        }),
        this.analyzeLearningPattern(userId, subject)
      ]);

      // Predict outcomes using AI
      const predictionPrompt = `
        Predict learning outcomes for user ${userId} in subject ${subject} over ${timeframe} days:
        
        Historical Sessions: ${JSON.stringify(sessions.map(s => ({
          duration: s.duration,
          rating: s.review?.rating,
          status: s.status,
          scheduledAt: s.scheduledAt
        })))}
        
        Assessment History: ${JSON.stringify(assessments.map(a => ({
          score: a.score,
          maxScore: a.assessment.maxScore,
          submittedAt: a.submittedAt
        })))}
        
        Learning Pattern: ${JSON.stringify(pattern)}
        
        Predict:
        1. Expected score improvement
        2. Confidence level in prediction
        3. Key factors affecting learning
        4. Personalized recommendations
        
        Return the prediction in JSON format.
      `;

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a learning prediction AI that forecasts educational outcomes based on historical performance and learning patterns.'
          },
          {
            role: 'user',
            content: predictionPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error predicting learning outcomes:', error);
      throw new Error('Failed to predict learning outcomes');
    }
  }

  async optimizeLearningSchedule(
    userId: string,
    subjects: string[],
    availableHours: number,
    preferences: {
      preferredDays: number[];
      preferredTimes: string[];
      sessionDuration: number;
    }
  ): Promise<Array<{
    subject: string;
    dayOfWeek: number;
    time: string;
    duration: number;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>> {
    try {
      await this.ensureZAIInitialized();
      // Get user's learning patterns for each subject
      const patterns = await Promise.all(
        subjects.map(subject => this.analyzeLearningPattern(userId, subject))
      );

      // Get existing commitments
      const existingSessions = await db.session.findMany({
        where: {
          studentId: userId,
          scheduledAt: {
            gte: new Date()
          }
        },
        orderBy: {
          scheduledAt: 'asc'
        },
        take: 20
      });

      // Optimize schedule using AI
      const schedulePrompt = `
        Optimize learning schedule for user ${userId}:
        
        Subjects: ${subjects.join(', ')}
        Available Hours: ${availableHours}
        Preferences: ${JSON.stringify(preferences)}
        Learning Patterns: ${JSON.stringify(patterns.map((p, i) => ({
          subject: subjects[i],
          pattern: p
        })))}
        Existing Sessions: ${JSON.stringify(existingSessions.map(s => ({
          subject: s.title,
          dayOfWeek: new Date(s.scheduledAt).getDay(),
          time: new Date(s.scheduledAt).toLocaleTimeString(),
          duration: s.duration
        })))}
        
        Create an optimized weekly schedule that:
        1. Maximizes learning efficiency
        2. Considers learning patterns and preferences
        3. Balances subject difficulty
        4. Avoids cognitive overload
        5. Accounts for optimal learning times
        
        Return the schedule in JSON format.
      `;

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert scheduling AI that optimizes learning schedules based on individual patterns and cognitive science principles.'
          },
          {
            role: 'user',
            content: schedulePrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content || '[]');
    } catch (error) {
      console.error('Error optimizing learning schedule:', error);
      throw new Error('Failed to optimize learning schedule');
    }
  }
}

export const advancedLearningEngine = new AdvancedLearningEngine();