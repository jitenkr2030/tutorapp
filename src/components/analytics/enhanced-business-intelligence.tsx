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
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BookOpen, 
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Globe,
  Database,
  RefreshCw,
  Download,
  Calendar,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface BusinessMetrics {
  revenue: {
    total: number;
    growth: number;
    bySource: {
      subscriptions: number;
      sessions: number;
      installments: number;
    };
  };
  users: {
    total: number;
    growth: number;
    byRole: {
      students: number;
      tutors: number;
      parents: number;
      admins: number;
    };
  };
  sessions: {
    total: number;
    completionRate: number;
    averageRating: number;
    averageDuration: number;
  };
  tutors: {
    total: number;
    active: number;
    averageRating: number;
    averageHourlyRate: number;
  };
}

interface PredictiveInsights {
  revenue: {
    forecast: Array<{ period: string; predicted: number; confidence: number }>;
    trends: Array<{
      trend: string;
      impact: 'high' | 'medium' | 'low';
      description: string;
    }>;
  };
  userBehavior: {
    churnRisk: Array<{
      userId: string;
      risk: 'high' | 'medium' | 'low';
      reasons: string[];
    }>;
  };
}

interface Anomaly {
  type: 'revenue' | 'user' | 'session' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  recommendedAction: string;
}

export default function EnhancedBusinessIntelligence() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadBusinessIntelligence();
  }, [selectedPeriod]);

  const loadBusinessIntelligence = async () => {
    setLoading(true);
    try {
      // Mock API calls - in real implementation, these would call the backend
      const mockMetrics: BusinessMetrics = {
        revenue: {
          total: 125000,
          growth: 15.2,
          bySource: {
            subscriptions: 45000,
            sessions: 65000,
            installments: 15000
          }
        },
        users: {
          total: 8450,
          growth: 12.8,
          byRole: {
            students: 5200,
            tutors: 2100,
            parents: 1100,
            admins: 50
          }
        },
        sessions: {
          total: 3200,
          completionRate: 87.5,
          averageRating: 4.6,
          averageDuration: 65
        },
        tutors: {
          total: 2100,
          active: 1850,
          averageRating: 4.4,
          averageHourlyRate: 45
        }
      };

      const mockInsights: PredictiveInsights = {
        revenue: {
          forecast: [
            { period: 'Next Month', predicted: 135000, confidence: 0.85 },
            { period: 'Next Quarter', predicted: 420000, confidence: 0.78 },
            { period: 'Next Year', predicted: 1650000, confidence: 0.72 }
          ],
          trends: [
            {
              trend: 'Subscription Growth',
              impact: 'high',
              description: 'Subscription revenue growing 25% faster than session-based revenue'
            },
            {
              trend: 'Mobile Usage Increase',
              impact: 'medium',
              description: 'Mobile app usage up 40% month-over-month'
            }
          ]
        },
        userBehavior: {
          churnRisk: [
            {
              userId: 'user-123',
              risk: 'high',
              reasons: ['Inactive for 30 days', 'Low session completion rate']
            },
            {
              userId: 'user-456',
              risk: 'medium',
              reasons: ['Declining engagement', 'Support tickets unresolved']
            }
          ]
        }
      };

      const mockAnomalies: Anomaly[] = [
        {
          type: 'revenue',
          severity: 'medium',
          description: 'Unusual 30% drop in session revenue last week',
          detectedAt: new Date('2024-01-14'),
          recommendedAction: 'Investigate pricing strategy and tutor availability'
        },
        {
          type: 'user',
          severity: 'high',
          description: 'Spike in user cancellations (45% increase)',
          detectedAt: new Date('2024-01-13'),
          recommendedAction: 'Review cancellation process and user feedback'
        },
        {
          type: 'system',
          severity: 'low',
          description: 'API response time increased by 15%',
          detectedAt: new Date('2024-01-12'),
          recommendedAction: 'Monitor system performance and optimize database queries'
        }
      ];

      setMetrics(mockMetrics);
      setInsights(mockInsights);
      setAnomalies(mockAnomalies);
    } catch (error) {
      toast.error('Failed to load business intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
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
          <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced analytics and insights for data-driven decision making
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadBusinessIntelligence} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics?.revenue.total || 0)}</p>
                <div className="flex items-center space-x-1">
                  {metrics?.revenue.growth && metrics.revenue.growth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <p className={`text-sm ${metrics?.revenue.growth && metrics.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics?.revenue.growth || 0}%
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(metrics?.users.total || 0)}</p>
                <div className="flex items-center space-x-1">
                  {metrics?.users.growth && metrics.users.growth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <p className={`text-sm ${metrics?.users.growth && metrics.users.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics?.users.growth || 0}%
                  </p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{formatNumber(metrics?.sessions.total || 0)}</p>
                <p className="text-sm text-muted-foreground">
                  {metrics?.sessions.completionRate || 0}% completion rate
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{metrics?.sessions.averageRating || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {metrics?.tutors.total || 0} active tutors
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>{anomalies.length} anomalies detected</strong> - Review recommended actions
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Revenue Breakdown</span>
                </CardTitle>
                <CardDescription>
                  Revenue distribution by source
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Subscriptions</span>
                        <span className="text-sm font-bold">{formatCurrency(metrics.revenue.bySource.subscriptions)}</span>
                      </div>
                      <Progress 
                        value={(metrics.revenue.bySource.subscriptions / metrics.revenue.total) * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground">
                        {((metrics.revenue.bySource.subscriptions / metrics.revenue.total) * 100).toFixed(1)}% of total revenue
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sessions</span>
                        <span className="text-sm font-bold">{formatCurrency(metrics.revenue.bySource.sessions)}</span>
                      </div>
                      <Progress 
                        value={(metrics.revenue.bySource.sessions / metrics.revenue.total) * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground">
                        {((metrics.revenue.bySource.sessions / metrics.revenue.total) * 100).toFixed(1)}% of total revenue
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Installments</span>
                        <span className="text-sm font-bold">{formatCurrency(metrics.revenue.bySource.installments)}</span>
                      </div>
                      <Progress 
                        value={(metrics.revenue.bySource.installments / metrics.revenue.total) * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground">
                        {((metrics.revenue.bySource.installments / metrics.revenue.total) * 100).toFixed(1)}% of total revenue
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Distribution</span>
                </CardTitle>
                <CardDescription>
                  User breakdown by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Students</span>
                        <span className="text-sm font-bold">{formatNumber(metrics.users.byRole.students)}</span>
                      </div>
                      <Progress 
                        value={(metrics.users.byRole.students / metrics.users.total) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tutors</span>
                        <span className="text-sm font-bold">{formatNumber(metrics.users.byRole.tutors)}</span>
                      </div>
                      <Progress 
                        value={(metrics.users.byRole.tutors / metrics.users.total) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Parents</span>
                        <span className="text-sm font-bold">{formatNumber(metrics.users.byRole.parents)}</span>
                      </div>
                      <Progress 
                        value={(metrics.users.byRole.parents / metrics.users.total) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Admins</span>
                        <span className="text-sm font-bold">{formatNumber(metrics.users.byRole.admins)}</span>
                      </div>
                      <Progress 
                        value={(metrics.users.byRole.admins / metrics.users.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
              <CardDescription>
                Key performance indicators and operational metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {metrics?.sessions.completionRate || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Session Completion</p>
                  <div className="mt-2">
                    <Progress value={metrics?.sessions.completionRate || 0} className="h-2" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {metrics?.sessions.averageRating || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="mt-2 flex justify-center">
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {metrics?.sessions.averageDuration || 0}m
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                  <div className="mt-2">
                    <Clock className="h-4 w-4 text-purple-500 mx-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>
                  AI-powered revenue predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights && (
                  <div className="space-y-4">
                    {insights.revenue.forecast.map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{forecast.period}</p>
                          <p className="text-2xl font-bold">{formatCurrency(forecast.predicted)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {Math.round(forecast.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Key trends affecting revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights && (
                  <div className="space-y-4">
                    {insights.revenue.trends.map((trend, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          trend.impact === 'high' ? 'bg-red-500' :
                          trend.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{trend.trend}</p>
                          <p className="text-sm text-muted-foreground">{trend.description}</p>
                          <Badge 
                            variant="outline" 
                            className={`mt-2 ${getImpactColor(trend.impact)}`}
                          >
                            {trend.impact} impact
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Behavior Analysis</CardTitle>
              <CardDescription>
                AI-powered user behavior insights and churn risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Churn Risk Assessment</h3>
                  <div className="space-y-3">
                    {insights.userBehavior.churnRisk.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">User {user.userId}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.reasons.map((reason, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            user.risk === 'high' ? 'border-red-200 text-red-700' :
                            user.risk === 'medium' ? 'border-yellow-200 text-yellow-700' :
                            'border-blue-200 text-blue-700'
                          }
                        >
                          {user.risk} risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Demand Forecast</CardTitle>
                <CardDescription>
                  Predicted demand for different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights && (
                  <div className="space-y-4">
                    {insights.market.demandForecast.map((forecast, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{forecast.subject}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold">{forecast.demand}%</span>
                            {forecast.growth > 0 && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <Progress value={forecast.demand} className="h-2" />
                        <p className="text-xs text-muted-foreground">{forecast.recommendedAction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
                <CardDescription>
                  Market position and competitive insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights && (
                  <div className="space-y-4">
                    {insights.market.competitorAnalysis.map((competitor, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{competitor.competitor}</span>
                          <Badge variant="outline">
                            {competitor.marketShare}% market share
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-green-600">Strengths</p>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {competitor.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-red-600">Weaknesses</p>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {competitor.weaknesses.map((weakness, i) => (
                                <li key={i}>{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Detected Anomalies</span>
              </CardTitle>
              <CardDescription>
                System-detected anomalies requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(anomaly.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{anomaly.type}</Badge>
                          <Badge variant="outline">{anomaly.severity}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {anomaly.detectedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium">{anomaly.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {anomaly.recommendedAction}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Investigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}