'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adaptiveLearningEngine, type AdaptivePath, type LearningRecommendation } from '@/lib/adaptive-learning/adaptive-engine';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Video, 
  Headphones, 
  Users, 
  Star,
  CheckCircle,
  AlertCircle,
  Zap,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface LearningInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  progress: number;
}

export function AdaptiveLearningDashboard() {
  const [adaptivePath, setAdaptivePath] = useState<AdaptivePath | null>(null);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  useEffect(() => {
    loadAdaptiveLearningData();
  }, [selectedSubject]);

  const loadAdaptiveLearningData = async () => {
    setLoading(true);
    try {
      // In a real app, you'd get the actual user ID
      const userId = 'current-user';
      
      const [path, userInsights] = await Promise.all([
        adaptiveLearningEngine.createAdaptivePath(userId, selectedSubject),
        adaptiveLearningEngine.getLearningInsights(userId)
      ]);

      setAdaptivePath(path);
      setInsights(userInsights);
    } catch (error) {
      console.error('Error loading adaptive learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <BookOpen className="h-5 w-5" />;
      case 'assessment':
        return <BarChart3 className="h-5 w-5" />;
      case 'practice':
        return <Target className="h-5 w-5" />;
      case 'break':
        return <Clock className="h-5 w-5" />;
      case 'review':
        return <Star className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getRecommendationColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLearningStyleIcon = (style: keyof typeof adaptivePath.learningStyle) => {
    switch (style) {
      case 'visual':
        return <Video className="h-4 w-4" />;
      case 'auditory':
        return <Headphones className="h-4 w-4" />;
      case 'kinesthetic':
        return <Users className="h-4 w-4" />;
      case 'reading':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Adaptive Learning</h1>
          <p className="text-muted-foreground">
            Personalized learning path based on your unique style and progress
          </p>
        </div>
        <Button onClick={loadAdaptiveLearningData} variant="outline">
          Refresh Insights
        </Button>
      </div>

      {/* Subject Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Learning Subject</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Mathematics', 'Science', 'English', 'History', 'Languages'].map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                onClick={() => setSelectedSubject(subject)}
                size="sm"
              >
                {subject}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Learning Insights</span>
            </CardTitle>
            <CardDescription>
              Personalized analysis of your learning patterns and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {insights.progress}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <Progress value={insights.progress} className="mt-2" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Strengths</h4>
                {insights.strengths.length > 0 ? (
                  insights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>{strength}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Keep learning to discover your strengths!</p>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">Areas for Improvement</h4>
                {insights.weaknesses.length > 0 ? (
                  insights.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="h-3 w-3 text-orange-600" />
                      <span>{weakness}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No significant areas for improvement</p>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Recommendations</h4>
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <Lightbulb className="h-3 w-3 text-blue-600 mt-0.5" />
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptive Path Details */}
      {adaptivePath && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="goals">Learning Goals</TabsTrigger>
            <TabsTrigger value="style">Learning Style</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {adaptivePath.currentLevel}
                  </div>
                  <Badge className={getDifficultyColor(adaptivePath.currentLevel)}>
                    {adaptivePath.currentLevel}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(adaptivePath.performance.accuracy * 100)}%
                  </div>
                  <Progress value={adaptivePath.performance.accuracy * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(adaptivePath.performance.engagement * 100)}%
                  </div>
                  <Progress value={adaptivePath.performance.engagement * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(adaptivePath.performance.retention * 100)}%
                  </div>
                  <Progress value={adaptivePath.performance.retention * 100} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              {adaptivePath.recommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-blue-600 mt-1">
                          {getRecommendationIcon(recommendation.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium">{recommendation.title}</h3>
                            <Badge variant="outline" className={getDifficultyColor(recommendation.difficulty)}>
                              {recommendation.difficulty}
                            </Badge>
                            <Badge variant="outline" className={getRecommendationColor(recommendation.confidence)}>
                              {Math.round(recommendation.confidence * 100)}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {recommendation.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{recommendation.estimatedTime} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Zap className="h-3 w-3" />
                              <span>{recommendation.reasoning}</span>
                            </div>
                          </div>
                          {recommendation.resource && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm">
                                {recommendation.resource.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                                {recommendation.resource.type === 'article' && <BookOpen className="h-3 w-3 mr-1" />}
                                Open Resource
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="space-y-4">
              {adaptivePath.goals.map((goal, index) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>{goal.title}</span>
                      </CardTitle>
                      <Badge className={getDifficultyColor(goal.difficulty)}>
                        {goal.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{goal.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Estimated Time:</span>
                        <span>{goal.estimatedTime} minutes</span>
                      </div>
                      
                      {goal.prerequisites.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {goal.prerequisites.map((prereq, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Learning Objectives:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {goal.learningObjectives.map((objective, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Your Learning Style</span>
                </CardTitle>
                <CardDescription>
                  Based on your interactions and preferences, we've identified your optimal learning approach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(adaptivePath.learningStyle).map(([style, value]) => (
                      <div key={style} className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getLearningStyleIcon(style as keyof typeof adaptivePath.learningStyle)}
                        </div>
                        <p className="text-sm font-medium capitalize">{style}</p>
                        <div className="text-2xl font-bold text-primary">
                          {Math.round(value * 100)}%
                        </div>
                        <Progress value={value * 100} className="mt-2" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Learning Style Insights:</h4>
                    <div className="space-y-2 text-sm">
                      {adaptivePath.learningStyle.visual > 0.4 && (
                        <p>• You learn best through visual aids like videos, diagrams, and infographics</p>
                      )}
                      {adaptivePath.learningStyle.auditory > 0.4 && (
                        <p>• You benefit from audio explanations, podcasts, and verbal instructions</p>
                      )}
                      {adaptivePath.learningStyle.kinesthetic > 0.4 && (
                        <p>• You prefer hands-on learning and interactive experiences</p>
                      )}
                      {adaptivePath.learningStyle.reading > 0.4 && (
                        <p>• You learn effectively through reading and written materials</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}