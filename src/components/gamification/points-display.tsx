"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Trophy, Gift, TrendingUp, Clock, Target, Award, Zap } from 'lucide-react';
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

interface GamificationStats {
  totalPoints: number;
  level: number;
  badgesCount: number;
  achievementsCount: number;
  currentStreak: number;
  leaderboardPositions: Array<{ leaderboardName: string; rank: number }>;
}

export function PointsDisplay() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPointsData();
    }
  }, [user]);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      
      // Fetch user points
      const pointsResponse = await fetch('/api/gamification/points');
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setUserPoints(pointsData);
      }

      // Fetch stats
      const statsResponse = await fetch('/api/gamification/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-purple-600';
    if (level >= 15) return 'text-blue-600';
    if (level >= 10) return 'text-green-600';
    if (level >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getLevelTitle = (level: number) => {
    if (level >= 20) return 'Master Learner';
    if (level >= 15) return 'Expert Scholar';
    if (level >= 10) return 'Advanced Student';
    if (level >= 5) return 'Dedicated Learner';
    return 'Beginner';
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Your Learning Progress</span>
        </CardTitle>
        <CardDescription>
          Track your points, level, and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level and Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              <Trophy className={`h-8 w-8 ${getLevelColor(userPoints?.level || 1)}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">Level {userPoints?.level || 1}</p>
              <p className="text-sm text-muted-foreground">
                {getLevelTitle(userPoints?.level || 1)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{userPoints?.totalPoints || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </div>
        </div>

        {/* Level Progress */}
        {userPoints && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userPoints.level + 1}</span>
              <span>{userPoints.experience} / {userPoints.nextLevelExp} XP</span>
            </div>
            <Progress 
              value={(userPoints.experience / userPoints.nextLevelExp) * 100} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground">
              {userPoints.nextLevelExp - userPoints.experience} XP needed for next level
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">{stats?.badgesCount || 0}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-semibold text-sm">{stats?.achievementsCount || 0}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="font-semibold text-sm">{userPoints?.streakDays || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Gift className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-semibold text-sm">{userPoints?.availablePoints || 0}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Positions */}
        {stats?.leaderboardPositions && stats.leaderboardPositions.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-semibold mb-2">Leaderboard Positions</p>
            <div className="flex flex-wrap gap-2">
              {stats.leaderboardPositions.slice(0, 3).map((position, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {position.leaderboardName}: #{position.rank}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button className="w-full mt-4" variant="outline">
          View Full Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}