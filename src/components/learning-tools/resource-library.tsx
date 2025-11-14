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
import { Plus, Search, Filter, Download, Eye, Star, FileText, Video, Image, Music, Link, BookOpen } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  subject?: string;
  grade?: string;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  downloadCount: number;
  viewCount: number;
  isPublic: boolean;
  isFeatured: boolean;
  tags: string[];
  tutorName: string;
  createdAt: string;
}

interface ResourceFormData {
  title: string;
  description: string;
  type: string;
  category: string;
  subject?: string;
  grade?: string;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
}

export default function ResourceLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "tutor">("tutor");

  const [formData, setFormData] = useState<ResourceFormData>({
    title: "",
    description: "",
    type: "DOCUMENT",
    category: "STUDY_GUIDE",
    subject: "",
    grade: "",
    fileUrl: "",
    externalUrl: "",
    tags: [],
    isPublic: false,
    isFeatured: false,
  });

  const resourceTypes = [
    { value: "DOCUMENT", label: "Document", icon: FileText },
    { value: "VIDEO", label: "Video", icon: Video },
    { value: "AUDIO", label: "Audio", icon: Music },
    { value: "IMAGE", label: "Image", icon: Image },
    { value: "INTERACTIVE", label: "Interactive", icon: Star },
    { value: "LINK", label: "Link", icon: Link },
    { value: "COURSE", label: "Course", icon: BookOpen },
    { value: "BOOK", label: "Book", icon: BookOpen },
  ];

  const resourceCategories = [
    { value: "STUDY_GUIDE", label: "Study Guide" },
    { value: "TUTORIAL", label: "Tutorial" },
    { value: "PRACTICE", label: "Practice" },
    { value: "REFERENCE", label: "Reference" },
    { value: "EXAMPLE", label: "Example" },
    { value: "TEMPLATE", label: "Template" },
    { value: "TOOL", label: "Tool" },
  ];

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Languages"
  ];

  const grades = [
    "K-1", "2-3", "4-5", "6-8", "9-10", "11-12", "College", "Adult"
  ];

  useEffect(() => {
    fetchResources();
    // In a real app, you would get the user role from authentication
    setUserRole("tutor");
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchResources();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving resource:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "DOCUMENT",
      category: "STUDY_GUIDE",
      subject: "",
      grade: "",
      fileUrl: "",
      externalUrl: "",
      tags: [],
      isPublic: false,
      isFeatured: false,
    });
  };

  const handleDownload = async (resource: Resource) => {
    if (resource.fileUrl) {
      // In a real app, you would increment download count on the server
      window.open(resource.fileUrl, "_blank");
    }
  };

  const handleView = async (resource: Resource) => {
    if (resource.externalUrl) {
      // In a real app, you would increment view count on the server
      window.open(resource.externalUrl, "_blank");
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = !selectedType || resource.type === selectedType;
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesSubject = !selectedSubject || resource.subject === selectedSubject;
    
    return matchesSearch && matchesType && matchesCategory && matchesSubject;
  });

  const getTypeIcon = (type: string) => {
    const rt = resourceTypes.find(rt => rt.value === type);
    return rt ? rt.icon : FileText;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
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
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Resource Library</h1>
          <p className="text-gray-600">
            {userRole === "tutor" ? "Share educational resources with your students" : "Access learning materials shared by your tutors"}
          </p>
        </div>
        {userRole === "tutor" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Resource</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription>Share an educational resource with students</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter resource title"
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
                        {resourceTypes.map((type) => (
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
                    placeholder="Enter resource description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL (for uploads)</Label>
                  <Input
                    id="fileUrl"
                    placeholder="https://example.com/file.pdf"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External URL (for links)</Label>
                  <Input
                    id="externalUrl"
                    placeholder="https://example.com/resource"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="math, algebra, geometry"
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
                  <Button type="submit">Add Resource</Button>
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
                placeholder="Search resources..."
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
                {resourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {resourceCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
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
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No resources found</p>
            {userRole === "tutor" && (
              <Button onClick={() => setIsDialogOpen(true)}>Add Your First Resource</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-sm line-clamp-2">{resource.title}</CardTitle>
                    </div>
                    {resource.isFeatured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                    {resource.subject && (
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                    )}
                    {resource.grade && (
                      <Badge variant="outline" className="text-xs">
                        {resource.grade}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {resource.tutorName}</span>
                    <span>{formatDate(resource.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{resource.viewCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{resource.downloadCount}</span>
                      </span>
                    </div>
                    {resource.fileSize && (
                      <span>{formatFileSize(resource.fileSize)}</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {resource.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(resource)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                    {resource.externalUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(resource)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}