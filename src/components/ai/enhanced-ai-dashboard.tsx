'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  BarChart3, 
  Lightbulb,
  Zap,
  Users,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface LearningPattern {
  learningStyle: string;
  pace: string;
  strengths: string[];
  weaknesses: string[];
  preferredTimeOfDay: string;
  attentionSpan: number;
  retentionRate: number;
}

interface CognitiveProfile {
  workingMemory: number;
  processingSpeed: number;
  reasoningAbility: number;
  spatialAwareness: number;
  verbalComprehension: number;
  perceptualReasoning: number;
  learningEfficiency: number;
  metacognitiveSkills: number;
}

interface LearningPath {
  currentLevel: number;
  targetLevel: number;
  estimatedCompletion: string;
  milestones: Array<{
    title: string;
    description: string;
    difficulty: number;
    estimatedTime: number;
    completed: boolean;
  }>;
}

interface Prediction {
  predictedScore: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

export default function EnhancedAIDashboard() {
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveProfile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science'
  ];

  useEffect(() => {
    loadAIData();
  }, [selectedSubject]);

  const loadAIData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - in real implementation, these would call the backend
      const mockLearningPattern: LearningPattern = {
        learningStyle: 'visual',
        pace: 'medium',
        strengths: ['Problem-solving', 'Pattern recognition'],
        weaknesses: ['Memorization', 'Speed'],
        preferredTimeOfDay: 'afternoon',
        attentionSpan: 45,
        retentionRate: 0.85
      };

      const mockCognitiveProfile: CognitiveProfile = {
        workingMemory: 0.75,
        processingSpeed: 0.68,
        reasoningAbility: 0.82,
        spatialAwareness: 0.71,
        verbalComprehension: 0.79,
        perceptualReasoning: 0.73,
        learningEfficiency: 0.81,
        metacognitiveSkills: 0.67
      };

      const mockLearningPath: LearningPath = {
        currentLevel: 3,
        targetLevel: 8,
        estimatedCompletion: '2024-06-15',
        milestones: [
          {
            title: 'Algebra Fundamentals',
            description: 'Master basic algebraic concepts',
            difficulty: 0.3,
            estimatedTime: 120,
            completed: true
          },
          {
            title: 'Quadratic Equations',
            description: 'Solve quadratic equations using various methods',
            difficulty: 0.5,
            estimatedTime: 180,
            completed: true
          },
          {
            title: 'Functions and Graphs',
            description: 'Understand function concepts and graphing',
            difficulty: 0.6,
            estimatedTime: 240,
            completed: false
          },
          {
            title: 'Advanced Calculus',
            description: 'Introduction to differential calculus',
            difficulty: 0.8,
            estimatedTime: 300,
            completed: false
          }
        ]
      };

      const mockPrediction: Prediction = {
        predictedScore: 85,
        confidence: 0.87,
        factors: [
          {
            factor: 'Consistent Practice',
            impact: 0.35,
            description: 'Regular session attendance shows strong commitment'
          },
          {
            factor: 'Learning Style Match',
            impact: 0.28,
            description: 'Visual learning style matches current teaching methods'
          },
          {
            factor: 'Cognitive Strengths',
            impact: 0.22,
            description: 'Strong reasoning ability aids problem-solving'
          }
        ],
        recommendations: [
          'Focus on memorization techniques to address weakness',
          'Increase practice speed with timed exercises',
          'Explore advanced problem-solving strategies'
        ]
      };

      setLearningPattern(mockLearningPattern);
      setCognitiveProfile(mockCognitiveProfile);
      setLearningPath(mockLearningPath);
      setPrediction(mockPrediction);
    } catch (error) {
      toast.error('Failed to load AI data');
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedContent = async () => {
    try {
      toast.success('Generating personalized content...');
      // In real implementation, this would call the AI content generation API
    } catch (error) {
      toast.error('Failed to generate content');
    }
  };

  const optimizeSchedule = async () => {
    try {
      toast.success('Optimizing learning schedule...');
      // In real implementation, this would call the schedule optimization API
    } catch (error) {
      toast.error('Failed to optimize schedule');
    }
  };

  const getCognitiveScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 0.3) return 'bg-green-100 text-green-800';
    if (difficulty <= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced AI Learning Assistant</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered personalized learning experience
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadAIData} variant="outline">
            Refresh Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive Profile</TabsTrigger>
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{learningPattern?.learningStyle}</p>
                    <p className="text-xs text-muted-foreground">Learning Style</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round((learningPattern?.retentionRate || 0) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Retention Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{learningPath?.currentLevel}/{learningPath?.targetLevel}</p>
                    <p className="text-xs text-muted-foreground">Current Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round((cognitiveProfile?.learningEfficiency || 0) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Learning Efficiency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Pattern */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Learning Pattern Analysis</span>
                </CardTitle>
                <CardDescription>
                  AI-analyzed learning patterns and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningPattern && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Learning Style</p>
                        <Badge variant="secondary">{learningPattern.learningStyle}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Learning Pace</p>
                        <Badge variant="secondary">{learningPattern.pace}</Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-2">
                        {learningPattern.strengths.map((strength, index) => (
                          <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Areas for Improvement</p>
                      <div className="flex flex-wrap gap-2">
                        {learningPattern.weaknesses.map((weakness, index) => (
                          <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Attention Span</p>
                        <p className="text-lg font-semibold">{learningPattern.attentionSpan} min</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Best Learning Time</p>
                        <p className="text-lg font-semibold">{learningPattern.preferredTimeOfDay}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>AI-Powered Actions</span>
                </CardTitle>
                <CardDescription>
                  Intelligent tools to enhance your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={generatePersonalizedContent} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Generate Personalized Content
                </Button>

                <Button 
                  onClick={optimizeSchedule} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Optimize Learning Schedule
                </Button>

                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Find Compatible Tutors
                </Button>

                <Button className="w-full justify-start" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Create Achievement Plan
                </Button>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    AI recommendations are based on your learning patterns and performance data.
                    Results improve with more usage.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Cognitive Profile Assessment</span>
              </CardTitle>
              <CardDescription>
                Detailed analysis of your cognitive abilities and learning potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cognitiveProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(cognitiveProfile).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className={`text-lg font-bold ${getCognitiveScoreColor(value)}`}>
                          {Math.round(value * 100)}%
                        </p>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {value >= 0.8 ? 'Excellent' : 
                         value >= 0.6 ? 'Good' : 
                         value >= 0.4 ? 'Average' : 'Needs Improvement'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Adaptive Learning Path</span>
              </CardTitle>
              <CardDescription>
                Personalized learning journey with AI-powered adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {learningPath && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{learningPath.currentLevel}</p>
                      <p className="text-sm text-muted-foreground">Current Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{learningPath.targetLevel}</p>
                      <p className="text-sm text-muted-foreground">Target Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{new Date(learningPath.estimatedCompletion).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">Estimated Completion</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Learning Milestones</h3>
                    <div className="space-y-3">
                      {learningPath.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            {milestone.completed ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <Badge className={getDifficultyColor(milestone.difficulty)}>
                              {milestone.difficulty <= 0.3 ? 'Easy' : 
                               milestone.difficulty <= 0.6 ? 'Medium' : 'Hard'}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.estimatedTime} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Learning Predictions</span>
              </CardTitle>
              <CardDescription>
                AI-powered forecasts of your learning outcomes and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prediction && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{prediction.predictedScore}%</p>
                      <p className="text-sm text-muted-foreground">Predicted Score</p>
                      <Badge variant="secondary" className="mt-2">
                        {Math.round(prediction.confidence * 100)}% Confidence
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {prediction.factors.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Key Factors Identified</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Key Success Factors</h3>
                    <div className="space-y-3">
                      {prediction.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{factor.factor}</p>
                            <p className="text-sm text-muted-foreground">{factor.description}</p>
                          </div>
                          <Badge variant="outline">
                            {Math.round(factor.impact * 100)}% Impact
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Personalized Recommendations</h3>
                    <div className="space-y-2">
                      {prediction.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 border rounded-lg">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Generation</CardTitle>
                <CardDescription>
                  AI-powered personalized learning content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Generate Custom Lessons
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Create Practice Exercises
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Design Assessments
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule Optimization</CardTitle>
                <CardDescription>
                  Intelligent scheduling based on learning patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Optimize Weekly Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Find Best Study Times
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Match with Tutors
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Deep insights into learning patterns and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Progress Trends
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Cognitive Assessment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Achievement Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Features</CardTitle>
                <CardDescription>
                  Cutting-edge AI learning technologies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Adaptive Learning
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Smart Recommendations
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Early Intervention
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}