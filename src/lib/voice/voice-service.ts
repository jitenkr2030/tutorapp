import { db } from '@/lib/db';
import { 
  VoiceExercise, 
  VoiceSession, 
  VoiceUserProgress,
  VoiceExerciseType,
  VoiceLanguage,
  VoiceProficiencyLevel
} from '@prisma/client';

export interface VoiceSessionCreateInput {
  userId: string;
  exerciseId: string;
  sessionId?: string;
  audioUrl: string;
  transcript?: string;
  accuracy?: number;
  pronunciation?: number;
  fluency?: number;
  feedback?: string;
  score?: number;
  duration?: number;
  metadata?: string;
}

export interface VoiceProgressUpdateInput {
  userId: string;
  exerciseId: string;
  language: VoiceLanguage;
  score?: number;
  completed?: boolean;
  streakDays?: number;
  metadata?: string;
}

export class VoiceRecognitionService {
  // Voice Exercise Management
  static async getVoiceExercises(filters?: {
    type?: VoiceExerciseType;
    language?: VoiceLanguage;
    difficulty?: number;
    isActive?: boolean;
  }) {
    const where: any = {};
    
    if (filters?.type) where.type = filters.type;
    if (filters?.language) where.language = filters.language;
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return await db.voiceExercise.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            sessions: true,
            userProgress: true
          }
        }
      }
    });
  }

  static async getVoiceExerciseById(id: string) {
    return await db.voiceExercise.findUnique({
      where: { id },
      include: {
        sessions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        userProgress: {
          take: 10,
          orderBy: { lastAccessed: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  static async createVoiceExercise(data: {
    title: string;
    description: string;
    type: VoiceExerciseType;
    language: VoiceLanguage;
    difficulty: number;
    content: string;
    audioUrl?: string;
    metadata?: string;
  }) {
    return await db.voiceExercise.create({
      data
    });
  }

  static async updateVoiceExercise(id: string, data: Partial<VoiceExercise>) {
    return await db.voiceExercise.update({
      where: { id },
      data
    });
  }

  static async deleteVoiceExercise(id: string) {
    return await db.voiceExercise.delete({
      where: { id }
    });
  }

  // Voice Session Management
  static async createVoiceSession(data: VoiceSessionCreateInput) {
    return await db.voiceSession.create({
      data: {
        userId: data.userId,
        exerciseId: data.exerciseId,
        sessionId: data.sessionId,
        audioUrl: data.audioUrl,
        transcript: data.transcript,
        accuracy: data.accuracy,
        pronunciation: data.pronunciation,
        fluency: data.fluency,
        feedback: data.feedback,
        score: data.score,
        duration: data.duration,
        metadata: data.metadata
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        exercise: true,
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true
          }
        }
      }
    });
  }

  static async getUserVoiceSessions(userId: string, limit: number = 20) {
    return await db.voiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        exercise: true,
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true
          }
        }
      }
    });
  }

  static async getVoiceSessionById(id: string) {
    return await db.voiceSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        exercise: true,
        session: true
      }
    });
  }

  // Voice Progress Management
  static async updateVoiceProgress(data: VoiceProgressUpdateInput) {
    const { userId, exerciseId, language, score, completed, streakDays, metadata } = data;

    return await db.voiceUserProgress.upsert({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId
        }
      },
      update: {
        totalScore: score !== undefined ? (await db.voiceUserProgress.findUnique({
          where: {
            userId_exerciseId: {
              userId,
              exerciseId
            }
          }
        }))?.totalScore || 0 + score : undefined,
        bestScore: score !== undefined ? Math.max(score, (await db.voiceUserProgress.findUnique({
          where: {
            userId_exerciseId: {
              userId,
              exerciseId
            }
          }
        }))?.bestScore || 0) : undefined,
        attempts: {
          increment: 1
        },
        completed: completed || false,
        streakDays: streakDays,
        lastAccessed: new Date(),
        metadata
      },
      create: {
        userId,
        exerciseId,
        language,
        totalScore: score || 0,
        bestScore: score,
        attempts: 1,
        completed: completed || false,
        streakDays: streakDays || 0,
        lastAccessed: new Date(),
        metadata
      }
    });
  }

  static async getVoiceProgress(userId: string, exerciseId: string) {
    return await db.voiceUserProgress.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId
        }
      }
    });
  }

  static async getUserVoiceProgress(userId: string, language?: VoiceLanguage) {
    const where: any = { userId };
    if (language) where.language = language;

    return await db.voiceUserProgress.findMany({
      where,
      include: {
        exercise: true
      },
      orderBy: { lastAccessed: 'desc' }
    });
  }

  // Analytics and Statistics
  static async getVoiceAnalytics(exerciseId?: string, language?: VoiceLanguage) {
    const where: any = {};
    if (exerciseId) where.exerciseId = exerciseId;
    if (language) where.language = language;

    const sessions = await db.voiceSession.findMany({
      where: exerciseId ? { exerciseId } : {},
      include: {
        exercise: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgAccuracy = sessions.filter(s => s.accuracy !== null).reduce((sum, session) => sum + (session.accuracy || 0), 0) / sessions.filter(s => s.accuracy !== null).length || 0;
    const avgPronunciation = sessions.filter(s => s.pronunciation !== null).reduce((sum, session) => sum + (session.pronunciation || 0), 0) / sessions.filter(s => s.pronunciation !== null).length || 0;
    const avgFluency = sessions.filter(s => s.fluency !== null).reduce((sum, session) => sum + (session.fluency || 0), 0) / sessions.filter(s => s.fluency !== null).length || 0;
    const avgScore = sessions.filter(s => s.score !== null).reduce((sum, session) => sum + (session.score || 0), 0) / sessions.filter(s => s.score !== null).length || 0;

    const exerciseTypeStats = sessions.reduce((acc, session) => {
      const type = session.exercise.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<VoiceExerciseType, number>);

    const languageStats = sessions.reduce((acc, session) => {
      const lang = session.exercise.language;
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<VoiceLanguage, number>);

    return {
      totalSessions,
      totalDuration,
      avgAccuracy,
      avgPronunciation,
      avgFluency,
      avgScore,
      exerciseTypeStats,
      languageStats,
      recentSessions: sessions.slice(0, 10)
    };
  }

  static async getUserVoiceSummary(userId: string) {
    const [sessions, progress] = await Promise.all([
      this.getUserVoiceSessions(userId, 100),
      this.getUserVoiceProgress(userId)
    ]);

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalScore = sessions.reduce((sum, session) => sum + (session.score || 0), 0);
    
    const avgAccuracy = sessions.filter(s => s.accuracy !== null).reduce((sum, session) => sum + (session.accuracy || 0), 0) / sessions.filter(s => s.accuracy !== null).length || 0;
    const avgPronunciation = sessions.filter(s => s.pronunciation !== null).reduce((sum, session) => sum + (session.pronunciation || 0), 0) / sessions.filter(s => s.pronunciation !== null).length || 0;
    const avgFluency = sessions.filter(s => s.fluency !== null).reduce((sum, session) => sum + (session.fluency || 0), 0) / sessions.filter(s => s.fluency !== null).length || 0;
    
    const completedExercises = progress.filter(p => p.completed).length;
    const totalStreakDays = progress.reduce((sum, p) => sum + p.streakDays, 0);
    
    const languageProgress = progress.reduce((acc, p) => {
      const lang = p.language;
      if (!acc[lang]) {
        acc[lang] = {
          exercises: 0,
          completed: 0,
          totalScore: 0,
          avgScore: 0
        };
      }
      acc[lang].exercises += 1;
      if (p.completed) acc[lang].completed += 1;
      acc[lang].totalScore += p.totalScore;
      return acc;
    }, {} as Record<VoiceLanguage, any>);

    // Calculate average scores per language
    Object.keys(languageProgress).forEach(lang => {
      const langData = languageProgress[lang as VoiceLanguage];
      langData.avgScore = langData.exercises > 0 ? langData.totalScore / langData.exercises : 0;
    });

    return {
      totalSessions,
      totalDuration,
      totalScore,
      avgAccuracy,
      avgPronunciation,
      avgFluency,
      completedExercises,
      totalStreakDays,
      languageProgress,
      recentActivity: sessions.slice(0, 10)
    };
  }

  // AI-powered feedback generation (placeholder for actual AI integration)
  static async generateVoiceFeedback(audioUrl: string, exerciseContent: string, exerciseType: VoiceExerciseType): Promise<{
    transcript?: string;
    accuracy?: number;
    pronunciation?: number;
    fluency?: number;
    feedback?: string;
    score?: number;
  }> {
    // This is a placeholder implementation
    // In a real application, this would integrate with speech recognition APIs
    // like Google Speech-to-Text, Amazon Transcribe, or similar services
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock feedback
      return {
        transcript: "This is a simulated transcript of the user's speech.",
        accuracy: 0.85,
        pronunciation: 0.78,
        fluency: 0.82,
        feedback: "Good pronunciation overall. Pay attention to the vowel sounds in the middle of words. Try to speak a bit more slowly for better clarity.",
        score: 82
      };
    } catch (error) {
      console.error('Error generating voice feedback:', error);
      return {
        feedback: "Unable to process audio. Please try again.",
        score: 0
      };
    }
  }

  // Language proficiency assessment
  static async assessUserProficiency(userId: string, language: VoiceLanguage): Promise<{
    level: VoiceProficiencyLevel;
    confidence: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    const progress = await this.getUserVoiceProgress(userId, language);
    const sessions = await db.voiceSession.findMany({
      where: {
        userId,
        exercise: {
          language
        }
      },
      include: {
        exercise: true
      }
    });

    if (sessions.length === 0) {
      return {
        level: VoiceProficiencyLevel.BEGINNER,
        confidence: 0.5,
        strengths: [],
        weaknesses: ["No practice sessions yet"],
        recommendations: ["Start with basic pronunciation exercises"]
      };
    }

    const avgAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length;
    const avgPronunciation = sessions.reduce((sum, s) => sum + (s.pronunciation || 0), 0) / sessions.length;
    const avgFluency = sessions.reduce((sum, s) => sum + (s.fluency || 0), 0) / sessions.length;
    const avgScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length;

    let level: VoiceProficiencyLevel;
    let confidence: number;

    if (avgScore >= 90) {
      level = VoiceProficiencyLevel.NATIVE;
      confidence = 0.9;
    } else if (avgScore >= 80) {
      level = VoiceProficiencyLevel.ADVANCED;
      confidence = 0.8;
    } else if (avgScore >= 65) {
      level = VoiceProficiencyLevel.INTERMEDIATE;
      confidence = 0.7;
    } else {
      level = VoiceProficiencyLevel.BEGINNER;
      confidence = 0.6;
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (avgPronunciation > 0.8) strengths.push("Good pronunciation");
    else weaknesses.push("Pronunciation needs improvement");

    if (avgFluency > 0.8) strengths.push("Good fluency and rhythm");
    else weaknesses.push("Fluency could be better");

    if (avgAccuracy > 0.8) strengths.push("High accuracy in speech recognition");
    else weaknesses.push("Accuracy in speech recognition needs work");

    // Generate recommendations based on performance
    if (level === VoiceProficiencyLevel.BEGINNER) {
      recommendations.push("Focus on basic vocabulary and simple sentences");
      recommendations.push("Practice pronunciation of individual sounds");
    } else if (level === VoiceProficiencyLevel.INTERMEDIATE) {
      recommendations.push("Practice more complex sentence structures");
      recommendations.push("Work on conversational fluency");
    } else if (level === VoiceProficiencyLevel.ADVANCED) {
      recommendations.push("Practice advanced vocabulary and idioms");
      recommendations.push("Focus on native-like pronunciation and rhythm");
    }

    return {
      level,
      confidence,
      strengths,
      weaknesses,
      recommendations
    };
  }
}