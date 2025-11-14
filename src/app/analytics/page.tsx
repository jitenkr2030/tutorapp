'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign, 
  Target, 
  Calendar,
  Download,
  Filter,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import LearningAnalytics from '@/components/analytics/learning-analytics';
import TutorPerformanceAnalytics from '@/components/analytics/tutor-performance';
import BusinessIntelligence from '@/components/analytics/business-intelligence';
import PredictiveAnalytics from '@/components/analytics/predictive-analytics';
import { useOverviewAnalytics } from '@/hooks/use-analytics-socket';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data: overviewData, loading, isConnected, refetch } = useOverviewAnalytics({
    timeRange,
    subject: selectedSubject
  });

  useEffect(() => {
    if (overviewData?.timestamp) {
      setLastUpdated(new Date(overviewData.timestamp));
    }
  }, [overviewData]);

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into learning, performance, and business metrics</p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? "Live" : "Offline"}
            </Badge>
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px]">
              <BookOpen className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="history">History</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            // Real data
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewData?.totalUsers?.toLocaleString() || '1,234'}</div>
                  <p className="text-xs text-muted-foreground">
                    +{overviewData?.newUsers ? Math.round((overviewData.newUsers / overviewData.totalUsers) * 100) : 12}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewData?.totalSessions?.toLocaleString() || '2,456'}</div>
                  <p className="text-xs text-muted-foreground">
                    {overviewData?.completedSessions && overviewData.totalSessions 
                      ? `${Math.round((overviewData.completedSessions / overviewData.totalSessions) * 100)}% completion rate`
                      : '87.5% completion rate'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${overviewData?.totalRevenue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '45,231'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg ${overviewData?.avgRevenuePerSession?.toFixed(2) || '85.50'} per session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewData?.avgTutorRating?.toFixed(1) || '4.7'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {overviewData?.avgSessionDuration 
                      ? `${Math.round(overviewData.avgSessionDuration)} min avg session`
                      : '65 min avg session'
                    }
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="learning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learning Analytics
            </TabsTrigger>
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tutor Performance
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Business Intelligence
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Predictive Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="space-y-6">
            <LearningAnalytics timeRange={timeRange} subject={selectedSubject} />
          </TabsContent>

          <TabsContent value="tutor" className="space-y-6">
            <TutorPerformanceAnalytics timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <BusinessIntelligence timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <PredictiveAnalytics timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}