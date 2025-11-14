"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  previousRank?: number;
  user: {
    name: string;
    avatar?: string;
  };
}

interface Leaderboard {
  id: string;
  name: string;
  type: string;
  scope: string;
  subject?: string;
  isActive: boolean;
}

export function LeaderboardComponent() {
  const { user } = useAuth();
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  useEffect(() => {
    if (selectedLeaderboard) {
      fetchLeaderboardEntries(selectedLeaderboard);
    }
  }, [selectedLeaderboard]);

  const fetchLeaderboards = async () => {
    try {
      const response = await fetch('/api/gamification/leaderboards');
      if (response.ok) {
        const data = await response.json();
        setLeaderboards(data);
        if (data.length > 0) {
          setSelectedLeaderboard(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardEntries = async (leaderboardId: string) => {
    try {
      const response = await fetch(`/api/gamification/leaderboards/${leaderboardId}/entries`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }

      // Fetch user rank
      if (user) {
        const rankResponse = await fetch(`/api/gamification/leaderboards/${leaderboardId}/rank`);
        if (rankResponse.ok) {
          const rankData = await rankResponse.json();
          setUserRank(rankData);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard entries:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-semibold">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null;
    if (current < previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current > previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getLeaderboardTypeColor = (type: string) => {
    switch (type) {
      case 'WEEKLY': return 'bg-blue-100 text-blue-800';
      case 'MONTHLY': return 'bg-green-100 text-green-800';
      case 'ALL_TIME': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-6 w-48 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Leaderboards</span>
        </CardTitle>
        <CardDescription>
          Compete with other learners and climb the ranks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Leaderboard Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {leaderboards.map((leaderboard) => (
            <Button
              key={leaderboard.id}
              variant={selectedLeaderboard === leaderboard.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLeaderboard(leaderboard.id)}
              className="flex items-center space-x-2"
            >
              <span>{leaderboard.name}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getLeaderboardTypeColor(leaderboard.type)}`}
              >
                {leaderboard.type.replace('_', ' ')}
              </Badge>
            </Button>
          ))}
        </div>

        {/* User's Current Rank */}
        {userRank && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getRankIcon(userRank.rank)}
                  </div>
                  <div>
                    <p className="font-semibold">Your Current Rank</p>
                    <p className="text-sm text-muted-foreground">
                      {userRank.score} points
                    </p>
                  </div>
                </div>
                {userRank.previousRank && (
                  <div className="flex items-center space-x-2">
                    {getRankChange(userRank.rank, userRank.previousRank)}
                    <span className="text-sm text-muted-foreground">
                      {userRank.rank < userRank.previousRank ? 'Up' : userRank.rank > userRank.previousRank ? 'Down' : 'Same'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Entries */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  user?.id === entry.user.id ? 'bg-blue-50 border border-blue-200' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {entry.user.avatar ? (
                        <img 
                          src={entry.user.avatar} 
                          alt={entry.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {entry.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{entry.user.name}</p>
                      {user?.id === entry.user.id && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {entry.previousRank && (
                    <div className="flex items-center space-x-1">
                      {getRankChange(entry.rank, entry.previousRank)}
                      <span className="text-xs text-muted-foreground">
                        {Math.abs(entry.rank - entry.previousRank)}
                      </span>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="font-semibold">{entry.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </div>
            ))}
            
            {entries.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No entries yet. Be the first to join the leaderboard!
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}