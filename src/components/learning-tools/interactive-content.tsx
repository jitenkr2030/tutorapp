"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, Play, Star, Clock, Users, CheckCircle, BookOpen, GamepadIcon, FlaskConical, Monitor } from "lucide-react";

interface InteractiveContent {
  id: string;
  title: string;
  description: string;
  type: string;
  subject?: string;
  grade?: string;
  contentUrl: string;
  thumbnailUrl?: string;
  embedCode?: string;
  configuration?: string;
  difficulty?: string;
  estimatedTime?: number;
  status: string;
  isPublic: boolean;
  tags: string[];
  viewCount: number;
  completionCount: number;
  tutorName: string;
  createdAt: string;
  userProgress?: {
    progress: number;
    score?: number;
    timeSpent?: number;
    completed: boolean;
    lastAccessedAt: string;
  };
}

interface ContentFormData {
  title: string;
  description: string;
  type: string;
  subject?: string;
  grade?: string;
  contentUrl: string;
  thumbnailUrl?: string;
  embedCode?: string;
  configuration?: string;
  difficulty?: string;
  estimatedTime?: number;
  tags: string[];
  isPublic: boolean;
}

export default function InteractiveContent() {
  const [content, setContent] = useState<InteractiveContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "tutor">("tutor");

  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    type: "SIMULATION",
    subject: "",
    grade: "",
    contentUrl: "",
    thumbnailUrl: "",
    embedCode: "",
    configuration: "",
    difficulty: "beginner",
    estimatedTime: undefined,
    tags: [],
    isPublic: false,
  });

  const contentTypes = [
    { value: "SIMULATION", label: "Simulation", icon: FlaskConical },
    { value: "GAME", label: "Game", icon: GamepadIcon },
    { value: "QUIZ", label: "Interactive Quiz", icon: BookOpen },
    { value: "EXERCISE", label: "Exercise", icon: Monitor },
    { value: "DEMONSTRATION", label: "Demonstration", icon: Monitor },
    { value: "LAB", label: "Virtual Lab", icon: FlaskConical },
    { value: "VIRTUAL_TOUR", label: "Virtual Tour", icon: Monitor },
  ];

  const difficulties = [
    { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
    { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
    { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
  ];

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Languages"
  ];

  const grades = [
    "K-1", "2-3", "4-5", "6-8", "9-10", "11-12", "College", "Adult"
  ];

  useEffect(() => {
    fetchContent();
    // In a real app, you would get the user role from authentication
    setUserRole("tutor");
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/interactive-content");
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error("Error fetching interactive content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/interactive-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchContent();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "SIMULATION",
      subject: "",
      grade: "",
      contentUrl: "",
      thumbnailUrl: "",
      embedCode: "",
      configuration: "",
      difficulty: "beginner",
      estimatedTime: undefined,
      tags: [],
      isPublic: false,
    });
  };

  const handleLaunch = async (contentItem: InteractiveContent) => {
    // In a real app, you would track user progress and launch the content
    if (contentItem.contentUrl) {
      window.open(contentItem.contentUrl, "_blank");
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = !selectedType || item.type === selectedType;
    const matchesSubject = !selectedSubject || item.subject === selectedSubject;
    const matchesDifficulty = !selectedDifficulty || item.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesSubject && matchesDifficulty;
  });

  const getTypeIcon = (type: string) => {
    const ct = contentTypes.find(ct => ct.value === type);
    return ct ? ct.icon : Monitor;
  };

  const getDifficultyBadge = (difficulty?: string) => {
    if (!difficulty) return null;
    const d = difficulties.find(diff => diff.value === difficulty);
    return d ? (
      <Badge className={d.color}>
        {d.label}
      </Badge>
    ) : null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interactive Content</h1>
          <p className="text-gray-600">
            {userRole === "tutor" ? "Create and share interactive learning experiences" : "Engage with interactive learning materials"}
          </p>
        </div>
        {userRole === "tutor" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Content</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Interactive Content</DialogTitle>
                <DialogDescription>Design an engaging interactive learning experience</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter content title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the interactive content"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade Level</Label>
                    <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty.value} value={difficulty.value}>
                            {difficulty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentUrl">Content URL</Label>
                  <Input
                    id="contentUrl"
                    placeholder="https://example.com/interactive-content"
                    value={formData.contentUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentUrl: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                    <Input
                      id="thumbnailUrl"
                      placeholder="https://example.com/thumbnail.jpg"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="1"
                      placeholder="30"
                      value={formData.estimatedTime || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        estimatedTime: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="embedCode">Embed Code (Optional)</Label>
                  <Textarea
                    id="embedCode"
                    placeholder="HTML embed code for the content"
                    value={formData.embedCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, embedCode: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="interactive, simulation, science"
                    value={formData.tags.join(", ")}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Content</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GamepadIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No interactive content found</p>
            {userRole === "tutor" && (
              <Button onClick={() => setIsDialogOpen(true)}>Create Your First Content</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {item.thumbnailUrl && (
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getDifficultyBadge(item.difficulty)}
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    </div>
                    {item.isPublic && (
                      <Badge variant="outline" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {item.type.replace("_", " ")}
                    </Badge>
                    {item.subject && (
                      <Badge variant="outline" className="text-xs">
                        {item.subject}
                      </Badge>
                    )}
                    {item.grade && (
                      <Badge variant="outline" className="text-xs">
                        {item.grade}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* User Progress */}
                  {item.userProgress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Your Progress</span>
                        <span>{Math.round(item.userProgress.progress)}%</span>
                      </div>
                      <Progress value={item.userProgress.progress} className="h-2" />
                      {item.userProgress.score && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Score: {Math.round(item.userProgress.score)}%</span>
                          {item.userProgress.timeSpent && (
                            <span>Time: {item.userProgress.timeSpent}m</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {item.tutorName}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{item.viewCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{item.completionCount}</span>
                      </span>
                    </div>
                    {item.estimatedTime && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.estimatedTime}m</span>
                      </span>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleLaunch(item)} 
                    className="w-full"
                    disabled={!item.contentUrl}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {item.userProgress?.completed ? "Review" : "Launch"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}