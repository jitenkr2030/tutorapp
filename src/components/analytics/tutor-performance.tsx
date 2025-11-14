'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  Clock, 
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BookOpen,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface TutorPerformance {
  id: string;
  name: string;
  subject: string;
  rating: number;
  sessions: number;
  students: number;
  completionRate: number;
  responseTime: number;
  revenue: number;
  experience: string;
  status: 'active' | 'inactive' | 'pending';
}

interface TutorMetrics {
  averageRating: number;
  totalSessions: number;
  totalStudents: number;
  averageCompletionRate: number;
  averageResponseTime: number;
  totalRevenue: number;
  topPerformers: number;
  needsImprovement: number;
}

export default function TutorPerformanceAnalytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data for tutor performance
  const tutorPerformance: TutorPerformance[] = [
    { id: '1', name: 'Dr. Sarah Johnson', subject: 'Mathematics', rating: 4.9, sessions: 156, students: 45, completionRate: 98, responseTime: 1.2, revenue: 12480, experience: '5+ years', status: 'active' },
    { id: '2', name: 'Prof. Michael Chen', subject: 'Science', rating: 4.8, sessions: 142, students: 38, completionRate: 96, responseTime: 2.1, revenue: 11360, experience: '8+ years', status: 'active' },
    { id: '3', name: 'Ms. Emily Davis', subject: 'English', rating: 4.7, sessions: 128, students: 42, completionRate: 94, responseTime: 1.8, revenue: 10240, experience: '3+ years', status: 'active' },
    { id: '4', name: 'Mr. Robert Wilson', subject: 'History', rating: 4.6, sessions: 98, students: 35, completionRate: 92, responseTime: 3.2, revenue: 7840, experience: '6+ years', status: 'active' },
    { id: '5', name: 'Dr. Lisa Anderson', subject: 'Mathematics', rating: 4.5, sessions: 87, students: 28, completionRate: 89, responseTime: 4.1, revenue: 6960, experience: '4+ years', status: 'active' },
  ];

  // Overall tutor metrics
  const tutorMetrics: TutorMetrics = {
    averageRating: 4.7,
    totalSessions: 611,
    totalStudents: 188,
    averageCompletionRate: 93.8,
    averageResponseTime: 2.5,
    totalRevenue: 48880,
    topPerformers: 12,
    needsImprovement: 3
  };

  // Performance insights
  const performanceInsights = [
    {
      title: 'Average Rating',
      value: '4.7/5.0',
      trend: 'up',
      change: '+0.2',
      description: 'Overall tutor satisfaction'
    },
    {
      title: 'Session Completion',
      value: '93.8%',
      trend: 'up',
      change: '+2.1%',
      description: 'Successful session rate'
    },
    {
      title: 'Response Time',
      value: '2.5 hrs',
      trend: 'down',
      change: '-0.5 hrs',
      description: 'Average response time'
    },
    {
      title: 'Revenue per Tutor',
      value: '$9,776',
      trend: 'up',
      change: '+12.3%',
      description: 'Average monthly revenue'
    }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return 'text-green-600';
    if (rating >= 4.5) return 'text-blue-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceInsights.map((insight, index) => (
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
              <div className="text-2xl font-bold">{insight.value}</div>
              <p className="text-xs text-muted-foreground">
                {insight.change} from last month
              </p>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tutor Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tutor Performance Summary</CardTitle>
                <CardDescription>Overall tutor performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Average Rating</span>
                    </div>
                    <span className="font-bold">{tutorMetrics.averageRating}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Completion Rate</span>
                    </div>
                    <span className="font-bold">{tutorMetrics.averageCompletionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Response Time</span>
                    </div>
                    <span className="font-bold">{tutorMetrics.averageResponseTime} hrs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Total Students</span>
                    </div>
                    <span className="font-bold">{tutorMetrics.totalStudents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Tutor performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Top Performers (4.8+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{tutorMetrics.topPerformers}</span>
                      <Progress value={24} className="w-20" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Good Performers (4.5-4.7)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">28</span>
                      <Progress value={56} className="w-20" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Average (4.0-4.4)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">7</span>
                      <Progress value={14} className="w-20" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">Needs Improvement (&lt;4.0)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{tutorMetrics.needsImprovement}</span>
                      <Progress value={6} className="w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Individual Tutor Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Tutor Performance</CardTitle>
                <CardDescription>Detailed metrics for each tutor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {tutorPerformance.map((tutor) => (
                    <div key={tutor.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{tutor.name}</h4>
                          <p className="text-sm text-gray-500">{tutor.subject} • {tutor.experience}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(tutor.status)}
                          <span className={`font-bold ${getRatingColor(tutor.rating)}`}>
                            {tutor.rating}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sessions:</span>
                          <span className="font-medium">{tutor.sessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Students:</span>
                          <span className="font-medium">{tutor.students}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completion:</span>
                          <span className="font-medium">{tutor.completionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response:</span>
                          <span className="font-medium">{tutor.responseTime}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Key performance indicators over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Rating Improvement</span>
                      </div>
                      <Badge variant="default">+0.2</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Overall tutor ratings improving steadily</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Completion Rate</span>
                      </div>
                      <Badge variant="default">+2.1%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Higher session completion rates</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Response Time</span>
                      </div>
                      <Badge variant="default">-0.5h</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Faster response to student inquiries</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Student Retention</span>
                      </div>
                      <Badge variant="default">+5.2%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Improved student retention rates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Tutor revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Total Revenue</span>
                    </div>
                    <span className="font-bold">${tutorMetrics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Revenue per Tutor</span>
                    </div>
                    <span className="font-bold">${(tutorMetrics.totalRevenue / tutorMetrics.topPerformers).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Revenue per Session</span>
                    </div>
                    <span className="font-bold">${Math.round(tutorMetrics.totalRevenue / tutorMetrics.totalSessions)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Revenue per Student</span>
                    </div>
                    <span className="font-bold">${Math.round(tutorMetrics.totalRevenue / tutorMetrics.totalStudents)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Earners */}
            <Card>
              <CardHeader>
                <CardTitle>Top Earners</CardTitle>
                <CardDescription>Highest revenue-generating tutors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tutorPerformance.slice(0, 5).map((tutor, index) => (
                    <div key={tutor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{tutor.name}</p>
                          <p className="text-sm text-gray-500">{tutor.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${tutor.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{tutor.sessions} sessions</p>
                      </div>
                    </div>
                  ))}
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
                <CardTitle>Tutor Performance Insights</CardTitle>
                <CardDescription>AI-powered insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Excellent Overall Performance</h4>
                        <p className="text-sm text-green-700">Tutors are maintaining high satisfaction rates</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start space-x-2">
                      <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Strong Student Retention</h4>
                        <p className="text-sm text-blue-700">High student satisfaction leading to repeat sessions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Response Time Variation</h4>
                        <p className="text-sm text-yellow-700">Some tutors need improvement in response time</p>
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
                    <h4 className="font-medium mb-2">Performance Incentives</h4>
                    <p className="text-sm text-gray-600 mb-3">Implement reward system for top-performing tutors</p>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Training Programs</h4>
                    <p className="text-sm text-gray-600 mb-3">Provide additional training for tutors needing improvement</p>
                    <Button size="sm" variant="outline">Learn More</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Optimize Scheduling</h4>
                    <p className="text-sm text-gray-600 mb-3">Improve tutor availability and scheduling efficiency</p>
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