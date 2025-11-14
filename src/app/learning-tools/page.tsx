"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AssessmentCreator from "@/components/learning-tools/assessment-creator";
import HomeworkManagement from "@/components/learning-tools/homework-management";
import ResourceLibrary from "@/components/learning-tools/resource-library";
import InteractiveContent from "@/components/learning-tools/interactive-content";
import { 
  FileText, 
  BookOpen, 
  Library, 
  GamepadIcon, 
  Plus, 
  BarChart3, 
  Users, 
  Target,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";

export default function LearningToolsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for the overview dashboard
  const stats = {
    assessments: {
      total: 24,
      published: 18,
      draft: 6,
      completions: 156
    },
    homework: {
      assigned: 45,
      submitted: 32,
      graded: 28,
      overdue: 3
    },
    resources: {
      total: 89,
      documents: 34,
      videos: 23,
      interactive: 15,
      downloads: 1245
    },
    interactive: {
      total: 23,
      simulations: 8,
      games: 6,
      labs: 5,
      completions: 89
    }
  };

  const recentActivity = [
    {
      type: "assessment",
      title: "Algebra Quiz - Chapter 5",
      action: "published",
      time: "2 hours ago",
      icon: FileText
    },
    {
      type: "homework",
      title: "Physics Problem Set",
      action: "assigned",
      time: "4 hours ago",
      icon: BookOpen
    },
    {
      type: "resource",
      title: "Chemistry Study Guide",
      action: "uploaded",
      time: "1 day ago",
      icon: Library
    },
    {
      type: "interactive",
      title: "Virtual Biology Lab",
      action: "created",
      time: "2 days ago",
      icon: GamepadIcon
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "assessment": return FileText;
      case "homework": return BookOpen;
      case "resource": return Library;
      case "interactive": return GamepadIcon;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Tools</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive tools for assessment, homework, resources, and interactive learning
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Enhanced Learning Platform
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assessments</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.assessments.total}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{stats.assessments.published} published</span>
                    </span>
                    <span>•</span>
                    <span>{stats.assessments.completions} completions</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Homework</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.homework.assigned}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{stats.homework.graded} graded</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-red-500">
                      <Clock className="h-3 w-3" />
                      <span>{stats.homework.overdue} overdue</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resources</CardTitle>
                  <Library className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.resources.total}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{stats.resources.documents} docs</span>
                    <span>•</span>
                    <span>{stats.resources.videos} videos</span>
                    <span>•</span>
                    <span>{stats.resources.downloads} downloads</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interactive</CardTitle>
                  <GamepadIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.interactive.total}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{stats.interactive.simulations} sims</span>
                    <span>•</span>
                    <span>{stats.interactive.games} games</span>
                    <span>•</span>
                    <span>{stats.interactive.completions} completions</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Quickly create new learning materials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("assessments")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("homework")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Homework
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("resources")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Resource
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("interactive")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Interactive Content
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates to your learning tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = getIcon(activity.type);
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.action} • {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Feature Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Tools Features</CardTitle>
                <CardDescription>Comprehensive tools for modern education</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4">
                    <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Assessments</h3>
                    <p className="text-xs text-gray-600">Create quizzes, tests, and assignments with multiple question types</p>
                  </div>
                  <div className="text-center p-4">
                    <BookOpen className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Homework</h3>
                    <p className="text-xs text-gray-600">Assign, track, and grade homework with priority management</p>
                  </div>
                  <div className="text-center p-4">
                    <Library className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Resources</h3>
                    <p className="text-xs text-gray-600">Share and organize educational materials with categories and tags</p>
                  </div>
                  <div className="text-center p-4">
                    <GamepadIcon className="h-8 w-8 mx-auto text-red-600 mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Interactive</h3>
                    <p className="text-xs text-gray-600">Create engaging simulations, games, and virtual labs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentCreator />
          </TabsContent>

          <TabsContent value="homework">
            <HomeworkManagement />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceLibrary />
          </TabsContent>

          <TabsContent value="interactive">
            <InteractiveContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}