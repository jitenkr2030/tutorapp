import { db } from '@/lib/db';
import { 
  VRExperience, 
  ARExperience, 
  VRSession, 
  ARSession,
  VRUserProgress,
  ARUserProgress,
  VRExperienceType,
  ARExperienceType,
  VRDeviceType,
  ARDeviceType
} from '@prisma/client';

export interface VRSessionCreateInput {
  userId: string;
  experienceId: string;
  sessionId?: string;
  deviceType: VRDeviceType;
  metadata?: string;
}

export interface ARSessionCreateInput {
  userId: string;
  experienceId: string;
  sessionId?: string;
  deviceType: ARDeviceType;
  location?: string;
  metadata?: string;
}

export interface VRProgressUpdateInput {
  userId: string;
  experienceId: string;
  progress: number;
  timeSpent: number;
  score?: number;
  completed?: boolean;
  metadata?: string;
}

export interface ARProgressUpdateInput {
  userId: string;
  experienceId: string;
  progress: number;
  timeSpent: number;
  score?: number;
  completed?: boolean;
  metadata?: string;
}

export class VRARService {
  // VR Experience Management
  static async getVRExperiences(filters?: {
    type?: VRExperienceType;
    subject?: string;
    gradeLevel?: string;
    difficulty?: number;
    isActive?: boolean;
  }) {
    const where: any = {};
    
    if (filters?.type) where.type = filters.type;
    if (filters?.subject) where.subject = filters.subject;
    if (filters?.gradeLevel) where.gradeLevel = filters.gradeLevel;
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return await db.vRExperience.findMany({
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

  static async getVRExperienceById(id: string) {
    return await db.vRExperience.findUnique({
      where: { id },
      include: {
        sessions: {
          take: 10,
          orderBy: { startTime: 'desc' },
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

  static async createVRExperience(data: {
    title: string;
    description: string;
    type: VRExperienceType;
    subject: string;
    gradeLevel: string;
    difficulty: number;
    duration: number;
    thumbnailUrl?: string;
    contentUrl: string;
    metadata?: string;
  }) {
    return await db.vRExperience.create({
      data
    });
  }

  static async updateVRExperience(id: string, data: Partial<VRExperience>) {
    return await db.vRExperience.update({
      where: { id },
      data
    });
  }

  static async deleteVRExperience(id: string) {
    return await db.vRExperience.delete({
      where: { id }
    });
  }

  // AR Experience Management
  static async getARExperiences(filters?: {
    type?: ARExperienceType;
    subject?: string;
    gradeLevel?: string;
    difficulty?: number;
    isActive?: boolean;
  }) {
    const where: any = {};
    
    if (filters?.type) where.type = filters.type;
    if (filters?.subject) where.subject = filters.subject;
    if (filters?.gradeLevel) where.gradeLevel = filters.gradeLevel;
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return await db.aRExperience.findMany({
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

  static async getARExperienceById(id: string) {
    return await db.aRExperience.findUnique({
      where: { id },
      include: {
        sessions: {
          take: 10,
          orderBy: { startTime: 'desc' },
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

  static async createARExperience(data: {
    title: string;
    description: string;
    type: ARExperienceType;
    subject: string;
    gradeLevel: string;
    difficulty: number;
    markerUrl?: string;
    contentUrl: string;
    metadata?: string;
  }) {
    return await db.aRExperience.create({
      data
    });
  }

  static async updateARExperience(id: string, data: Partial<ARExperience>) {
    return await db.aRExperience.update({
      where: { id },
      data
    });
  }

  static async deleteARExperience(id: string) {
    return await db.aRExperience.delete({
      where: { id }
    });
  }

  // VR Session Management
  static async createVRSession(data: VRSessionCreateInput) {
    return await db.vRSession.create({
      data: {
        userId: data.userId,
        experienceId: data.experienceId,
        sessionId: data.sessionId,
        deviceType: data.deviceType,
        startTime: new Date(),
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
        experience: true
      }
    });
  }

  static async endVRSession(sessionId: string, data: {
    completionRate?: number;
    score?: number;
    interactions?: number;
    metadata?: string;
  }) {
    const endTime = new Date();
    const session = await db.vRSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('VR session not found');
    }

    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000); // minutes

    return await db.vRSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration,
        completionRate: data.completionRate ?? 0,
        score: data.score,
        interactions: data.interactions ?? 0,
        metadata: data.metadata
      }
    });
  }

  static async getUserVRSessions(userId: string, limit: number = 20) {
    return await db.vRSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        experience: true,
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

  // AR Session Management
  static async createARSession(data: ARSessionCreateInput) {
    return await db.aRSession.create({
      data: {
        userId: data.userId,
        experienceId: data.experienceId,
        sessionId: data.sessionId,
        deviceType: data.deviceType,
        location: data.location,
        startTime: new Date(),
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
        experience: true
      }
    });
  }

  static async endARSession(sessionId: string, data: {
    completionRate?: number;
    score?: number;
    interactions?: number;
    metadata?: string;
  }) {
    const endTime = new Date();
    const session = await db.aRSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('AR session not found');
    }

    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000); // minutes

    return await db.aRSession.update({
      where: { id: sessionId },
      data: {
        endTime,
        duration,
        completionRate: data.completionRate ?? 0,
        score: data.score,
        interactions: data.interactions ?? 0,
        metadata: data.metadata
      }
    });
  }

  static async getUserARSessions(userId: string, limit: number = 20) {
    return await db.aRSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        experience: true,
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

  // VR Progress Management
  static async updateVRProgress(data: VRProgressUpdateInput) {
    const { userId, experienceId, progress, timeSpent, score, completed, metadata } = data;

    return await db.vRUserProgress.upsert({
      where: {
        userId_experienceId: {
          userId,
          experienceId
        }
      },
      update: {
        progress: Math.max(0, Math.min(1, progress)),
        timeSpent,
        bestScore: score !== undefined ? Math.max(score, (await db.vRUserProgress.findUnique({
          where: {
            userId_experienceId: {
              userId,
              experienceId
            }
          }
        }))?.bestScore || 0) : undefined,
        attempts: {
          increment: 1
        },
        completed: completed || false,
        lastAccessed: new Date(),
        metadata
      },
      create: {
        userId,
        experienceId,
        progress: Math.max(0, Math.min(1, progress)),
        timeSpent,
        bestScore: score,
        attempts: 1,
        completed: completed || false,
        lastAccessed: new Date(),
        metadata
      }
    });
  }

  static async getVRProgress(userId: string, experienceId: string) {
    return await db.vRUserProgress.findUnique({
      where: {
        userId_experienceId: {
          userId,
          experienceId
        }
      }
    });
  }

  static async getUserVRProgress(userId: string) {
    return await db.vRUserProgress.findMany({
      where: { userId },
      include: {
        experience: true
      },
      orderBy: { lastAccessed: 'desc' }
    });
  }

  // AR Progress Management
  static async updateARProgress(data: ARProgressUpdateInput) {
    const { userId, experienceId, progress, timeSpent, score, completed, metadata } = data;

    return await db.aRUserProgress.upsert({
      where: {
        userId_experienceId: {
          userId,
          experienceId
        }
      },
      update: {
        progress: Math.max(0, Math.min(1, progress)),
        timeSpent,
        bestScore: score !== undefined ? Math.max(score, (await db.aRUserProgress.findUnique({
          where: {
            userId_experienceId: {
              userId,
              experienceId
            }
          }
        }))?.bestScore || 0) : undefined,
        attempts: {
          increment: 1
        },
        completed: completed || false,
        lastAccessed: new Date(),
        metadata
      },
      create: {
        userId,
        experienceId,
        progress: Math.max(0, Math.min(1, progress)),
        timeSpent,
        bestScore: score,
        attempts: 1,
        completed: completed || false,
        lastAccessed: new Date(),
        metadata
      }
    });
  }

  static async getARProgress(userId: string, experienceId: string) {
    return await db.aRUserProgress.findUnique({
      where: {
        userId_experienceId: {
          userId,
          experienceId
        }
      }
    });
  }

  static async getUserARProgress(userId: string) {
    return await db.aRUserProgress.findMany({
      where: { userId },
      include: {
        experience: true
      },
      orderBy: { lastAccessed: 'desc' }
    });
  }

  // Analytics and Statistics
  static async getVRAnalytics(experienceId?: string) {
    const where = experienceId ? { experienceId } : {};

    const sessions = await db.vRSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        experience: true
      }
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgCompletionRate = sessions.reduce((sum, session) => sum + session.completionRate, 0) / totalSessions || 0;
    const avgScore = sessions.filter(s => s.score !== null).reduce((sum, session) => sum + (session.score || 0), 0) / sessions.filter(s => s.score !== null).length || 0;

    const deviceTypeStats = sessions.reduce((acc, session) => {
      acc[session.deviceType] = (acc[session.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<VRDeviceType, number>);

    return {
      totalSessions,
      totalDuration,
      avgCompletionRate,
      avgScore,
      deviceTypeStats,
      recentSessions: sessions.slice(0, 10)
    };
  }

  static async getARAnalytics(experienceId?: string) {
    const where = experienceId ? { experienceId } : {};

    const sessions = await db.aRSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        experience: true
      }
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgCompletionRate = sessions.reduce((sum, session) => sum + session.completionRate, 0) / totalSessions || 0;
    const avgScore = sessions.filter(s => s.score !== null).reduce((sum, session) => sum + (session.score || 0), 0) / sessions.filter(s => s.score !== null).length || 0;

    const deviceTypeStats = sessions.reduce((acc, session) => {
      acc[session.deviceType] = (acc[session.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<ARDeviceType, number>);

    return {
      totalSessions,
      totalDuration,
      avgCompletionRate,
      avgScore,
      deviceTypeStats,
      recentSessions: sessions.slice(0, 10)
    };
  }

  static async getUserVRARSummary(userId: string) {
    const [vrSessions, arSessions, vrProgress, arProgress] = await Promise.all([
      this.getUserVRSessions(userId, 100),
      this.getUserARSessions(userId, 100),
      this.getUserVRProgress(userId),
      this.getUserARProgress(userId)
    ]);

    const totalVRSessions = vrSessions.length;
    const totalARSessions = arSessions.length;
    const totalVRTime = vrSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalARTime = arSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    
    const completedVRExperiences = vrProgress.filter(p => p.completed).length;
    const completedARExperiences = arProgress.filter(p => p.completed).length;
    
    const avgVRCompletion = vrSessions.length > 0 
      ? vrSessions.reduce((sum, session) => sum + session.completionRate, 0) / vrSessions.length 
      : 0;
    const avgARCompletion = arSessions.length > 0 
      ? arSessions.reduce((sum, session) => sum + session.completionRate, 0) / arSessions.length 
      : 0;

    return {
      totalSessions: totalVRSessions + totalARSessions,
      totalTime: totalVRTime + totalARTime,
      vrStats: {
        sessions: totalVRSessions,
        time: totalVRTime,
        completedExperiences: completedVRExperiences,
        avgCompletionRate: avgVRCompletion
      },
      arStats: {
        sessions: totalARSessions,
        time: totalARTime,
        completedExperiences: completedARExperiences,
        avgCompletionRate: avgARCompletion
      },
      recentActivity: [...vrSessions, ...arSessions]
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10)
    };
  }
}