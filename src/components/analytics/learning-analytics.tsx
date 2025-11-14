'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Target, 
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface StudentPerformance {
  id: string;
  name: string;
  subject: string;
  score: number;
  improvement: number;
  engagement: number;
  sessions: number;
  lastActive: string;
}

interface SubjectAnalytics {
  subject: string;
  averageScore: number;
  improvementRate: number;
  completionRate: number;
  engagementScore: number;
  totalStudents: number;
}

export default function LearningAnalytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  // Mock data for student performance
  const studentPerformance: StudentPerformance[] = [
    { id: '1', name: 'Alice Johnson', subject: 'Mathematics', score: 92, improvement: 15, engagement: 88, sessions: 12, lastActive: '2 days ago' },
    { id: '2', name: 'Bob Smith', subject: 'Science', score: 85, improvement: 8, engagement: 75, sessions: 8, lastActive: '1 day ago' },
    { id: '3', name: 'Carol Davis', subject: 'English', score: 78, improvement: -2, engagement: 65, sessions: 6, lastActive: '5 days ago' },
    { id: '4', name: 'David Wilson', subject: 'History', score: 88, improvement: 12, engagement: 82, sessions: 10, lastActive: '3 days ago' },
    { id: '5', name: 'Emma Brown', subject: 'Mathematics', score: 95, improvement: 18, engagement: 92, sessions: 15, lastActive: '1 day ago' },
  ];

  // Mock data for subject analytics
  const subjectAnalytics: SubjectAnalytics[] = [
    { subject: 'Mathematics', averageScore: 88, improvementRate: 12.5, completionRate: 92, engagementScore: 85, totalStudents: 45 },
    { subject: 'Science', averageScore: 82, improvementRate: 9.8, completionRate: 88, engagementScore: 78, totalStudents: 38 },
    { subject: 'English', averageScore: 85, improvementRate: 11.2, completionRate: 90, engagementScore: 82, totalStudents: 42 },
    { subject: 'History', averageScore: 79, improvementRate: 7.5, completionRate: 85, engagementScore: 75, totalStudents: 35 },
  ];

  // Learning insights
  const learningInsights = [
    {
      title: 'High Performing Students',
      count: 234,
      percentage: 68,
      trend: 'up',
      description: 'Students scoring above 85%'
    },
    {
      title: 'At-Risk Students',
      count: 45,
      percentage: 13,
      trend: 'down',
      description: 'Students needing intervention'
    },
    {
      title: 'Engagement Rate',
      count: 289,
      percentage: 85,
      trend: 'up',
      description: 'Active student engagement'
    },
    {
      title: 'Completion Rate',
      count: 312,
      percentage: 92,
      trend: 'up',
      description: 'Course completion success'
    }
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return 'bg-green-500';
    if (engagement >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {learningInsights.map((insight, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              {insight.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insight.count}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Progress value={insight.percentage} className="flex-1" />
                <span>{insight.percentage}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Details</CardTitle>
                <CardDescription>Detailed performance metrics for individual students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {studentPerformance.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{student.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${getPerformanceColor(student.score)}`}>
                            {student.score}%
                          </span>
                          {student.improvement > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{student.sessions} sessions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Breakdown of student performance levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Excellent (90-100%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">45%</span>
                      <Progress value={45} className="w-20" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Good (80-89%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">30%</span>
                      <Progress value={30} className="w-20" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Average (70-79%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">18%</span>
                      <Progress value={18} className="w-20" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">Below Average (&lt;70%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">7%</span>
                      <Progress value={7} className="w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Analytics</CardTitle>
                <CardDescription>Detailed metrics by subject area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectAnalytics.map((subject) => (
                    <div key={subject.subject} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{subject.subject}</h4>
                        <Badge variant="outline">{subject.totalStudents} students</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Score</span>
                          <span className="font-medium">{subject.averageScore}%</span>
                        </div>
                        <Progress value={subject.averageScore} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Improvement Rate</span>
                          <span className="font-medium text-green-600">+{subject.improvementRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span className="font-medium">{subject.completionRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Engagement</span>
                          <span className="font-medium">{subject.engagementScore}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subject Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Trends</CardTitle>
                <CardDescription>Performance trends across subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Mathematics</span>
                      </div>
                      <Badge variant="default">+15%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Strong improvement in problem-solving skills</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Science</span>
                      </div>
                      <Badge variant="default">+8%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Steady progress in lab performance</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">English</span>
                      </div>
                      <Badge variant="secondary">-2%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Slight decline in writing scores</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">History</span>
                      </div>
                      <Badge variant="default">+5%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Improved critical analysis skills</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement Metrics</CardTitle>
                <CardDescription>Detailed engagement analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Average Session Time</span>
                    </div>
                    <span className="font-bold">45 minutes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Homework Completion</span>
                    </div>
                    <span className="font-bold">87%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Goal Achievement</span>
                    </div>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Peer Interaction</span>
                    </div>
                    <span className="font-bold">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Levels</CardTitle>
                <CardDescription>Student engagement distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Highly Engaged</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">45%</span>
                      <Progress value={45} className="w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Moderately Engaged</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">35%</span>
                      <Progress value={35} className="w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Minimally Engaged</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">15%</span>
                      <Progress value={15} className="w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Not Engaged</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">5%</span>
                      <Progress value={5} className="w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Learning Insights</CardTitle>
                <CardDescription>AI-powered insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Strong Performance in Mathematics</h4>
                        <p className="text-sm text-green-700">Students show exceptional improvement in mathematical concepts</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Attention Needed in English Writing</h4>
                        <p className="text-sm text-yellow-700">Consider additional writing exercises and feedback</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start space-x-2">
                      <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">High Engagement Levels</h4>
                        <p className="text-sm text-blue-700">Overall student engagement is above target levels</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable insights for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Personalized Learning Paths</h4>
                    <p className="text-sm text-gray-600 mb-3">Implement adaptive learning based on individual performance</p>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Early Intervention System</h4>
                    <p className="text-sm text-gray-600 mb-3">Identify and support at-risk students proactively</p>
                    <Button size="sm" variant="outline">Learn More</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Enhanced Feedback Mechanisms</h4>
                    <p className="text-sm text-gray-600 mb-3">Improve feedback quality and timeliness</p>
                    <Button size="sm" variant="outline">Get Started</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}