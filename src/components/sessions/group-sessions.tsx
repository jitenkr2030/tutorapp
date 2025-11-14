"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  Video, 
  Plus, 
  Search,
  Filter,
  UserPlus,
  Settings,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface GroupSession {
  id: string;
  title: string;
  description: string;
  tutorName: string;
  tutorAvatar: string;
  maxParticipants: number;
  currentParticipants: number;
  scheduledAt: string;
  duration: number;
  pricePerParticipant: number;
  currency: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  meetingLink?: string;
  recordingUrl?: string;
  isUserParticipant: boolean;
  hasRecordingConsent: boolean;
}

interface CreateGroupSessionData {
  title: string;
  description: string;
  maxParticipants: number;
  scheduledAt: string;
  duration: number;
  pricePerParticipant: number;
  currency: string;
}

export default function GroupSessions() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [joiningSession, setJoiningSession] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/group-sessions");
      if (!response.ok) {
        throw new Error("Failed to fetch group sessions");
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (sessionData: CreateGroupSessionData) => {
    setCreatingSession(true);
    setError(null);

    try {
      const response = await fetch("/api/group-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create group session");
      }

      await fetchSessions();
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleJoinSession = async (sessionId: string, recordingConsent: boolean) => {
    setJoiningSession(sessionId);
    setError(null);

    try {
      const response = await fetch(`/api/group-sessions/${sessionId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordingConsent }),
      });

      if (!response.ok) {
        throw new Error("Failed to join session");
      }

      const data = await response.json();
      
      // Redirect to session room
      if (data.meetingLink) {
        window.open(data.meetingLink, "_blank");
      }
      
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setJoiningSession(null);
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/group-sessions/${sessionId}/leave`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to leave session");
      }

      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave session");
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const upcomingSessions = filteredSessions.filter(session => 
    new Date(session.scheduledAt) > new Date() && session.status === "SCHEDULED"
  );
  
  const mySessions = filteredSessions.filter(session => session.isUserParticipant);
  
  const pastSessions = filteredSessions.filter(session => 
    new Date(session.scheduledAt) <= new Date() || session.status === "COMPLETED"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailableSlots = (session: GroupSession) => {
    return session.maxParticipants - session.currentParticipants;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Group Sessions</h2>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Group Sessions</h2>
          <p className="text-gray-600 mt-1">Join interactive group learning sessions with expert tutors</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Group Session</DialogTitle>
              <DialogDescription>
                Set up a new group learning session for multiple participants.
              </DialogDescription>
            </DialogHeader>
            <CreateGroupSessionForm
              onSubmit={handleCreateSession}
              loading={creatingSession}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="my-sessions">My Sessions ({mySessions.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <SessionGrid 
            sessions={upcomingSessions}
            onJoin={handleJoinSession}
            onLeave={handleLeaveSession}
            joiningSession={joiningSession}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getAvailableSlots={getAvailableSlots}
          />
        </TabsContent>

        <TabsContent value="my-sessions" className="mt-6">
          <SessionGrid 
            sessions={mySessions}
            onJoin={handleJoinSession}
            onLeave={handleLeaveSession}
            joiningSession={joiningSession}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getAvailableSlots={getAvailableSlots}
          />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <SessionGrid 
            sessions={pastSessions}
            onJoin={handleJoinSession}
            onLeave={handleLeaveSession}
            joiningSession={joiningSession}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getAvailableSlots={getAvailableSlots}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Session Grid Component
interface SessionGridProps {
  sessions: GroupSession[];
  onJoin: (sessionId: string, recordingConsent: boolean) => void;
  onLeave: (sessionId: string) => void;
  joiningSession: string | null;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getAvailableSlots: (session: GroupSession) => number;
}

function SessionGrid({ 
  sessions, 
  onJoin, 
  onLeave, 
  joiningSession, 
  formatDate, 
  getStatusColor, 
  getAvailableSlots 
}: SessionGridProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <Card key={session.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {session.description}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(session.status)}>
                {session.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Tutor Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {session.tutorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">{session.tutorName}</p>
                <p className="text-xs text-gray-600">Tutor</p>
              </div>
            </div>

            {/* Session Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(session.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{session.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>
                  {session.currentParticipants}/{session.maxParticipants} participants
                  {getAvailableSlots(session) > 0 && (
                    <span className="text-green-600 ml-1">
                      ({getAvailableSlots(session)} slots left)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{session.currency} {session.pricePerParticipant}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {session.status === "SCHEDULED" && (
                <>
                  {session.isUserParticipant ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => onJoin(session.id, session.hasRecordingConsent)}
                        disabled={joiningSession === session.id}
                      >
                        {joiningSession === session.id ? (
                          "Joining..."
                        ) : (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Join Session
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => onLeave(session.id)}
                      >
                        Leave Session
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => onJoin(session.id, false)}
                      disabled={joiningSession === session.id || getAvailableSlots(session) === 0}
                    >
                      {joiningSession === session.id ? (
                        "Joining..."
                      ) : getAvailableSlots(session) === 0 ? (
                        "Full"
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Session
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
              
              {session.status === "IN_PROGRESS" && session.isUserParticipant && (
                <Button 
                  className="w-full" 
                  onClick={() => onJoin(session.id, session.hasRecordingConsent)}
                  disabled={joiningSession === session.id}
                >
                  {joiningSession === session.id ? (
                    "Joining..."
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Rejoin Session
                    </>
                  )}
                </Button>
              )}
              
              {session.status === "COMPLETED" && session.recordingUrl && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(session.recordingUrl, "_blank")}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Watch Recording
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Create Group Session Form Component
interface CreateGroupSessionFormProps {
  onSubmit: (data: CreateGroupSessionData) => void;
  loading: boolean;
  onCancel: () => void;
}

function CreateGroupSessionForm({ onSubmit, loading, onCancel }: CreateGroupSessionFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxParticipants: 10,
    scheduledAt: "",
    duration: 60,
    pricePerParticipant: 10,
    currency: "USD"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Session Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter session title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what participants will learn"
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="maxParticipants">Max Participants</Label>
        <Select 
          value={formData.maxParticipants.toString()} 
          onValueChange={(value) => setFormData({ ...formData, maxParticipants: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 participants</SelectItem>
            <SelectItem value="10">10 participants</SelectItem>
            <SelectItem value="15">15 participants</SelectItem>
            <SelectItem value="20">20 participants</SelectItem>
            <SelectItem value="25">25 participants</SelectItem>
            <SelectItem value="30">30 participants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
          min={new Date().toISOString().slice(0, 16)}
          required
        />
      </div>

      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Select 
          value={formData.duration.toString()} 
          onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
            <SelectItem value="180">3 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pricePerParticipant">Price per Participant</Label>
          <Input
            id="pricePerParticipant"
            type="number"
            min="0"
            step="0.01"
            value={formData.pricePerParticipant}
            onChange={(e) => setFormData({ ...formData, pricePerParticipant: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Creating..." : "Create Session"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}