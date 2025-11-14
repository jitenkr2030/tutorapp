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
  Target, 
  AlertTriangle, 
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Users,
  DollarSign,
  Calendar,
  Globe,
  Shield,
  Lightbulb,
  Rocket,
  TrendingDown as TrendDown,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
}

interface RiskAssessment {
  category: string;
  level: 'low' | 'medium' | 'high';
  probability: number;
  impact: number;
  mitigation: string;
}

interface ForecastData {
  period: string;
  actual?: number;
  predicted: number;
  confidence: number;
}

export default function PredictiveAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');
  const [selectedModel, setSelectedModel] = useState('ensemble');

  // Predictive analytics data
  const predictions: Prediction[] = [
    {
      metric: 'Student Growth',
      currentValue: 1234,
      predictedValue: 1420,
      confidence: 85,
      timeframe: '6 months',
      trend: 'up'
    },
    {
      metric: 'Revenue',
      currentValue: 45231,
      predictedValue: 54277,
      confidence: 78,
      timeframe: '6 months',
      trend: 'up'
    },
    {
      metric: 'Tutor Retention',
      currentValue: 89,
      predictedValue: 94,
      confidence: 72,
      timeframe: '3 months',
      trend: 'up'
    },
    {
      metric: 'Completion Rate',
      currentValue: 87.5,
      predictedValue: 91.2,
      confidence: 88,
      timeframe: '3 months',
      trend: 'up'
    }
  ];

  // Risk assessment data
  const riskAssessments: RiskAssessment[] = [
    {
      category: 'Student Churn',
      level: 'medium',
      probability: 35,
      impact: 65,
      mitigation: 'Implement retention programs'
    },
    {
      category: 'Market Competition',
      level: 'high',
      probability: 60,
      impact: 80,
      mitigation: 'Enhance unique value proposition'
    },
    {
      category: 'Operational Costs',
      level: 'low',
      probability: 20,
      impact: 40,
      mitigation: 'Optimize resource allocation'
    },
    {
      category: 'Technology Risks',
      level: 'medium',
      probability: 45,
      impact: 70,
      mitigation: 'Invest in infrastructure upgrades'
    }
  ];

  // Forecast data
  const forecastData: ForecastData[] = [
    { period: 'Jan', actual: 35000, predicted: 36000, confidence: 85 },
    { period: 'Feb', actual: 38000, predicted: 39000, confidence: 82 },
    { period: 'Mar', actual: 42000, predicted: 43000, confidence: 80 },
    { period: 'Apr', actual: 45231, predicted: 46000, confidence: 78 },
    { period: 'May', predicted: 48000, confidence: 75 },
    { period: 'Jun', predicted: 51000, confidence: 72 },
    { period: 'Jul', predicted: 54277, confidence: 70 }
  ];

  // Market trends
  const marketTrends = [
    {
      title: 'Online Learning Growth',
      trend: 'up',
      impact: 'high',
      confidence: 92,
      description: 'Continued expansion of online education market'
    },
    {
      title: 'AI-Powered Tutoring',
      trend: 'up',
      impact: 'high',
      confidence: 88,
      description: 'Increasing adoption of AI in personalized learning'
    },
    {
      title: 'Mobile Learning',
      trend: 'up',
      impact: 'medium',
      confidence: 85,
      description: 'Shift towards mobile-first learning platforms'
    },
    {
      title: 'Traditional Tutoring',
      trend: 'down',
      impact: 'medium',
      confidence: 76,
      description: 'Decline in traditional in-person tutoring'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="default">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Predictions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {predictions.map((prediction, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{prediction.metric}</CardTitle>
              {prediction.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : prediction.trend === 'down' ? (
                <TrendDown className="h-4 w-4 text-red-600" />
              ) : (
                <Target className="h-4 w-4 text-blue-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {prediction.metric === 'Student Growth' ? prediction.predictedValue : 
                 prediction.metric === 'Revenue' ? `$${prediction.predictedValue.toLocaleString()}` :
                 prediction.metric === 'Tutor Retention' ? `${prediction.predictedValue}%` :
                 `${prediction.predictedValue}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                From {prediction.currentValue} ({prediction.timeframe})
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs">Confidence:</span>
                <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictive Analytics Tabs */}
      <Tabs defaultValue="forecasts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="learning">Learning Insights</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Predicted revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.map((data, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{data.period}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${getConfidenceColor(data.confidence)}`}>
                            {data.confidence}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Actual</p>
                          <p className="font-medium">
                            {data.actual ? `$${data.actual.toLocaleString()}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Predicted</p>
                          <p className="font-medium text-blue-600">
                            ${data.predicted.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {data.actual && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Accuracy</span>
                            <span>{Math.round((1 - Math.abs(data.actual - data.predicted) / data.actual) * 100)}%</span>
                          </div>
                          <Progress 
                            value={Math.round((1 - Math.abs(data.actual - data.predicted) / data.actual) * 100)} 
                            className="h-1" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Predictions</CardTitle>
                <CardDescription>Predicted growth across key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Student Growth</span>
                      </div>
                      <Badge variant="default">+15.1%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Expected growth in next 6 months</p>
                    <div className="mt-2">
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Confidence: 85%</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Revenue Growth</span>
                      </div>
                      <Badge variant="default">+20.0%</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Projected revenue increase</p>
                    <div className="mt-2">
                      <Progress value={78} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Confidence: 78%</p>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Market Expansion</span>
                      </div>
                      <Badge variant="default">+3 regions</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">New market opportunities</p>
                    <div className="mt-2">
                      <Progress value={72} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Confidence: 72%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Predictive risk analysis and mitigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAssessments.map((risk, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{risk.category}</h4>
                        {getRiskBadge(risk.level)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Probability</span>
                          <span className="font-medium">{risk.probability}%</span>
                        </div>
                        <Progress value={risk.probability} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Impact</span>
                          <span className={`font-medium ${getRiskColor(risk.level)}`}>
                            {risk.impact}%
                          </span>
                        </div>
                        <Progress value={risk.impact} className="h-2" />
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Summary</CardTitle>
                <CardDescription>Overall risk profile and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">High Risk Areas</h4>
                        <p className="text-sm text-red-700">Market competition requires immediate attention</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Medium Risk Areas</h4>
                        <p className="text-sm text-yellow-700">Student churn and technology risks need monitoring</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start space-x-2">
                      <Brain className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Risk Mitigation Strategy</h4>
                        <p className="text-sm text-green-700">Implement comprehensive risk management plan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Predicted market trends and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketTrends.map((trend, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{trend.title}</h4>
                        <div className="flex items-center space-x-2">
                          {trend.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendDown className="w-4 h-4 text-red-600" />
                          )}
                          <Badge 
                            variant={trend.impact === 'high' ? 'default' : 'secondary'}
                          >
                            {trend.impact}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Confidence:</span>
                        <span className={`font-medium ${getConfidenceColor(trend.confidence)}`}>
                          {trend.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Opportunity Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Analysis</CardTitle>
                <CardDescription>Identified growth opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Rocket className="w-5 h-5 text-green-600" />
                        <span className="font-medium">AI Integration</span>
                      </div>
                      <Badge variant="default">High Impact</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Leverage AI for personalized learning experiences</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Global Expansion</span>
                      </div>
                      <Badge variant="default">Medium Impact</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Enter new international markets</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Mobile Platform</span>
                      </div>
                      <Badge variant="secondary">Low Impact</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Enhance mobile learning capabilities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Predictions</CardTitle>
                <CardDescription>AI-powered learning performance forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Academic Performance</span>
                      </div>
                      <Badge variant="default">85% Confidence</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Predicted grade improvement: B+ to A-</p>
                    <div className="mt-2">
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Based on current learning patterns</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Learning Pace</span>
                      </div>
                      <Badge variant="default">Optimal</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Current pace: 15% faster than average</p>
                    <div className="mt-2">
                      <Progress value={78} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Recommendation: Maintain current pace</p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Dropout Risk</span>
                      </div>
                      <Badge variant="secondary">Low Risk</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Risk assessment: 12% probability</p>
                    <div className="mt-2">
                      <Progress value={12} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Below threshold, continue monitoring</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Personalized Learning Insights</CardTitle>
                <CardDescription>AI-generated insights for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">Learning Pattern Identified</h4>
                          <Badge variant="outline">Strength</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Excels in problem-solving with visual learning methods</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Importance: 8/10</span>
                          <span className="text-xs text-green-600">Actionable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">Optimal Learning Path</h4>
                          <Badge variant="outline">Opportunity</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Focus on advanced calculus concepts for maximum growth</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Importance: 9/10</span>
                          <span className="text-xs text-green-600">Actionable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">Area for Improvement</h4>
                          <Badge variant="destructive">Weakness</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Practice needed in theoretical concept application</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Importance: 7/10</span>
                          <span className="text-xs text-green-600">Actionable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Early Intervention Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Early Intervention System</CardTitle>
              <CardDescription>Proactive alerts for at-risk students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">On Track</span>
                  </div>
                  <p className="text-sm text-green-700">85% of students are performing well</p>
                  <div className="text-xs text-green-600 mt-1">No action needed</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Monitoring</span>
                  </div>
                  <p className="text-sm text-yellow-700">12% require close monitoring</p>
                  <div className="text-xs text-yellow-600 mt-1">Weekly check-ins recommended</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Intervention</span>
                  </div>
                  <p className="text-sm text-red-700">3% need immediate intervention</p>
                  <div className="text-xs text-red-600 mt-1">Action plan required</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI-Powered Insights */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Machine learning generated insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start space-x-2">
                      <Brain className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Growth Pattern Identified</h4>
                        <p className="text-sm text-green-700">Strong correlation between tutor quality and student retention</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Optimal Pricing Strategy</h4>
                        <p className="text-sm text-blue-700">AI recommends 15% price increase for premium tier</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-start space-x-2">
                      <Activity className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Seasonal Pattern Detected</h4>
                        <p className="text-sm text-purple-700">Peak demand expected in Q4, plan resource allocation</p>
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
                <CardDescription>Data-driven strategic actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Invest in AI Technology</h4>
                    <p className="text-sm text-gray-600 mb-3">Allocate budget for AI-powered learning tools</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Expected ROI: 145%</span>
                      <Button size="sm" variant="outline">View Plan</Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Expand Premium Offerings</h4>
                    <p className="text-sm text-gray-600 mb-3">Develop high-value premium tutoring packages</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Revenue Impact: +25%</span>
                      <Button size="sm" variant="outline">Learn More</Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Enhance Mobile Experience</h4>
                    <p className="text-sm text-gray-600 mb-3">Improve mobile platform for better accessibility</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">User Growth: +18%</span>
                      <Button size="sm" variant="outline">Get Started</Button>
                    </div>
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