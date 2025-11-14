import { db } from '@/lib/db';
import { 
  UserPoints, 
  PointTransaction, 
  Badge, 
  UserBadge, 
  Achievement, 
  UserAchievement,
  Leaderboard,
  LeaderboardEntry,
  Reward,
  UserReward,
  PointTransactionType,
  AchievementType,
  BadgeCategory,
  LeaderboardType,
  LeaderboardScope
} from '@prisma/client';

export interface GamificationService {
  // Points Management
  awardPoints(userId: string, amount: number, type: PointTransactionType, description?: string, referenceId?: string): Promise<void>;
  getUserPoints(userId: string): Promise<UserPoints | null>;
  getPointTransactions(userId: string, limit?: number): Promise<PointTransaction[]>;
  redeemPoints(userId: string, amount: number, description?: string): Promise<boolean>;
  
  // Badge Management
  awardBadge(userId: string, badgeId: string): Promise<void>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  getAvailableBadges(): Promise<Badge[]>;
  checkBadgeProgress(userId: string, badgeId: string): Promise<number>;
  
  // Achievement Management
  unlockAchievement(userId: string, achievementId: string): Promise<void>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  getAvailableAchievements(): Promise<Achievement[]>;
  checkAchievementProgress(userId: string, achievementId: string): Promise<number>;
  
  // Leaderboard Management
  updateLeaderboard(leaderboardId: string): Promise<void>;
  getLeaderboard(leaderboardId: string, limit?: number): Promise<(LeaderboardEntry & { user: { name: string; avatar?: string } })[]>;
  getUserRank(leaderboardId: string, userId: string): Promise<LeaderboardEntry | null>;
  createLeaderboard(name: string, type: LeaderboardType, scope: LeaderboardScope, subject?: string): Promise<Leaderboard>;
  
  // Reward Management
  getAvailableRewards(): Promise<Reward[]>;
  redeemReward(userId: string, rewardId: string): Promise<boolean>;
  getUserRewards(userId: string): Promise<(UserReward & { reward: Reward })[]>;
  
  // Analytics
  getGamificationStats(userId: string): Promise<{
    totalPoints: number;
    level: number;
    badgesCount: number;
    achievementsCount: number;
    currentStreak: number;
    leaderboardPositions: Array<{ leaderboardName: string; rank: number }>;
  }>;
}

class GamificationServiceImpl implements GamificationService {
  // Points Management
  async awardPoints(userId: string, amount: number, type: PointTransactionType, description?: string, referenceId?: string): Promise<void> {
    try {
      // Get or create user points
      let userPoints = await db.userPoints.findUnique({
        where: { userId }
      });

      if (!userPoints) {
        userPoints = await db.userPoints.create({
          data: {
            userId,
            totalPoints: 0,
            availablePoints: 0,
            redeemedPoints: 0,
            level: 1,
            experience: 0,
            nextLevelExp: 100,
            streakDays: 0
          }
        });
      }

      // Create point transaction
      await db.pointTransaction.create({
        data: {
          userId,
          type,
          amount,
          description,
          referenceId,
          metadata: JSON.stringify({ awardedAt: new Date().toISOString() })
        }
      });

      // Update user points
      const newTotalPoints = userPoints.totalPoints + amount;
      const newAvailablePoints = userPoints.availablePoints + amount;
      const newExperience = userPoints.experience + amount;

      // Check for level up
      let newLevel = userPoints.level;
      let nextLevelExp = userPoints.nextLevelExp;
      
      while (newExperience >= nextLevelExp) {
        newLevel++;
        nextLevelExp = Math.floor(nextLevelExp * 1.5); // 50% increase per level
      }

      await db.userPoints.update({
        where: { userId },
        data: {
          totalPoints: newTotalPoints,
          availablePoints: newAvailablePoints,
          experience: newExperience,
          level: newLevel,
          nextLevelExp: nextLevelExp,
          lastActivity: new Date()
        }
      });

      // Check for achievements and badges
      await this.checkAndAwardAchievements(userId, type, amount);
      await this.checkAndAwardBadges(userId, type, amount);

    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  async getUserPoints(userId: string): Promise<UserPoints | null> {
    return await db.userPoints.findUnique({
      where: { userId }
    });
  }

  async getPointTransactions(userId: string, limit: number = 50): Promise<PointTransaction[]> {
    return await db.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async redeemPoints(userId: string, amount: number, description?: string): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      
      if (!userPoints || userPoints.availablePoints < amount) {
        return false;
      }

      // Create redemption transaction
      await db.pointTransaction.create({
        data: {
          userId,
          type: 'POINTS_REDEEMED',
          amount: -amount,
          description: description || `Redeemed ${amount} points`,
          metadata: JSON.stringify({ redeemedAt: new Date().toISOString() })
        }
      });

      // Update user points
      await db.userPoints.update({
        where: { userId },
        data: {
          availablePoints: userPoints.availablePoints - amount,
          redeemedPoints: userPoints.redeemedPoints + amount,
          lastActivity: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      return false;
    }
  }

  // Badge Management
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      // Check if user already has this badge
      const existingBadge = await db.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId
          }
        }
      });

      if (existingBadge) {
        return; // Already has the badge
      }

      // Get badge details
      const badge = await db.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        throw new Error('Badge not found');
      }

      // Award badge
      await db.userBadge.create({
        data: {
          userId,
          badgeId,
          progress: 1.0,
          metadata: JSON.stringify({ awardedAt: new Date().toISOString() })
        }
      });

      // Award points for badge
      if (badge.pointsValue > 0) {
        await this.awardPoints(userId, badge.pointsValue, 'BADGE_EARNED', `Earned badge: ${badge.name}`);
      }

    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    return await db.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    });
  }

  async getAvailableBadges(): Promise<Badge[]> {
    return await db.badge.findMany({
      where: { isActive: true },
      orderBy: [{ rarity: 'desc' }, { name: 'asc' }]
    });
  }

  async checkBadgeProgress(userId: string, badgeId: string): Promise<number> {
    try {
      const badge = await db.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        return 0;
      }

      const criteria = JSON.parse(badge.criteria);
      const userBadge = await db.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId
          }
        }
      });

      if (userBadge) {
        return userBadge.progress;
      }

      // Calculate progress based on criteria
      return await this.calculateBadgeProgress(userId, criteria);
    } catch (error) {
      console.error('Error checking badge progress:', error);
      return 0;
    }
  }

  // Achievement Management
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      // Check if user already has this achievement
      const existingAchievement = await db.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        }
      });

      if (existingAchievement) {
        return; // Already unlocked
      }

      // Get achievement details
      const achievement = await db.achievement.findUnique({
        where: { id: achievementId }
      });

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      // Unlock achievement
      await db.userAchievement.create({
        data: {
          userId,
          achievementId,
          progress: 1.0,
          metadata: JSON.stringify({ unlockedAt: new Date().toISOString() })
        }
      });

      // Award points for achievement
      if (achievement.points > 0) {
        await this.awardPoints(userId, achievement.points, 'ACHIEVEMENT_UNLOCKED', `Unlocked achievement: ${achievement.name}`);
      }

      // Award associated badge if any
      if (achievement.badgeId) {
        await this.awardBadge(userId, achievement.badgeId);
      }

    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' }
    });
  }

  async getAvailableAchievements(): Promise<Achievement[]> {
    return await db.achievement.findMany({
      where: { isActive: true },
      orderBy: { type: 'asc' }
    });
  }

  async checkAchievementProgress(userId: string, achievementId: string): Promise<number> {
    try {
      const achievement = await db.achievement.findUnique({
        where: { id: achievementId }
      });

      if (!achievement) {
        return 0;
      }

      const criteria = JSON.parse(achievement.criteria);
      const userAchievement = await db.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        }
      });

      if (userAchievement) {
        return userAchievement.progress;
      }

      // Calculate progress based on criteria
      return await this.calculateAchievementProgress(userId, criteria);
    } catch (error) {
      console.error('Error checking achievement progress:', error);
      return 0;
    }
  }

  // Leaderboard Management
  async updateLeaderboard(leaderboardId: string): Promise<void> {
    try {
      const leaderboard = await db.leaderboard.findUnique({
        where: { id: leaderboardId }
      });

      if (!leaderboard) {
        throw new Error('Leaderboard not found');
      }

      // Get all user points within the leaderboard scope
      const userPoints = await db.userPoints.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              studentProfile: {
                select: {
                  school: true,
                  grade: true
                }
              }
            }
          }
        }
      });

      // Filter users based on leaderboard scope
      const filteredUsers = this.filterUsersByScope(userPoints, leaderboard.scope, leaderboard.subject);

      // Sort by score (points)
      const sortedUsers = filteredUsers.sort((a, b) => b.totalPoints - a.totalPoints);

      // Update leaderboard entries
      for (let i = 0; i < sortedUsers.length; i++) {
        const userPoint = sortedUsers[i];
        const previousEntry = await db.leaderboardEntry.findUnique({
          where: {
            leaderboardId_userId: {
              leaderboardId,
              userId: userPoint.userId
            }
          }
        });

        if (previousEntry) {
          await db.leaderboardEntry.update({
            where: { id: previousEntry.id },
            data: {
              rank: i + 1,
              score: userPoint.totalPoints,
              previousRank: previousEntry.rank,
              updatedAt: new Date()
            }
          });
        } else {
          await db.leaderboardEntry.create({
            data: {
              leaderboardId,
              userId: userPoint.userId,
              rank: i + 1,
              score: userPoint.totalPoints,
              previousRank: null,
              metadata: JSON.stringify({ firstAppearance: true })
            }
          });
        }
      }

    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  }

  async getLeaderboard(leaderboardId: string, limit: number = 50): Promise<(LeaderboardEntry & { user: { name: string; avatar?: string } })[]> {
    return await db.leaderboardEntry.findMany({
      where: { leaderboardId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { rank: 'asc' },
      take: limit
    });
  }

  async getUserRank(leaderboardId: string, userId: string): Promise<LeaderboardEntry | null> {
    return await db.leaderboardEntry.findUnique({
      where: {
        leaderboardId_userId: {
          leaderboardId,
          userId
        }
      }
    });
  }

  async createLeaderboard(name: string, type: LeaderboardType, scope: LeaderboardScope, subject?: string): Promise<Leaderboard> {
    const now = new Date();
    let startDate = now;
    let endDate: Date;

    switch (type) {
      case 'WEEKLY':
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'MONTHLY':
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case 'ALL_TIME':
        endDate = new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years
        break;
      default:
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
    }

    return await db.leaderboard.create({
      data: {
        name,
        type,
        scope,
        subject,
        startDate,
        endDate,
        isActive: true
      }
    });
  }

  // Reward Management
  async getAvailableRewards(): Promise<Reward[]> {
    return await db.reward.findMany({
      where: { isActive: true },
      orderBy: { value: 'asc' }
    });
  }

  async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    try {
      const reward = await db.reward.findUnique({
        where: { id: rewardId }
      });

      if (!reward || !reward.isActive) {
        return false;
      }

      const userPoints = await this.getUserPoints(userId);
      
      if (!userPoints || userPoints.availablePoints < reward.value) {
        return false;
      }

      // Check stock for limited rewards
      if (reward.stock !== null) {
        const redeemedCount = await db.userReward.count({
          where: { rewardId, status: 'active' }
        });

        if (redeemedCount >= reward.stock) {
          return false;
        }
      }

      // Redeem points
      const redeemed = await this.redeemPoints(userId, reward.value, `Redeemed reward: ${reward.name}`);
      
      if (!redeemed) {
        return false;
      }

      // Create user reward
      await db.userReward.create({
        data: {
          userId,
          rewardId,
          status: 'active',
          metadata: JSON.stringify({ redeemedAt: new Date().toISOString() })
        }
      });

      return true;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }
  }

  async getUserRewards(userId: string): Promise<(UserReward & { reward: Reward })[]> {
    return await db.userReward.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { redeemedAt: 'desc' }
    });
  }

  // Analytics
  async getGamificationStats(userId: string): Promise<{
    totalPoints: number;
    level: number;
    badgesCount: number;
    achievementsCount: number;
    currentStreak: number;
    leaderboardPositions: Array<{ leaderboardName: string; rank: number }>;
  }> {
    const userPoints = await this.getUserPoints(userId);
    const userBadges = await this.getUserBadges(userId);
    const userAchievements = await this.getUserAchievements(userId);

    // Get leaderboard positions
    const leaderboards = await db.leaderboard.findMany({
      where: { isActive: true },
      include: {
        entries: {
          where: { userId },
          select: { rank: true }
        }
      }
    });

    const leaderboardPositions = leaderboards
      .filter(lb => lb.entries.length > 0)
      .map(lb => ({
        leaderboardName: lb.name,
        rank: lb.entries[0].rank
      }));

    return {
      totalPoints: userPoints?.totalPoints || 0,
      level: userPoints?.level || 1,
      badgesCount: userBadges.length,
      achievementsCount: userAchievements.length,
      currentStreak: userPoints?.streakDays || 0,
      leaderboardPositions
    };
  }

  // Helper methods
  private async checkAndAwardAchievements(userId: string, type: PointTransactionType, amount: number): Promise<void> {
    // This would contain logic to check for achievement conditions
    // For now, we'll implement a simple example
    if (type === 'SESSION_COMPLETED') {
      const sessionCount = await db.pointTransaction.count({
        where: {
          userId,
          type: 'SESSION_COMPLETED'
        }
      });

      if (sessionCount >= 10) {
        const achievement = await db.achievement.findFirst({
          where: {
            type: 'SESSION_COMPLETED',
            isActive: true
          }
        });

        if (achievement) {
          await this.unlockAchievement(userId, achievement.id);
        }
      }
    }
  }

  private async checkAndAwardBadges(userId: string, type: PointTransactionType, amount: number): Promise<void> {
    // This would contain logic to check for badge conditions
    // For now, we'll implement a simple example
    if (type === 'SESSION_COMPLETED') {
      const sessionCount = await db.pointTransaction.count({
        where: {
          userId,
          type: 'SESSION_COMPLETED'
        }
      });

      if (sessionCount >= 5) {
        const badge = await db.badge.findFirst({
          where: {
            category: 'ACADEMIC',
            isActive: true
          }
        });

        if (badge) {
          await this.awardBadge(userId, badge.id);
        }
      }
    }
  }

  private async calculateBadgeProgress(userId: string, criteria: any): Promise<number> {
    // This would contain logic to calculate badge progress based on criteria
    // For now, return a simple calculation
    return 0;
  }

  private async calculateAchievementProgress(userId: string, criteria: any): Promise<number> {
    // This would contain logic to calculate achievement progress based on criteria
    // For now, return a simple calculation
    return 0;
  }

  private filterUsersByScope(userPoints: any[], scope: LeaderboardScope, subject?: string): any[] {
    switch (scope) {
      case 'GLOBAL':
        return userPoints;
      case 'SCHOOL':
        return userPoints.filter(up => up.user.studentProfile?.school);
      case 'GRADE':
        return userPoints.filter(up => up.user.studentProfile?.grade);
      case 'SUBJECT':
        return userPoints.filter(up => subject); // This would need more complex filtering
      default:
        return userPoints;
    }
  }
}

// Export singleton instance
export const gamificationService = new GamificationServiceImpl();