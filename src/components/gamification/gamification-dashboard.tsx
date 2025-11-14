"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Trophy, Gift, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface UserPoints {
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  streakDays: number;
}

interface PointTransaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: string;
  rarity: string;
  pointsValue: number;
  earnedAt: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
  points: number;
  unlockedAt: string;
}

interface GamificationStats {
  totalPoints: number;
  level: number;
  badgesCount: number;
  achievementsCount: number;
  currentStreak: number;
  leaderboardPositions: Array<{ leaderboardName: string; rank: number }>;
}

export function GamificationDashboard() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      
      // Fetch user points
      const pointsResponse = await fetch('/api/gamification/points');
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setUserPoints(pointsData);
      }

      // Fetch transactions
      const transactionsResponse = await fetch('/api/gamification/transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }

      // Fetch badges
      const badgesResponse = await fetch('/api/gamification/badges');
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }

      // Fetch achievements
      const achievementsResponse = await fetch('/api/gamification/achievements');
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData);
      }

      // Fetch stats
      const statsResponse = await fetch('/api/gamification/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-yellow-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'SESSION_COMPLETED': return <Target className="h-4 w-4" />;
      case 'HOMEWORK_SUBMITTED': return <Award className="h-4 w-4" />;
      case 'ASSESSMENT_PASSED': return <Trophy className="h-4 w-4" />;
      case 'BADGE_EARNED': return <Star className="h-4 w-4" />;
      case 'ACHIEVEMENT_UNLOCKED': return <TrendingUp className="h-4 w-4" />;
      case 'POINTS_REDEEMED': return <Gift className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.totalPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userPoints?.availablePoints || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.level || 1}</div>
            <p className="text-xs text-muted-foreground">
              {userPoints ? `${userPoints.experience}/${userPoints.nextLevelExp} XP` : '0/100 XP'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
            <p className="text-xs text-muted-foreground">
              Earned achievements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.streakDays || 0}</div>
            <p className="text-xs text-muted-foreground">
              Days active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {userPoints && (
        <Card>
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
            <CardDescription>
              Your progress towards the next level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {userPoints.level}</span>
                <span>{userPoints.experience} / {userPoints.nextLevelExp} XP</span>
              </div>
              <Progress 
                value={(userPoints.experience / userPoints.nextLevelExp) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {userPoints.nextLevelExp - userPoints.experience} XP needed for next level
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="transactions">Point History</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
                <CardDescription>
                  Badges you've earned through your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 gap-4">
                    {badges.map((badge) => (
                      <div key={badge.id} className="text-center">
                        <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                        <h4 className="font-semibold text-sm">{badge.name}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs mt-1 ${getRarityColor(badge.rarity)}`}
                        >
                          {badge.rarity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(badge.earnedAt)}
                        </p>
                      </div>
                    ))}
                    {badges.length === 0 && (
                      <div className="col-span-2 text-center text-muted-foreground py-8">
                        No badges earned yet. Keep learning to earn your first badge!
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Achievements Section */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Milestones you've reached in your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-4">
                        <div className="text-2xl">{achievement.icon || '⭐'}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{achievement.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              +{achievement.points} points
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(achievement.unlockedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {achievements.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No achievements unlocked yet. Complete sessions to unlock achievements!
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Point History</CardTitle>
              <CardDescription>
                Your recent point transactions and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-sm">{transaction.description || transaction.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No transactions yet. Start learning to earn points!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
              <CardDescription>
                Redeem your points for exciting rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sample rewards - in a real app, these would come from the API */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">🎁</div>
                    <CardTitle className="text-lg">10% Discount</CardTitle>
                    <CardDescription>Get 10% off your next session</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary">500 points</Badge>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <CardTitle className="text-lg">Study Materials</CardTitle>
                    <CardDescription>Access premium study resources</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary">1000 points</Badge>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">⭐</div>
                    <CardTitle className="text-lg">Priority Booking</CardTitle>
                    <CardDescription>Get priority access to tutors</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary">2000 points</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboards</CardTitle>
              <CardDescription>
                See how you rank against other learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.leaderboardPositions && stats.leaderboardPositions.length > 0 ? (
                  stats.leaderboardPositions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {position.rank === 1 ? '🥇' : position.rank === 2 ? '🥈' : position.rank === 3 ? '🥉' : `#${position.rank}`}
                        </div>
                        <div>
                          <p className="font-semibold">{position.leaderboardName}</p>
                          <p className="text-sm text-muted-foreground">Current rank</p>
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No leaderboard positions yet. Keep earning points to climb the ranks!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}