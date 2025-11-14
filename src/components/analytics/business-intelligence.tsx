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
  DollarSign, 
  Users, 
  Target, 
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  ShoppingCart,
  CreditCard,
  TrendingDown as TrendDown,
  Zap
} from 'lucide-react';

interface BusinessMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  conversionRate: number;
  churnRate: number;
  netPromoterScore: number;
}

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
}

interface CustomerSegment {
  name: string;
  count: number;
  revenue: number;
  growth: number;
  percentage: number;
}

export default function BusinessIntelligence() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Business metrics
  const businessMetrics: BusinessMetrics = {
    totalRevenue: 45231,
    monthlyGrowth: 20.1,
    averageRevenuePerUser: 156,
    customerLifetimeValue: 1234,
    customerAcquisitionCost: 45,
    conversionRate: 12.5,
    churnRate: 3.2,
    netPromoterScore: 72
  };

  // Financial data over time
  const financialData: FinancialData[] = [
    { month: 'Jan', revenue: 35000, expenses: 28000, profit: 7000, growth: 15 },
    { month: 'Feb', revenue: 38000, expenses: 29000, profit: 9000, growth: 8.6 },
    { month: 'Mar', revenue: 42000, expenses: 31000, profit: 11000, growth: 10.5 },
    { month: 'Apr', revenue: 45231, expenses: 32000, profit: 13231, growth: 7.7 }
  ];

  // Customer segments
  const customerSegments: CustomerSegment[] = [
    { name: 'Premium Students', count: 156, revenue: 23400, growth: 25, percentage: 35 },
    { name: 'Regular Students', count: 289, revenue: 17831, growth: 15, percentage: 45 },
    { name: 'Casual Learners', count: 134, revenue: 4000, growth: 8, percentage: 20 }
  ];

  // Key business insights
  const businessInsights = [
    {
      title: 'Monthly Revenue',
      value: '$45,231',
      trend: 'up',
      change: '+20.1%',
      description: 'Total monthly revenue'
    },
    {
      title: 'Profit Margin',
      value: '29.3%',
      trend: 'up',
      change: '+3.2%',
      description: 'Net profit margin'
    },
    {
      title: 'Customer Growth',
      value: '+15.2%',
      trend: 'up',
      change: '+2.8%',
      description: 'New customer acquisition'
    },
    {
      title: 'Operational Efficiency',
      value: '87.5%',
      trend: 'up',
      change: '+4.1%',
      description: 'Resource utilization'
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendDown className="w-4 h-4 text-red-600" />;
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-blue-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {businessInsights.map((insight, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              {getTrendIcon(insight.trend)}
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

      {/* Business Intelligence Tabs */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Financial performance and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Total Revenue</span>
                    </div>
                    <span className="font-bold">${businessMetrics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Monthly Growth</span>
                    </div>
                    <span className="font-bold text-green-600">+{businessMetrics.monthlyGrowth}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Avg Revenue Per User</span>
                    </div>
                    <span className="font-bold">${businessMetrics.averageRevenuePerUser}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Customer Lifetime Value</span>
                    </div>
                    <span className="font-bold">${businessMetrics.customerLifetimeValue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Trends</CardTitle>
                <CardDescription>Revenue and profit trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.map((data, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{data.month}</h4>
                        <div className="flex items-center space-x-2">
                          {data.growth > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm ${data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.growth > 0 ? '+' : ''}{data.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Revenue</p>
                          <p className="font-medium">${data.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Expenses</p>
                          <p className="font-medium">${data.expenses.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Profit</p>
                          <p className="font-medium text-green-600">${data.profit.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Revenue breakdown by customer type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegments.map((segment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{segment.name}</h4>
                        <Badge variant="outline">{segment.count} customers</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Revenue</span>
                          <span className="font-medium">${segment.revenue.toLocaleString()}</span>
                        </div>
                        <Progress value={segment.percentage} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Growth</span>
                          <span className="font-medium text-green-600">+{segment.growth}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Market Share</span>
                          <span className="font-medium">{segment.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>Key customer performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Acquisition Cost</span>
                    </div>
                    <span className="font-bold">${businessMetrics.customerAcquisitionCost}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Conversion Rate</span>
                    </div>
                    <span className={`font-bold ${getPerformanceColor(businessMetrics.conversionRate * 8)}`}>
                      {businessMetrics.conversionRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Churn Rate</span>
                    </div>
                    <span className="font-bold text-red-600">{businessMetrics.churnRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">NPS Score</span>
                    </div>
                    <span className={`font-bold ${getPerformanceColor(businessMetrics.netPromoterScore)}`}>
                      {businessMetrics.netPromoterScore}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Efficiency</CardTitle>
                <CardDescription>Business operational metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Resource Utilization</span>
                      </div>
                      <Badge variant="default">87.5%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Optimal resource allocation</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Process Efficiency</span>
                      </div>
                      <Badge variant="default">92.3%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Streamlined operations</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Cost Optimization</span>
                      </div>
                      <Badge variant="default">15.2%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Reduced operational costs</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Scalability</span>
                      </div>
                      <Badge variant="secondary">78.9%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Growth capacity assessment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Excellent Performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">45%</span>
                      <Progress value={45} className="w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Good Performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">35%</span>
                      <Progress value={35} className="w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Average Performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">15%</span>
                      <Progress value={15} className="w-16" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Needs Improvement</span>
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
            {/* Key Business Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Business Insights</CardTitle>
                <CardDescription>AI-powered business intelligence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Strong Revenue Growth</h4>
                        <p className="text-sm text-green-700">Consistent 20%+ monthly growth indicates healthy business expansion</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start space-x-2">
                      <Star className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">High Customer Satisfaction</h4>
                        <p className="text-sm text-blue-700">NPS score of 72 indicates strong customer loyalty</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Churn Rate Monitoring</h4>
                        <p className="text-sm text-yellow-700">3.2% churn rate requires attention for improvement</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>Data-driven business strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Market Expansion</h4>
                    <p className="text-sm text-gray-600 mb-3">Consider expanding to 2-3 new geographic markets</p>
                    <Button size="sm" variant="outline">View Analysis</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Premium Tier Optimization</h4>
                    <p className="text-sm text-gray-600 mb-3">Enhance premium offerings to increase ARPU</p>
                    <Button size="sm" variant="outline">Learn More</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Customer Retention Program</h4>
                    <p className="text-sm text-gray-600 mb-3">Implement loyalty program to reduce churn</p>
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