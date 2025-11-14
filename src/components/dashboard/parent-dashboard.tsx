'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle,
  Star,
  DollarSign
} from 'lucide-react';

interface Student {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  grade?: string;
  school?: string;
}

interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: string;
  tutor: {
    user: {
      name: string;
      avatar?: string;
    };
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  booking: {
    session: {
      title: string;
      tutor: {
        user: {
          name: string;
        };
      };
    };
  };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    name: string;
    role: string;
  };
  read: boolean;
}

export default function ParentDashboard() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/parent/students');
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
      }

      // Fetch upcoming sessions
      const sessionsResponse = await fetch('/api/parent/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setUpcomingSessions(sessionsData.sessions || []);
      }

      // Fetch recent payments
      const paymentsResponse = await fetch('/api/parent/payments');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setRecentPayments(paymentsData.payments || []);
      }

      // Fetch unread messages
      const messagesResponse = await fetch('/api/parent/messages');
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setUnreadMessages(messagesData.messages || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      SCHEDULED: 'default',
      IN_PROGRESS: 'secondary',
      COMPLETED: 'outline',
      CANCELLED: 'destructive',
      PENDING: 'secondary',
      COMPLETED: 'default',
      FAILED: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your children's learning journey
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadMessages.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {unreadMessages.length} unread
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Children</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  ${recentPayments.reduce((sum, payment) => sum + payment.amount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{unreadMessages.length}</p>
                <p className="text-xs text-muted-foreground">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  Scheduled tutoring sessions for your children
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={session.tutor.user.avatar} />
                            <AvatarFallback>
                              {getInitials(session.tutor.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.tutor.user.name} • {new Date(session.scheduledAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                    ))}
                    {upcomingSessions.length > 5 && (
                      <Button variant="outline" className="w-full">
                        View All Sessions
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Latest communications from tutors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unreadMessages.length > 0 ? (
                  <div className="space-y-3">
                    {unreadMessages.slice(0, 5).map((message) => (
                      <div key={message.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{message.sender.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        {!message.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                    {unreadMessages.length > 5 && (
                      <Button variant="outline" className="w-full">
                        View All Messages
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No new messages</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="children" className="space-y-4">
          <div className="grid gap-6">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.user.avatar} />
                      <AvatarFallback>
                        {getInitials(student.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{student.user.name}</CardTitle>
                      <CardDescription>
                        {student.grade} • {student.school}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Active Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Completed Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Learning Plans</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline">View Progress</Button>
                    <Button>Book Session</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {students.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No children added</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your children to start managing their learning journey
                    </p>
                    <Button>Add Child</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>
                View all tutoring sessions for your children
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.tutor.user.avatar} />
                          <AvatarFallback>
                            {getInitials(session.tutor.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.tutor.user.name} • {session.duration} minutes
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(session.status)}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sessions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Communicate with tutors and manage conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreadMessages.length > 0 ? (
                <div className="space-y-3">
                  {unreadMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{message.sender.name}</p>
                            <Badge variant="outline">{message.sender.role}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <div className="mt-3 flex justify-end space-x-2">
                          <Button variant="outline" size="sm">Reply</Button>
                          <Button variant="outline" size="sm">Mark as Read</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}