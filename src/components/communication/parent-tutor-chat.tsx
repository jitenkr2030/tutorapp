'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    role: string;
  };
  read: boolean;
}

interface Tutor {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  subjects: {
    subject: {
      name: string;
    };
  }[];
}

interface Student {
  id: string;
  user: {
    id: string;
    name: string;
  };
}

interface ParentTutorChatProps {
  tutorId?: string;
  studentId?: string;
}

export default function ParentTutorChat({ tutorId, studentId }: ParentTutorChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>(tutorId || '');
  const [selectedStudent, setSelectedStudent] = useState<string>(studentId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      fetchTutors();
      fetchStudents();
    }
  }, [session]);

  useEffect(() => {
    if (selectedTutor && selectedStudent) {
      fetchMessages();
    }
  }, [selectedTutor, selectedStudent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTutors = async () => {
    try {
      const response = await fetch('/api/parent/tutors');
      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors || []);
        
        if (data.tutors?.length > 0 && !selectedTutor) {
          setSelectedTutor(data.tutors[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/parent/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        
        if (data.students?.length > 0 && !selectedStudent) {
          setSelectedStudent(data.students[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/parent/messages/${selectedTutor}/${selectedStudent}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTutor || !selectedStudent) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/parent/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedTutor,
          content: newMessage,
          studentId: selectedStudent
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg.message]);
        setNewMessage('');
        
        // Mark messages as read
        await fetch(`/api/parent/messages/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tutorId: selectedTutor,
            studentId: selectedStudent
          }),
        });
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const selectedTutorData = tutors.find(t => t.id === selectedTutor);
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px]">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Select Student</h3>
          <div className="space-y-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  selectedStudent === student.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {getInitials(student.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{student.user.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Select Tutor</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {tutors.map((tutor) => (
              <button
                key={tutor.id}
                onClick={() => setSelectedTutor(tutor.id)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  selectedTutor === tutor.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={tutor.user.avatar} />
                    <AvatarFallback>
                      {getInitials(tutor.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{tutor.user.name}</div>
                    <div className="text-xs opacity-70">
                      {tutor.subjects.map(s => s.subject.name).join(', ')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedTutorData && selectedStudentData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedTutorData.user.avatar} />
                  <AvatarFallback>
                    {getInitials(selectedTutorData.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedTutorData.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Regarding {selectedStudentData.user.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender.id === session?.user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender.id === session?.user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.sender.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.sender.role}
                          </Badge>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.sender.id === session?.user?.id && (
                            <>
                              {message.read ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <Button type="submit" disabled={!newMessage.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {students.length === 0 
                  ? 'Add students to start communicating' 
                  : tutors.length === 0 
                  ? 'No tutors available' 
                  : 'Select a student and tutor to start chatting'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}