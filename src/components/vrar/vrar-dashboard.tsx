"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Headset, 
  Smartphone, 
  Clock, 
  Trophy, 
  Target, 
  Play,
  Pause,
  BarChart3,
  Users,
  Star,
  MapPin
} from "lucide-react";

interface VRARExperience {
  id: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  gradeLevel: string;
  difficulty: number;
  duration: number;
  thumbnailUrl?: string;
  contentUrl: string;
  isActive: boolean;
  _count: {
    sessions: number;
    userProgress: number;
  };
}

interface VRARSession {
  id: string;
  experienceId: string;
  deviceType: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  completionRate: number;
  score?: number;
  interactions: number;
  experience: VRARExperience;
}

interface VRARProgress {
  id: string;
  experienceId: string;
  progress: number;
  timeSpent: number;
  bestScore?: number;
  attempts: number;
  completed: boolean;
  lastAccessed: string;
  experience: VRARExperience;
}

interface VRARAnalytics {
  totalSessions: number;
  totalTime: number;
  vrStats: {
    sessions: number;
    time: number;
    completedExperiences: number;
    avgCompletionRate: number;
  };
  arStats: {
    sessions: number;
    time: number;
    completedExperiences: number;
    avgCompletionRate: number;
  };
  recentActivity: VRARSession[];
}

export function VRARDashboard() {
  const [vrExperiences, setVRExperiences] = useState<VRARExperience[]>([]);
  const [arExperiences, setARExperiences] = useState<VRARExperience[]>([]);
  const [vrSessions, setVRSessions] = useState<VRARSession[]>([]);
  const [arSessions, setARSessions] = useState<VRARSession[]>([]);
  const [vrProgress, setVRProgress] = useState<VRARProgress[]>([]);
  const [arProgress, setARProgress] = useState<VRARProgress[]>([]);
  const [analytics, setAnalytics] = useState<VRARAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("experiences");

  useEffect(() => {
    fetchVRARData();
  }, []);

  const fetchVRARData = async () => {
    try {
      setLoading(true);
      
      const [vrExpRes, arExpRes, vrSessRes, arSessRes, vrProgRes, arProgRes, analyticsRes] = await Promise.all([
        fetch('/api/vrar/vr-experiences'),
        fetch('/api/vrar/ar-experiences'),
        fetch('/api/vrar/sessions?type=vr'),
        fetch('/api/vrar/sessions?type=ar'),
        fetch('/api/vrar/progress?type=vr'),
        fetch('/api/vrar/progress?type=ar'),
        fetch('/api/vrar/analytics?type=summary')
      ]);

      const [vrExpData, arExpData, vrSessData, arSessData, vrProgData, arProgData, analyticsData] = await Promise.all([
        vrExpRes.json(),
        arExpRes.json(),
        vrSessRes.json(),
        arSessRes.json(),
        vrProgRes.json(),
        arProgRes.json(),
        analyticsRes.json()
      ]);

      setVRExperiences(vrExpData.experiences || []);
      setARExperiences(arExpData.experiences || []);
      setVRSessions(vrSessData.sessions || []);
      setARSessions(arSessData.sessions || []);
      setVRProgress(vrProgData.progress || []);
      setARProgress(arProgData.progress || []);
      setAnalytics(analyticsData.analytics || null);
    } catch (error) {
      console.error('Error fetching VR/AR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExperience = async (experienceId: string, type: 'vr' | 'ar') => {
    try {
      const response = await fetch('/api/vrar/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          experienceId,
          deviceType: type === 'vr' ? 'WEB_VR' : 'SMARTPHONE'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Session started:', data.session);
        // In a real app, this would launch the VR/AR experience
        alert(`${type.toUpperCase()} experience started! Session ID: ${data.session.id}`);
      }
    } catch (error) {
      console.error('Error starting experience:', error);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'WEB_VR':
      case 'OCULUS_QUEST':
      case 'HTC_VIVE':
        return <Headset className="h-4 w-4" />;
      case 'SMARTPHONE':
      case 'TABLET':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading VR/AR experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                {Math.floor(analytics.totalTime / 60)}h {analytics.totalTime % 60}m total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VR Sessions</CardTitle>
              <Headset className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.vrStats.sessions}</div>
              <p className="text-xs text-muted-foreground">
                {Math.floor(analytics.vrStats.time / 60)}h {analytics.vrStats.time % 60}m
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AR Sessions</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.arStats.sessions}</div>
              <p className="text-xs text-muted-foreground">
                {Math.floor(analytics.arStats.time / 60)}h {analytics.arStats.time % 60}m
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.vrStats.completedExperiences + analytics.arStats.completedExperiences}
              </div>
              <p className="text-xs text-muted-foreground">
                Experiences finished
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiences">Experiences</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="experiences" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VR Experiences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Headset className="h-5 w-5" />
                  <span>Virtual Reality Experiences</span>
                </CardTitle>
                <CardDescription>
                  Immerse yourself in 3D learning environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {vrExperiences.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No VR experiences available
                    </p>
                  ) : (
                    vrExperiences.map((exp) => (
                      <Card key={exp.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">{exp.subject}</Badge>
                              <Badge variant="outline">{exp.gradeLevel}</Badge>
                              <Badge className={getDifficultyColor(exp.difficulty)}>
                                Level {exp.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{exp.duration}m</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{exp._count.sessions} sessions</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => startExperience(exp.id, 'vr')}
                            className="ml-4"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AR Experiences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Augmented Reality Experiences</span>
                </CardTitle>
                <CardDescription>
                  Interactive learning with real-world overlay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {arExperiences.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No AR experiences available
                    </p>
                  ) : (
                    arExperiences.map((exp) => (
                      <Card key={exp.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">{exp.subject}</Badge>
                              <Badge variant="outline">{exp.gradeLevel}</Badge>
                              <Badge className={getDifficultyColor(exp.difficulty)}>
                                Level {exp.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{exp.duration}m</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{exp._count.sessions} sessions</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => startExperience(exp.id, 'ar')}
                            className="ml-4"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VR Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent VR Sessions</CardTitle>
                <CardDescription>Your virtual reality learning history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {vrSessions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No VR sessions yet
                    </p>
                  ) : (
                    vrSessions.map((session) => (
                      <Card key={session.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{session.experience.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{session.experience.subject}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-1">
                                {getDeviceIcon(session.deviceType)}
                                <span>{session.deviceType}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Target className="h-3 w-3" />
                                <span className="text-sm">{Math.round(session.completionRate * 100)}% complete</span>
                              </div>
                              {session.score && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3" />
                                  <span className="text-sm">Score: {session.score}</span>
                                </div>
                              )}
                            </div>
                            <Progress value={session.completionRate * 100} className="mt-2" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AR Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AR Sessions</CardTitle>
                <CardDescription>Your augmented reality learning history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {arSessions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No AR sessions yet
                    </p>
                  ) : (
                    arSessions.map((session) => (
                      <Card key={session.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{session.experience.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{session.experience.subject}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-1">
                                {getDeviceIcon(session.deviceType)}
                                <span>{session.deviceType}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </div>
                              {session.duration && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{session.duration}m</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Target className="h-3 w-3" />
                                <span className="text-sm">{Math.round(session.completionRate * 100)}% complete</span>
                              </div>
                              {session.score && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3" />
                                  <span className="text-sm">Score: {session.score}</span>
                                </div>
                              )}
                            </div>
                            <Progress value={session.completionRate * 100} className="mt-2" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VR Progress */}
            <Card>
              <CardHeader>
                <CardTitle>VR Learning Progress</CardTitle>
                <CardDescription>Your virtual reality achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {vrProgress.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No VR progress yet
                    </p>
                  ) : (
                    vrProgress.map((progress) => (
                      <Card key={progress.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{progress.experience.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{progress.experience.subject}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{progress.timeSpent}m spent</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>{progress.attempts} attempts</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm">{Math.round(progress.progress * 100)}% complete</span>
                              {progress.completed && (
                                <Badge className="bg-green-500">Completed</Badge>
                              )}
                              {progress.bestScore && (
                                <Badge variant="outline">Best: {progress.bestScore}</Badge>
                              )}
                            </div>
                            <Progress value={progress.progress * 100} className="mt-2" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AR Progress */}
            <Card>
              <CardHeader>
                <CardTitle>AR Learning Progress</CardTitle>
                <CardDescription>Your augmented reality achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {arProgress.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No AR progress yet
                    </p>
                  ) : (
                    arProgress.map((progress) => (
                      <Card key={progress.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{progress.experience.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{progress.experience.subject}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{progress.timeSpent}m spent</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>{progress.attempts} attempts</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm">{Math.round(progress.progress * 100)}% complete</span>
                              {progress.completed && (
                                <Badge className="bg-green-500">Completed</Badge>
                              )}
                              {progress.bestScore && (
                                <Badge variant="outline">Best: {progress.bestScore}</Badge>
                              )}
                            </div>
                            <Progress value={progress.progress * 100} className="mt-2" />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest VR/AR learning sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity) => (
                    <Card key={activity.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getDeviceIcon(activity.deviceType)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{activity.experience.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{activity.experience.subject}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(activity.startTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{Math.round(activity.completionRate * 100)}% complete</span>
                            </div>
                            {activity.duration && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{activity.duration}m duration</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {activity.score && (
                            <Badge variant="outline">
                              <Star className="h-3 w-3 mr-1" />
                              {activity.score}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}