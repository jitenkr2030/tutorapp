'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface SchedulingRecommendation {
  type: 'TIME_SLOT' | 'FREQUENCY' | 'RESOLUTION';
  title: string;
  description: string;
  suggestedSlots: Array<{
    day: string;
    startTime: string;
    endTime: string;
    confidence: number;
  }>;
  benefits: string[];
  considerations: string[];
  priority: 'high' | 'medium' | 'low';
}

interface OptimizationMetrics {
  efficiency: number;
  satisfaction: number;
  utilization: number;
}

interface Implementation {
  immediateActions: string[];
  longTermStrategy: string;
}

interface SchedulingOptimizationProps {
  tutorId?: string;
  studentId?: string;
  sessionId?: string;
  onScheduleSelect?: (slot: any) => void;
}

export default function SchedulingOptimization({ 
  tutorId, 
  studentId, 
  sessionId, 
  onScheduleSelect 
}: SchedulingOptimizationProps) {
  const [optimizationType, setOptimizationType] = useState<'OPTIMIZATION' | 'CONFLICT_RESOLUTION' | 'PREDICTION'>('OPTIMIZATION');
  const [recommendations, setRecommendations] = useState<SchedulingRecommendation[]>([]);
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [implementation, setImplementation] = useState<Implementation | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<string>(tutorId || '');
  const [selectedStudent, setSelectedStudent] = useState<string>(studentId || '');

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/scheduling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: optimizationType,
          tutorId: selectedTutor,
          studentId: selectedStudent,
          sessionId,
          preferences: {
            optimizationGoal: 'efficiency'
          },
          constraints: {
            maxSessionsPerDay: 3,
            minBreakBetweenSessions: 30
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize scheduling');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setMetrics(data.optimizationMetrics);
      setImplementation(data.implementation);
    } catch (error) {
      console.error('Error optimizing scheduling:', error);
    } finally {
      setLoading(false);
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDay = (day: string) => {
    const days = {
      'Monday': 'Mon',
      'Tuesday': 'Tue', 
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return days[day as keyof typeof days] || day;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            AI Scheduling Optimization
          </h2>
          <p className="text-gray-600 mt-1">
            Intelligent scheduling recommendations to maximize learning efficiency
          </p>
        </div>
        <Button 
          onClick={handleOptimize} 
          disabled={loading || !selectedTutor || !selectedStudent}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Optimize Schedule
            </>
          )}
        </Button>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Optimization Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Optimization Type</label>
              <Select value={optimizationType} onValueChange={(value: any) => setOptimizationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPTIMIZATION">Schedule Optimization</SelectItem>
                  <SelectItem value="CONFLICT_RESOLUTION">Conflict Resolution</SelectItem>
                  <SelectItem value="PREDICTION">Predictive Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tutor</label>
              <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tutor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutor-1">Dr. Sarah Johnson</SelectItem>
                  <SelectItem value="tutor-2">Prof. Michael Chen</SelectItem>
                  <SelectItem value="tutor-3">Ms. Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student-1">John Smith</SelectItem>
                  <SelectItem value="student-2">Emma Wilson</SelectItem>
                  <SelectItem value="student-3">Alex Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          {/* Optimization Metrics */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Optimization Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#10b981"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${metrics.efficiency * 226.2} 226.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute">
                        <span className="text-lg font-bold">{Math.round(metrics.efficiency * 100)}%</span>
                      </div>
                    </div>
                    <h3 className="font-medium mt-2">Efficiency</h3>
                    <p className="text-sm text-gray-500">Schedule optimization</p>
                  </div>

                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${metrics.satisfaction * 226.2} 226.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute">
                        <span className="text-lg font-bold">{Math.round(metrics.satisfaction * 100)}%</span>
                      </div>
                    </div>
                    <h3 className="font-medium mt-2">Satisfaction</h3>
                    <p className="text-sm text-gray-500">User experience</p>
                  </div>

                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#8b5cf6"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${metrics.utilization * 226.2} 226.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute">
                        <span className="text-lg font-bold">{Math.round(metrics.utilization * 100)}%</span>
                      </div>
                    </div>
                    <h3 className="font-medium mt-2">Utilization</h3>
                    <p className="text-sm text-gray-500">Resource usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {recommendation.type === 'TIME_SLOT' && <Clock className="w-5 h-5 text-blue-500" />}
                        {recommendation.type === 'FREQUENCY' && <TrendingUp className="w-5 h-5 text-green-500" />}
                        {recommendation.type === 'RESOLUTION' && <Target className="w-5 h-5 text-red-500" />}
                        {recommendation.title}
                      </CardTitle>
                      <CardDescription>{recommendation.description}</CardDescription>
                    </div>
                    <Badge className={`ml-2 ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Suggested Time Slots */}
                  {recommendation.suggestedSlots.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        Suggested Time Slots
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recommendation.suggestedSlots.map((slot, slotIndex) => (
                          <div 
                            key={slotIndex} 
                            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:border-purple-300 ${
                              getConfidenceColor(slot.confidence)
                            }`}
                            onClick={() => onScheduleSelect?.(slot)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{formatDay(slot.day)}</span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(slot.confidence * 100)}% match
                              </Badge>
                            </div>
                            <div className="text-lg font-bold text-purple-600">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits and Considerations */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Benefits
                      </h4>
                      <ul className="text-sm space-y-1">
                        {recommendation.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-yellow-700 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Considerations
                      </h4>
                      <ul className="text-sm space-y-1">
                        {recommendation.considerations.map((consideration, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                            {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Implementation Plan */}
          {implementation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Implementation Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-blue-700">Immediate Actions</h4>
                  <ol className="space-y-2">
                    {implementation.immediateActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-purple-700">Long-term Strategy</h4>
                  <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                    {implementation.longTermStrategy}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Optimize Your Schedule
            </h3>
            <p className="text-gray-500 mb-6">
              Select a tutor and student, then click "Optimize Schedule" to get AI-powered scheduling recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}