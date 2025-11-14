'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Link, 
  Unlink, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  BookOpen,
  Target,
  Users,
  BarChart3,
  Zap,
  Globe,
  Database,
  Video,
  FileText,
  MessageSquare,
  Settings,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformIntegration {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'assessment' | 'collaboration' | 'analytics' | 'tools';
  authType: 'oauth' | 'api-key' | 'webhook' | 'sso';
  features: string[];
  status: 'active' | 'beta' | 'deprecated';
  isConnected: boolean;
  lastSync?: Date;
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'exercise' | 'quiz' | 'interactive';
  subject: string;
  difficulty: number;
  duration?: number;
  url: string;
  platform: string;
  thumbnail?: string;
}

export default function IntegrationHub() {
  const [platforms, setPlatforms] = useState<PlatformIntegration[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformIntegration | null>(null);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from API
      const mockPlatforms: PlatformIntegration[] = [
        {
          id: 'khan-academy',
          name: 'Khan Academy',
          description: 'Free educational content and exercises',
          category: 'content',
          authType: 'oauth',
          features: ['Videos', 'Exercises', 'Progress Tracking'],
          status: 'active',
          isConnected: true,
          lastSync: new Date('2024-01-15T10:30:00')
        },
        {
          id: 'coursera',
          name: 'Coursera',
          description: 'Online courses and specializations',
          category: 'content',
          authType: 'oauth',
          features: ['Courses', 'Certificates', 'Assignments'],
          status: 'active',
          isConnected: false
        },
        {
          id: 'duolingo',
          name: 'Duolingo',
          description: 'Language learning platform',
          category: 'assessment',
          authType: 'oauth',
          features: ['Language Lessons', 'Progress Tracking'],
          status: 'active',
          isConnected: true,
          lastSync: new Date('2024-01-14T15:45:00')
        },
        {
          id: 'google-classroom',
          name: 'Google Classroom',
          description: 'Classroom management and assignment distribution',
          category: 'collaboration',
          authType: 'oauth',
          features: ['Assignments', 'Grading', 'Announcements'],
          status: 'active',
          isConnected: false
        },
        {
          id: 'zoom',
          name: 'Zoom',
          description: 'Video conferencing and virtual classrooms',
          category: 'collaboration',
          authType: 'api-key',
          features: ['Video Meetings', 'Recording', 'Breakout Rooms'],
          status: 'active',
          isConnected: true,
          lastSync: new Date('2024-01-15T09:15:00')
        },
        {
          id: 'youtube-education',
          name: 'YouTube Education',
          description: 'Educational video content',
          category: 'content',
          authType: 'api-key',
          features: ['Educational Videos', 'Playlists', 'Channels'],
          status: 'active',
          isConnected: true,
          lastSync: new Date('2024-01-15T11:20:00')
        }
      ];
      setPlatforms(mockPlatforms);
    } catch (error) {
      toast.error('Failed to load platforms');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform: PlatformIntegration) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      setLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, isConnected: false, lastSync: undefined } : p
      ));
      
      toast.success('Platform disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect platform');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (platformId: string) => {
    try {
      setSyncing(platformId);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPlatforms(prev => prev.map(p => 
        p.id === platformId ? { ...p, lastSync: new Date() } : p
      ));
      
      toast.success('Platform synced successfully');
    } catch (error) {
      toast.error('Failed to sync platform');
    } finally {
      setSyncing(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      // Mock search results
      const mockResults: ContentItem[] = [
        {
          id: '1',
          title: 'Introduction to Algebra',
          description: 'Learn the basics of algebraic thinking',
          type: 'video',
          subject: 'Mathematics',
          difficulty: 0.3,
          duration: 900,
          url: 'https://example.com/video1',
          platform: 'Khan Academy',
          thumbnail: 'https://example.com/thumb1.jpg'
        },
        {
          id: '2',
          title: 'Chemistry Basics Explained',
          description: 'Essential chemistry concepts for beginners',
          type: 'video',
          subject: 'Chemistry',
          difficulty: 0.4,
          duration: 600,
          url: 'https://example.com/video2',
          platform: 'YouTube Education',
          thumbnail: 'https://example.com/thumb2.jpg'
        },
        {
          id: '3',
          title: 'Spanish Language Basics',
          description: 'Start learning Spanish with interactive lessons',
          type: 'interactive',
          subject: 'Languages',
          difficulty: 0.2,
          duration: 1200,
          url: 'https://example.com/interactive1',
          platform: 'Duolingo'
        }
      ];
      setSearchResults(mockResults);
    } catch (error) {
      toast.error('Failed to search content');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <BookOpen className="h-5 w-5" />;
      case 'assessment':
        return <Target className="h-5 w-5" />;
      case 'collaboration':
        return <Users className="h-5 w-5" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'tools':
        return <Zap className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'interactive':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 0.3) return 'text-green-600';
    if (difficulty <= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPlatforms = platforms.filter(platform => {
    const matchesCategory = selectedCategory === 'all' || platform.category === selectedCategory;
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         platform.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedPlatforms = platforms.filter(p => p.isConnected);
  const availablePlatforms = platforms.filter(p => !p.isConnected);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect and manage third-party educational platforms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>{connectedPlatforms.length} Connected</span>
          </Badge>
          <Button onClick={loadPlatforms} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="search">Content Search</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search platforms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Connected Platforms */}
          {connectedPlatforms.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedPlatforms.map((platform) => (
                  <Card key={platform.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(platform.category)}
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                      </div>
                      <CardDescription>{platform.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {platform.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {platform.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{platform.features.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {platform.lastSync && (
                        <div className="text-xs text-muted-foreground">
                          Last synced: {platform.lastSync.toLocaleString()}
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleSync(platform.id)}
                          disabled={syncing === platform.id}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          {syncing === platform.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sync
                        </Button>
                        <Button
                          onClick={() => handleDisconnect(platform.id)}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Platforms */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlatforms.map((platform) => (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(platform.category)}
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        {platform.status === 'beta' ? 'Beta' : 'Available'}
                      </Badge>
                    </div>
                    <CardDescription>{platform.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {platform.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {platform.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{platform.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <Button
                      onClick={() => handleConnect(platform)}
                      disabled={loading}
                      className="w-full"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Educational Content</CardTitle>
              <CardDescription>
                Search across all connected educational platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search for lessons, videos, exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
                  <div className="space-y-3">
                    {searchResults.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline">{item.subject}</Badge>
                            <Badge variant="outline">{item.platform}</Badge>
                            <span className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                              Difficulty: {Math.round(item.difficulty * 100)}%
                            </span>
                            {item.duration && (
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(item.duration / 60)}m {item.duration % 60}s
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Open
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{connectedPlatforms.length}</p>
                    <p className="text-xs text-muted-foreground">Connected Platforms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-xs text-muted-foreground">Content Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">89</p>
                    <p className="text-xs text-muted-foreground">Assessments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">456</p>
                    <p className="text-xs text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Usage Analytics</CardTitle>
              <CardDescription>
                Overview of platform integration usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {connectedPlatforms.map((platform) => (
                  <div key={platform.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(platform.category)}
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <Badge variant="outline">
                        {platform.authType.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">API Calls</p>
                        <p className="font-semibold">1,234</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sync Status</p>
                        <p className="font-semibold text-green-600">Healthy</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data Synced</p>
                        <p className="font-semibold">2.3 GB</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Activity</p>
                        <p className="font-semibold">2h ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connect Platform Modal */}
      {showConnectModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connect to {selectedPlatform.name}</CardTitle>
              <CardDescription>
                Authorize access to your {selectedPlatform.name} account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will allow TutorConnect to access your {selectedPlatform.name} data 
                  including progress, content, and assessment results.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Authentication Method</Label>
                <Badge variant="outline">{selectedPlatform.authType.toUpperCase()}</Badge>
              </div>

              <div className="space-y-2">
                <Label>Features Available</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedPlatform.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    // Mock connection
                    setPlatforms(prev => prev.map(p => 
                      p.id === selectedPlatform.id ? { ...p, isConnected: true, lastSync: new Date() } : p
                    ));
                    setShowConnectModal(false);
                    toast.success('Platform connected successfully');
                  }}
                  className="flex-1"
                >
                  Connect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}