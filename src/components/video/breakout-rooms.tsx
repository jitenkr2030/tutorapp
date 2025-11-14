"use client";

import { useState, useEffect, useRef } from "react";
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
  Plus, 
  Settings, 
  Move, 
  Clock, 
  MessageSquare,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Maximize,
  Minimize,
  AlertTriangle,
  CheckCircle,
  Timer,
  Shuffle,
  UserPlus,
  UserMinus,
  RefreshCw,
  Broadcast,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";

interface BreakoutRoom {
  id: string;
  name: string;
  description?: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  createdAt: string;
  participants: BreakoutRoomParticipant[];
}

interface BreakoutRoomParticipant {
  id: string;
  userId: string;
  userName: string;
  joinedAt?: string;
  leftAt?: string;
  isHost: boolean;
}

interface BreakoutRoomManagerProps {
  groupSessionId: string;
  userId: string;
  userName: string;
  isTutor: boolean;
  onRoomJoin: (roomId: string) => void;
  onRoomLeave: (roomId: string) => void;
}

export default function BreakoutRoomManager({ 
  groupSessionId, 
  userId, 
  userName, 
  isTutor, 
  onRoomJoin, 
  onRoomLeave 
}: BreakoutRoomManagerProps) {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<BreakoutRoom | null>(null);
  const [currentRoom, setCurrentRoom] = useState<BreakoutRoom | null>(null);
  const [roomTimer, setRoomTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [autoAssignMode, setAutoAssignMode] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setRoomTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms`);
      if (!response.ok) {
        throw new Error("Failed to fetch breakout rooms");
      }
      const data = await response.json();
      setRooms(data.rooms || []);
      
      // Update current room if user is in one
      const userRoom = data.rooms.find((room: BreakoutRoom) => 
        room.participants.some((p: BreakoutRoomParticipant) => p.userId === userId)
      );
      setCurrentRoom(userRoom || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (roomData: { name: string; description?: string; maxParticipants: number }) => {
    setCreatingRoom(true);
    setError(null);

    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        throw new Error("Failed to create breakout room");
      }

      await fetchRooms();
      setShowCreateDialog(false);
      toast.success("Breakout room created successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms/${roomId}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to join breakout room");
      }

      await fetchRooms();
      onRoomJoin(roomId);
      toast.success("Joined breakout room");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms/${roomId}/leave`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to leave breakout room");
      }

      await fetchRooms();
      onRoomLeave(roomId);
      toast.success("Left breakout room");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave room");
    }
  };

  const handleActivateRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms/${roomId}/activate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to activate room");
      }

      await fetchRooms();
      toast.success("Breakout room activated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate room");
    }
  };

  const handleDeactivateRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms/${roomId}/deactivate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to deactivate room");
      }

      await fetchRooms();
      toast.success("Breakout room deactivated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate room");
    }
  };

  const handleAutoAssign = async () => {
    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms/auto-assign`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to auto-assign participants");
      }

      await fetchRooms();
      toast.success("Participants auto-assigned to rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to auto-assign");
    }
  };

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) return;

    try {
      const response = await fetch(`/api/group-sessions/${groupSessionId}/breakout-rooms/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: broadcastMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to broadcast message");
      }

      setBroadcastMessage("");
      toast.success("Message broadcasted to all rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to broadcast message");
    }
  };

  const handleStartTimer = () => {
    setIsTimerActive(true);
    setRoomTimer(0);
    toast.success("Breakout session timer started");
  };

  const handleStopTimer = () => {
    setIsTimerActive(false);
    toast.success("Breakout session timer stopped");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvailableSlots = (room: BreakoutRoom) => {
    return room.maxParticipants - room.currentParticipants;
  };

  const getTotalParticipants = () => {
    return rooms.reduce((total, room) => total + room.currentParticipants, 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Breakout Rooms
          </h3>
          <p className="text-gray-600 text-sm">
            Create and manage breakout rooms for group discussions
          </p>
        </div>
        
        {isTutor && (
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Breakout Room</DialogTitle>
                  <DialogDescription>
                    Create a new breakout room for group activities
                  </DialogDescription>
                </DialogHeader>
                <CreateBreakoutRoomForm
                  onSubmit={handleCreateRoom}
                  loading={creatingRoom}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleAutoAssign}>
              <Shuffle className="h-4 w-4 mr-2" />
              Auto Assign
            </Button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-xl font-bold">{rooms.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rooms</p>
                <p className="text-xl font-bold">{rooms.filter(r => r.isActive).length}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participants</p>
                <p className="text-xl font-bold">{getTotalParticipants()}</p>
              </div>
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Session Time</p>
                <p className="text-xl font-bold">{formatTime(roomTimer)}</p>
              </div>
              <Timer className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Room Status */}
      {currentRoom && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5" />
              Current Room: {currentRoom.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  You are currently in this breakout room
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span>Participants: {currentRoom.currentParticipants}/{currentRoom.maxParticipants}</span>
                  <Badge variant={currentRoom.isActive ? "default" : "secondary"}>
                    {currentRoom.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleLeaveRoom(currentRoom.id)}
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Leave Room
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer and Broadcast Controls */}
      {isTutor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Timer Controls */}
              <div className="space-y-3">
                <h4 className="font-medium">Session Timer</h4>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-mono bg-gray-100 px-3 py-2 rounded">
                    {formatTime(roomTimer)}
                  </div>
                  {!isTimerActive ? (
                    <Button onClick={handleStartTimer}>
                      <Timer className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleStopTimer}>
                      <Timer className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              {/* Broadcast Controls */}
              <div className="space-y-3">
                <h4 className="font-medium">Broadcast Message</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type message to broadcast..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBroadcastMessage()}
                  />
                  <Button onClick={handleBroadcastMessage} disabled={!broadcastMessage.trim()}>
                    <Broadcast className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakout Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className={`transition-all ${room.isActive ? 'ring-2 ring-green-500' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  {room.description && (
                    <CardDescription>{room.description}</CardDescription>
                  )}
                </div>
                <Badge variant={room.isActive ? "default" : "secondary"}>
                  {room.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Participants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Participants</span>
                  <span>{room.currentParticipants}/{room.maxParticipants}</span>
                </div>
                
                {room.participants.length > 0 && (
                  <div className="space-y-1">
                    {room.participants.slice(0, 3).map((participant) => (
                      <div key={participant.id} className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs">
                            {participant.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="truncate">{participant.userName}</span>
                        {participant.isHost && (
                          <Badge variant="outline" className="text-xs">Host</Badge>
                        )}
                      </div>
                    ))}
                    {room.participants.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{room.participants.length - 3} more participants
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {currentRoom?.id === room.id ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleLeaveRoom(room.id)}
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    Leave Room
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={getAvailableSlots(room) === 0 || !room.isActive}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {getAvailableSlots(room) === 0 ? "Full" : "Join Room"}
                  </Button>
                )}

                {isTutor && (
                  <div className="flex gap-2">
                    {room.isActive ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDeactivateRoom(room.id)}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleActivateRoom(room.id)}
                      >
                        Activate
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowManageDialog(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {rooms.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No breakout rooms created</h3>
          <p className="text-gray-600 mb-4">
            Create breakout rooms to facilitate group discussions and activities.
          </p>
          {isTutor && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Room
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Create Breakout Room Form Component
interface CreateBreakoutRoomFormProps {
  onSubmit: (data: { name: string; description?: string; maxParticipants: number }) => void;
  loading: boolean;
  onCancel: () => void;
}

function CreateBreakoutRoomForm({ onSubmit, loading, onCancel }: CreateBreakoutRoomFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxParticipants: 4
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Room Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter room name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the purpose of this room..."
          rows={2}
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
            <SelectItem value="2">2 participants</SelectItem>
            <SelectItem value="3">3 participants</SelectItem>
            <SelectItem value="4">4 participants</SelectItem>
            <SelectItem value="5">5 participants</SelectItem>
            <SelectItem value="6">6 participants</SelectItem>
            <SelectItem value="8">8 participants</SelectItem>
            <SelectItem value="10">10 participants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Creating..." : "Create Room"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}