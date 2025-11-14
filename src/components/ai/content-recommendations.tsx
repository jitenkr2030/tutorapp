'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Clock, 
  Star, 
  CheckCircle, 
  Lightbulb,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'LEARNING_CONTENT' | 'STUDY_PLAN' | 'CAREER_PATH';
  priority: 'high' | 'medium' | 'low';
  content: {
    subjects: string[];
    resources: string[];
    actionItems: string[];
    estimatedTime: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  reasoning: string;
  createdAt: string;
  status: 'pending' | 'viewed' | 'accepted' | 'dismissed';
}

interface ContentRecommendationsProps {
  userId?: string;
  onRecommendationAction?: (id: string, action: 'viewed' | 'accepted' | 'dismissed') => void;
}

export default function ContentRecommendations({ userId, onRecommendationAction }: ContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [insights, setInsights] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedType, selectedStatus]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`/api/ai/recommendations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: 'LEARNING_CONTENT',
          context: {
            generateNew: true,
            currentFocus: selectedType === 'all' ? undefined : selectedType
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setInsights(data.insights || []);
      setNextSteps(data.nextSteps || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (id: string, action: 'viewed' | 'accepted' | 'dismissed') => {
    try {
      // Update local state
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id 
            ? { ...rec, status: action as Recommendation['status'] }
            : rec
        )
      );

      // Call parent callback
      onRecommendationAction?.(id, action);

      // In a real implementation, you would also update the backend
      console.log(`Recommendation ${id} marked as ${action}`);
    } catch (error) {
      console.error('Error updating recommendation:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LEARNING_CONTENT': return <BookOpen className="w-4 h-4" />;
      case 'STUDY_PLAN': return <Target className="w-4 h-4" />;
      case 'CAREER_PATH': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedType !== 'all' && rec.type !== selectedType) return false;
    if (selectedStatus !== 'all' && rec.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Learning Recommendations
          </h2>
          <p className="text-gray-600 mt-1">
            Personalized learning suggestions based on your progress and goals
          </p>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate New Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LEARNING_CONTENT">Learning Content</SelectItem>
                  <SelectItem value="STUDY_PLAN">Study Plan</SelectItem>
                  <SelectItem value="CAREER_PATH">Career Path</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI Insights About Your Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="relative overflow-hidden">
              {/* Priority indicator */}
              <div className={`absolute top-0 left-0 w-1 h-full ${getPriorityColor(recommendation.priority).split(' ')[2]}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getPriorityColor(recommendation.priority)}`}>
                      {getTypeIcon(recommendation.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{recommendation.title}</CardTitle>
                      <CardDescription className="mt-1">{recommendation.description}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${getPriorityColor(recommendation.priority)}`}
                  >
                    {recommendation.priority}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Content Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Subjects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {recommendation.content.subjects.slice(0, 2).map((subject, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {recommendation.content.subjects.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{recommendation.content.subjects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>{recommendation.content.estimatedTime}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Difficulty:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-1 ${getDifficultyColor(recommendation.content.difficulty)}`}
                    >
                      {recommendation.content.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Resources:</span>
                    <span className="text-xs text-gray-600 ml-1">
                      {recommendation.content.resources.length} available
                    </span>
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Action Items
                  </h4>
                  <ul className="text-xs space-y-1">
                    {recommendation.content.actionItems.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                    {recommendation.content.actionItems.length > 3 && (
                      <li className="text-gray-500">
                        +{recommendation.content.actionItems.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>

                {/* AI Reasoning */}
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                    <Brain className="w-4 h-4 text-purple-600" />
                    Why This Recommendation
                  </h4>
                  <p className="text-xs text-gray-700">{recommendation.reasoning}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {recommendation.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleRecommendationAction(recommendation.id, 'viewed')}
                        variant="outline"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleRecommendationAction(recommendation.id, 'accepted')}
                        className="flex-1"
                      >
                        Accept
                      </Button>
                    </>
                  )}
                  
                  {recommendation.status === 'viewed' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleRecommendationAction(recommendation.id, 'accepted')}
                        className="flex-1"
                      >
                        Start Learning
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleRecommendationAction(recommendation.id, 'dismissed')}
                        variant="outline"
                        className="flex-1"
                      >
                        Not Interested
                      </Button>
                    </>
                  )}

                  {recommendation.status === 'accepted' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                  )}

                  {recommendation.status === 'dismissed' && (
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm">Dismissed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Empty state
          <Card className="lg:col-span-2">
            <CardContent className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recommendations Found
              </h3>
              <p className="text-gray-500 mb-6">
                Generate new personalized learning recommendations based on your goals and progress.
              </p>
              <Button onClick={generateRecommendations}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Recommendations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}