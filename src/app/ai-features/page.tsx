'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  TrendingUp,
  Users,
  BookOpen,
  Zap
} from 'lucide-react';
import SmartMatching from '@/components/ai/smart-matching';
import ContentRecommendations from '@/components/ai/content-recommendations';
import SchedulingOptimization from '@/components/ai/scheduling-optimization';
import Chatbot from '@/components/ai/chatbot';

export default function AIFeaturesPage() {
  const [selectedTab, setSelectedTab] = useState('matching');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI-Powered Features</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of online education with our intelligent AI features designed 
            to enhance learning, optimize scheduling, and provide personalized support.
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Smart Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                AI-powered tutor-student matching based on learning styles, goals, and preferences
              </CardDescription>
              <Badge className="mt-2 bg-purple-100 text-purple-700">
                95% Match Accuracy
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Content Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Personalized learning content and study plans tailored to individual progress
              </CardDescription>
              <Badge className="mt-2 bg-blue-100 text-blue-700">
                Adaptive Learning
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Intelligent scheduling optimization to maximize learning efficiency and availability
              </CardDescription>
              <Badge className="mt-2 bg-green-100 text-green-700">
                85% Efficiency
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                24/7 AI customer service and support with intelligent response system
              </CardDescription>
              <Badge className="mt-2 bg-yellow-100 text-yellow-700">
                Always Available
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matching" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Smart Matching
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matching" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  AI-Powered Tutor Matching
                </CardTitle>
                <CardDescription>
                  Our intelligent matching system analyzes learning preferences, goals, and personality traits 
                  to find the perfect tutor match for each student.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SmartMatching 
                  onMatchSelect={(tutorId) => {
                    console.log('Selected tutor:', tutorId);
                    // Handle tutor selection
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Personalized Learning Recommendations
                </CardTitle>
                <CardDescription>
                  Get AI-powered content recommendations, study plans, and learning paths tailored 
                  to your individual progress, goals, and learning style.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentRecommendations 
                  onRecommendationAction={(id, action) => {
                    console.log('Recommendation action:', id, action);
                    // Handle recommendation actions
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Intelligent Scheduling Optimization
                </CardTitle>
                <CardDescription>
                  Optimize your tutoring schedule with AI-powered time slot recommendations, 
                  conflict resolution, and predictive availability analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SchedulingOptimization 
                  onScheduleSelect={(slot) => {
                    console.log('Selected schedule slot:', slot);
                    // Handle schedule selection
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                    AI Customer Service Assistant
                  </CardTitle>
                  <CardDescription>
                    Our AI assistant is here to help you with bookings, scheduling, 
                    technical support, and any questions about our platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Chatbot 
                    onAction={(action) => {
                      console.log('Chatbot action:', action);
                      // Handle chatbot actions
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <h4 className="font-medium">Natural Language Processing</h4>
                        <p className="text-sm text-gray-600">
                          Understands complex queries and context
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <h4 className="font-medium">Intent Recognition</h4>
                        <p className="text-sm text-gray-600">
                          Identifies user needs and provides relevant solutions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <h4 className="font-medium">Multi-language Support</h4>
                        <p className="text-sm text-gray-600">
                          Communicates in multiple languages
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                      <div>
                        <h4 className="font-medium">Smart Escalation</h4>
                        <p className="text-sm text-gray-600">
                          Knows when to escalate to human support
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                      <div>
                        <h4 className="font-medium">24/7 Availability</h4>
                        <p className="text-sm text-gray-600">
                          Always ready to help, day or night
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Try asking about:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Booking tutors
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Payment methods
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Technical issues
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Schedule changes
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Benefits Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              AI Integration Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-sm text-gray-600">Match Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">78%</div>
                <div className="text-sm text-gray-600">Better Learning Outcomes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Support Availability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}