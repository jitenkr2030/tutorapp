'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Star,
  Send,
  Settings,
  History,
  Sparkles,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITutorAssistant {
  id: string;
  subject: string;
  expertise: string[];
  personality: string;
  capabilities: string[];
  isActive: boolean;
}

interface Conversation {
  id: string;
  messages: Message[];
  topicsCovered: string[];
  satisfaction?: number;
  createdAt: Date;
}

export default function AITutorPage() {
  const [assistants, setAssistants] = useState<AITutorAssistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<AITutorAssistant | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Sample AI Tutor Assistants
  useEffect(() => {
    const sampleAssistants: AITutorAssistant[] = [
      {
        id: '1',
        subject: 'Mathematics',
        expertise: ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Trigonometry'],
        personality: 'encouraging',
        capabilities: ['problem-solving', 'concept-explanation', 'step-by-step-guidance', 'practice-problems'],
        isActive: true
      },
      {
        id: '2',
        subject: 'Physics',
        expertise: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics'],
        personality: 'friendly',
        capabilities: ['concept-explanation', 'formula-derivation', 'real-world-applications', 'visualization'],
        isActive: true
      },
      {
        id: '3',
        subject: 'Chemistry',
        expertise: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry'],
        personality: 'strict',
        capabilities: ['reaction-mechanisms', 'molecular-visualization', 'lab-procedures', 'problem-solving'],
        isActive: true
      },
      {
        id: '4',
        subject: 'English Literature',
        expertise: ['Poetry', 'Prose', 'Drama', 'Literary Analysis', 'Writing'],
        personality: 'encouraging',
        capabilities: ['text-analysis', 'writing-assistance', 'interpretation', 'critical-thinking'],
        isActive: true
      }
    ];
    setAssistants(sampleAssistants);
    setSelectedAssistant(sampleAssistants[0]);
  }, []);

  // Sample conversations
  useEffect(() => {
    const sampleConversations: Conversation[] = [
      {
        id: '1',
        messages: [
          {
            id: '1',
            role: 'user',
            content: "I'm having trouble understanding derivatives in calculus. Can you help me?",
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            id: '2',
            role: 'assistant',
            content: "I'd be happy to help you understand derivatives! Let's start with the basics. A derivative represents the rate of change of a function at any given point. Think of it as the slope of the tangent line to the curve at a specific point. Would you like me to explain the concept of limits first, or would you prefer to dive straight into the power rule?",
            timestamp: new Date(Date.now() - 3500000)
          },
          {
            id: '3',
            role: 'user',
            content: "Let's start with the power rule. I've heard of it but don't quite understand how it works.",
            timestamp: new Date(Date.now() - 3400000)
          },
          {
            id: '4',
            role: 'assistant',
            content: "Great choice! The power rule is one of the most fundamental rules in differentiation. Here's how it works: If you have a function f(x) = x^n, where n is any real number, then the derivative f'(x) = n * x^(n-1). For example, if f(x) = x^3, then f'(x) = 3x^2. Let me walk you through some examples to make this clearer.",
            timestamp: new Date(Date.now() - 3300000)
          }
        ],
        topicsCovered: ['derivatives', 'power rule', 'calculus'],
        satisfaction: 5,
        createdAt: new Date(Date.now() - 3600000)
      }
    ];
    setConversations(sampleConversations);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAssistant || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    // Create or update conversation
    let updatedConversation: Conversation;
    if (!currentConversation) {
      updatedConversation = {
        id: Date.now().toString(),
        messages: [userMessage],
        topicsCovered: [],
        createdAt: new Date()
      };
    } else {
      updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage]
      };
    }

    setCurrentConversation(updatedConversation);
    setNewMessage('');
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call the backend)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(newMessage, selectedAssistant),
        timestamp: new Date()
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiResponse]
      };

      setCurrentConversation(finalConversation);
      setIsLoading(false);

      // Update conversations list
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === finalConversation.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = finalConversation;
          return updated;
        }
        return [finalConversation, ...prev];
      });
    }, 1500);
  };

  const generateAIResponse = (message: string, assistant: AITutorAssistant): string => {
    // Simple response generation based on subject and message content
    const lowerMessage = message.toLowerCase();
    
    if (assistant.subject === 'Mathematics') {
      if (lowerMessage.includes('derivative') || lowerMessage.includes('calculus')) {
        return "I'd be happy to help you with calculus! Derivatives are fundamental to understanding how functions change. Let me break this down into simple steps and provide you with some examples to work through.";
      } else if (lowerMessage.includes('algebra')) {
        return "Algebra is the foundation of higher mathematics! Let me help you understand the concepts and work through some problems together. We can start with basic equations and build up to more complex topics.";
      }
    } else if (assistant.subject === 'Physics') {
      if (lowerMessage.includes('force') || lowerMessage.includes('motion')) {
        return "Physics is fascinating! Let's explore the concepts of force and motion using Newton's laws. I can explain the theory and help you solve practical problems.";
      } else if (lowerMessage.includes('energy')) {
        return "Energy is a fundamental concept in physics! I can help you understand different types of energy, energy conservation, and how to solve energy-related problems.";
      }
    } else if (assistant.subject === 'Chemistry') {
      if (lowerMessage.includes('reaction') || lowerMessage.includes('molecule')) {
        return "Chemistry is all about understanding how substances interact! Let me help you understand chemical reactions, molecular structures, and reaction mechanisms.";
      } else if (lowerMessage.includes('periodic') || lowerMessage.includes('element')) {
        return "The periodic table is the foundation of chemistry! I can help you understand periodic trends, element properties, and how to predict chemical behavior.";
      }
    } else if (assistant.subject === 'English Literature') {
      if (lowerMessage.includes('poem') || lowerMessage.includes('poetry')) {
        return "Poetry is a beautiful form of literary expression! I can help you analyze poetic devices, themes, and structure to deepen your understanding and appreciation.";
      } else if (lowerMessage.includes('essay') || lowerMessage.includes('writing')) {
        return "Writing is a crucial skill! I can help you with essay structure, thesis development, argumentation, and polishing your writing to make it more effective.";
      }
    }

    return `I'm your ${assistant.subject} AI tutor assistant! I'm here to help you learn and understand ${assistant.expertise.join(', ')}. What specific topic would you like to explore today?`;
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setNewMessage('');
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setActiveTab('chat');
  };

  const handleRateConversation = (rating: number) => {
    if (currentConversation) {
      const updatedConversation = { ...currentConversation, satisfaction: rating };
      setCurrentConversation(updatedConversation);
      
      setConversations(prev => 
        prev.map(c => c.id === currentConversation.id ? updatedConversation : c)
      );

      toast({
        title: "Thank you for your feedback!",
        description: "Your rating helps us improve our AI tutors.",
      });
    }
  };

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'encouraging': return 'bg-green-100 text-green-700';
      case 'strict': return 'bg-red-100 text-red-700';
      case 'friendly': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Tutor Assistant</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized 24/7 tutoring support from our AI-powered teaching assistants. 
            Specialized in various subjects with adaptive learning approaches.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">24/7 Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Always-available AI teaching assistants for instant help
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Subject Specialization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                AI assistants specialized in different academic subjects
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Personalized Teaching</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Customizable AI personality and teaching approach
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">Context Awareness</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Understands learning history and current session context
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* AI Assistants Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI Tutors
                </CardTitle>
                <CardDescription>
                  Choose your specialized AI tutor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assistants.map((assistant) => (
                  <div
                    key={assistant.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAssistant?.id === assistant.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAssistant(assistant)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{assistant.subject}</h4>
                      <Badge className={`text-xs ${getPersonalityColor(assistant.personality)}`}>
                        {assistant.personality}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {assistant.expertise.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {assistant.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{assistant.expertise.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Recent Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                        onClick={() => loadConversation(conversation)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            {conversation.messages[0]?.content.substring(0, 30)}...
                          </span>
                          {conversation.satisfaction && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{conversation.messages.length} messages</span>
                          <span>{conversation.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAssistant && (
                      <>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{selectedAssistant.subject} AI Tutor</CardTitle>
                          <CardDescription>
                            {selectedAssistant.personality} • {selectedAssistant.expertise[0]}
                          </CardDescription>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startNewConversation}
                    >
                      New Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 m-4">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="info">Tutor Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 px-4 pb-4">
                      <div className="space-y-4">
                        {currentConversation?.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-purple-600" />
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                message.role === 'user'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {message.role === 'user' && (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask your AI tutor a question..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={isLoading}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isLoading}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Rating */}
                      {currentConversation && currentConversation.messages.length > 2 && !currentConversation.satisfaction && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <span className="text-sm text-gray-600">Rate this conversation:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRateConversation(1)}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRateConversation(5)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="flex-1 p-4">
                    {selectedAssistant && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Subject Expertise</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedAssistant.expertise.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Teaching Style</h3>
                          <Badge className={getPersonalityColor(selectedAssistant.personality)}>
                            {selectedAssistant.personality}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-2">
                            {selectedAssistant.personality === 'encouraging' && 'Provides positive reinforcement and builds confidence through supportive guidance.'}
                            {selectedAssistant.personality === 'strict' && 'Maintains high standards and provides direct, no-nonsense instruction.'}
                            {selectedAssistant.personality === 'friendly' && 'Creates a relaxed learning environment with approachable, conversational teaching.'}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Capabilities</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedAssistant.capabilities.map((capability) => (
                              <div key={capability} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {capability.replace('-', ' ')}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Features</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>Available 24/7 for instant help</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-green-500" />
                              <span>Natural language conversations</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-purple-500" />
                              <span>Context-aware learning support</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                              <span>Adaptive to your learning pace</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}