'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  HelpCircle,
  BookOpen,
  Calendar,
  CreditCard,
  Settings
} from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  intent: string;
  confidence: number;
  timestamp: string;
  suggestedActions?: Array<{
    type: 'button' | 'link' | 'form';
    label: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  followUpQuestions?: string[];
}

interface ChatbotProps {
  userId?: string;
  sessionId?: string;
  context?: any;
  onAction?: (action: string) => void;
}

export default function Chatbot({ userId, sessionId, context, onAction }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      params.append('limit', '20');

      const response = await fetch(`/api/ai/chatbot?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.chats.reverse().map((chat: any) => ({
          id: chat.id,
          message: chat.message,
          response: chat.response,
          intent: chat.intent,
          confidence: chat.confidence,
          timestamp: chat.createdAt
        })));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message immediately for better UX
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      message: userMessage,
      response: '',
      intent: '',
      confidence: 0,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Replace temporary message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                id: data.chatId,
                message: userMessage,
                response: data.response,
                intent: data.intent,
                confidence: data.confidence,
                timestamp: data.timestamp,
                suggestedActions: data.suggestedActions,
                followUpQuestions: data.followUpQuestions
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...tempMessage,
                response: "I'm sorry, I'm having trouble responding right now. Please try again later.",
                intent: 'technical',
                confidence: 0.1,
                timestamp: new Date().toISOString()
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'scheduling': return <Clock className="w-4 h-4" />;
      case 'support': return <HelpCircle className="w-4 h-4" />;
      case 'information': return <BookOpen className="w-4 h-4" />;
      case 'billing': return <CreditCard className="w-4 h-4" />;
      case 'technical': return <Settings className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'booking': return 'text-blue-600 bg-blue-50';
      case 'scheduling': return 'text-green-600 bg-green-50';
      case 'support': return 'text-purple-600 bg-purple-50';
      case 'information': return 'text-gray-600 bg-gray-50';
      case 'billing': return 'text-yellow-600 bg-yellow-50';
      case 'technical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          AI Assistant
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
        <CardDescription>
          I'm here to help you with bookings, scheduling, and any questions about our platform
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to AI Assistant
                </h3>
                <p className="text-gray-500 text-sm">
                  How can I help you today? You can ask me about booking tutors, scheduling sessions, or any other questions.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* User Message */}
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                      <div className="flex items-center gap-2 mb-2">
                        {getIntentIcon(message.intent)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getIntentColor(message.intent)}`}
                        >
                          {message.intent}
                        </Badge>
                        {message.confidence < 0.7 && (
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-800">{message.response}</p>
                    </div>

                    {/* Suggested Actions */}
                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => onAction?.(action.action)}
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          You might also want to know:
                        </p>
                        <div className="space-y-1">
                          {message.followUpQuestions.map((question, index) => (
                            <button
                              key={index}
                              onClick={() => setInputMessage(question)}
                              className="text-xs text-purple-600 hover:text-purple-700 hover:underline text-left block"
                            >
                              • {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl rounded-tr-none px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setInputMessage("How do I book a tutor?")}
              className="text-xs"
            >
              Book a tutor
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setInputMessage("What subjects are available?")}
              className="text-xs"
            >
              Available subjects
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setInputMessage("How does scheduling work?")}
              className="text-xs"
            >
              Scheduling help
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setInputMessage("What are your pricing plans?")}
              className="text-xs"
            >
              Pricing info
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}