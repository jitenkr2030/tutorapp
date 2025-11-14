"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Search, HelpCircle, Users, Settings, CreditCard, Shield, 
  Video, MessageSquare, Brain, ArrowRight, Star, TrendingUp, Clock,
  FileText, Download, ExternalLink, CheckCircle, AlertCircle
} from "lucide-react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Articles", icon: BookOpen },
    { id: "getting-started", name: "Getting Started", icon: Users },
    { id: "ai-tutor", name: "AI Tutor", icon: Brain },
    { id: "billing", name: "Billing & Payments", icon: CreditCard },
    { id: "technical", name: "Technical", icon: Settings },
    { id: "safety", name: "Safety & Security", icon: Shield }
  ];

  const helpArticles = [
    {
      id: 1,
      title: "How to Create Your Account",
      category: "getting-started",
      difficulty: "Beginner",
      readTime: "3 min",
      views: 15420,
      helpful: 98,
      content: "Learn how to sign up for TutorConnect and set up your profile in just a few simple steps.",
      tags: ["account", "signup", "profile"]
    },
    {
      id: 2,
      title: "Finding the Right Tutor",
      category: "getting-started",
      difficulty: "Beginner",
      readTime: "5 min",
      views: 12350,
      helpful: 95,
      content: "Discover how to use our smart matching system and filters to find your perfect tutor.",
      tags: ["tutor", "matching", "search"]
    },
    {
      id: 3,
      title: "Getting Started with AI Tutor",
      category: "ai-tutor",
      difficulty: "Beginner",
      readTime: "7 min",
      views: 18900,
      helpful: 97,
      content: "Complete guide to using our AI Tutor Assistant for 24/7 learning support.",
      tags: ["ai", "tutor", "assistant"]
    },
    {
      id: 4,
      title: "Choosing AI Tutor Personalities",
      category: "ai-tutor",
      difficulty: "Intermediate",
      readTime: "4 min",
      views: 8750,
      helpful: 92,
      content: "Learn about different AI teaching styles and how to choose the right one for you.",
      tags: ["ai", "personality", "teaching-style"]
    },
    {
      id: 5,
      title: "Understanding Pricing Plans",
      category: "billing",
      difficulty: "Beginner",
      readTime: "6 min",
      views: 22100,
      helpful: 94,
      content: "Detailed explanation of our pricing options and how to choose the best plan for your needs.",
      tags: ["pricing", "plans", "subscription"]
    },
    {
      id: 6,
      title: "Payment Methods and Security",
      category: "billing",
      difficulty: "Beginner",
      readTime: "4 min",
      views: 16800,
      helpful: 96,
      content: "Information about accepted payment methods and how we keep your financial data secure.",
      tags: ["payment", "security", "billing"]
    },
    {
      id: 7,
      title: "Video Call Troubleshooting",
      category: "technical",
      difficulty: "Intermediate",
      readTime: "8 min",
      views: 9450,
      helpful: 89,
      content: "Common video call issues and how to resolve them quickly.",
      tags: ["video", "troubleshooting", "technical"]
    },
    {
      id: 8,
      title: "Mobile App Guide",
      category: "technical",
      difficulty: "Beginner",
      readTime: "5 min",
      views: 13200,
      helpful: 91,
      content: "How to use TutorConnect on your mobile device for learning on the go.",
      tags: ["mobile", "app", "guide"]
    },
    {
      id: 9,
      title: "Tutor Verification Process",
      category: "safety",
      difficulty: "Beginner",
      readTime: "6 min",
      views: 11500,
      helpful: 93,
      content: "How we verify tutors and ensure the safety and quality of our platform.",
      tags: ["verification", "safety", "tutors"]
    },
    {
      id: 10,
      title: "Privacy and Data Protection",
      category: "safety",
      difficulty: "Intermediate",
      readTime: "7 min",
      views: 14200,
      helpful: 90,
      content: "Understanding how we protect your personal information and ensure your privacy.",
      tags: ["privacy", "data", "protection"]
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTopics = [
    { name: "AI Tutor Setup", count: 15420 },
    { name: "Payment Issues", count: 12350 },
    { name: "Video Call Problems", count: 9450 },
    { name: "Account Management", count: 8750 },
    { name: "Mobile App Usage", count: 7650 }
  ];

  const quickGuides = [
    {
      title: "First Session Checklist",
      description: "Everything you need for your first tutoring session",
      icon: CheckCircle,
      time: "2 min"
    },
    {
      title: "AI Tutor Quick Start",
      description: "Get started with AI tutoring in under 5 minutes",
      icon: Brain,
      time: "3 min"
    },
    {
      title: "Payment Setup Guide",
      description: "Set up your payment method and billing preferences",
      icon: CreditCard,
      time: "4 min"
    },
    {
      title: "Profile Optimization",
      description: "Make your profile stand out to attract the best tutors",
      icon: Users,
      time: "3 min"
    }
  ];

  const videoTutorials = [
    {
      title: "Platform Overview",
      duration: "5:32",
      views: "45.2K",
      thumbnail: "/placeholder-avatar.svg"
    },
    {
      title: "AI Tutor Demo",
      duration: "8:15",
      views: "38.7K",
      thumbnail: "/placeholder-avatar.svg"
    },
    {
      title: "Booking a Session",
      duration: "4:23",
      views: "29.1K",
      thumbnail: "/placeholder-avatar.svg"
    },
    {
      title: "Using the Whiteboard",
      duration: "6:45",
      views: "22.8K",
      thumbnail: "/placeholder-avatar.svg"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-700";
      case "Intermediate": return "bg-yellow-100 text-yellow-700";
      case "Advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Help Center</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              How Can We
              <span className="text-yellow-300"> Help</span> You?
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Find answers, get guidance, and learn how to make the most of TutorConnect's features.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles, guides, and tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Guides */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Start Guides
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get up and running quickly with our step-by-step guides
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickGuides.map((guide, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <guide.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {guide.time} read
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                        activeCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Popular Topics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {popularTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        {topic.name}
                      </a>
                      <span className="text-xs text-gray-500">{topic.count.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeCategory === "all" ? "All Help Articles" : categories.find(c => c.id === activeCategory)?.name}
                  </h2>
                  <p className="text-gray-600">
                    {filteredArticles.length} articles found
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                              {article.title}
                            </h3>
                            <Badge className={`text-xs ${getDifficultyColor(article.difficulty)}`}>
                              {article.difficulty}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{article.content}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{article.readTime} read</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>{article.views.toLocaleString()} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4" />
                              <span>{article.helpful}% helpful</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {article.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Read
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search or browse different categories
                    </p>
                    <Button onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Video Tutorials
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch step-by-step video guides to master TutorConnect features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <Video className="h-12 w-12 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-sm">{video.title}</h3>
                    <p className="text-xs opacity-90">{video.duration}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{video.views} views</span>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Still Need Help?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              <ArrowRight className="mr-2 h-5 w-5" />
              Browse All Articles
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}