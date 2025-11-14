"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, GraduationCap, Users, Award, TrendingUp, MessageSquare, 
  CheckCircle, PlayCircle, ArrowRight, Brain, BookOpen, Target
} from "lucide-react";

export default function TestimonialsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", name: "All Testimonials" },
    { id: "students", name: "Students" },
    { id: "parents", name: "Parents" },
    { id: "tutors", name: "Tutors" },
    { id: "ai-users", name: "AI Tutor Users" }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Alex Chen",
      role: "University Student",
      type: "students",
      subject: "Mathematics",
      rating: 5,
      content: "The AI Tutor Assistant helped me understand complex calculus concepts at 2 AM when I was stuck on my assignment. It's like having a personal tutor available 24/7! My grades improved from C to A+ in just one semester.",
      avatar: "/placeholder-avatar.svg",
      results: ["Grade improvement: C to A+", "24/7 availability", "Personalized learning"],
      featured: true
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "High School Student",
      type: "students",
      subject: "Physics",
      rating: 5,
      content: "I love how I can choose different teaching styles. The encouraging AI tutor helped me build confidence in physics, and my grades improved significantly! The interactive explanations make complex topics easy to understand.",
      avatar: "/placeholder-avatar.svg",
      results: ["Increased confidence", "Better understanding", "Improved grades"],
      featured: true
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      role: "Parent",
      type: "parents",
      subject: "Multiple Subjects",
      rating: 5,
      content: "As a parent, I'm impressed by the quality of AI tutoring. My daughter gets instant help with chemistry homework, and the conversation history helps track her progress. The human tutors are also excellent when she needs more personalized attention.",
      avatar: "/placeholder-avatar.svg",
      results: ["Convenient 24/7 help", "Progress tracking", "Quality human tutors"],
      featured: true
    },
    {
      id: 4,
      name: "Dr. Emily Johnson",
      role: "Professional Tutor",
      type: "tutors",
      subject: "Mathematics",
      rating: 5,
      content: "TutorConnect has transformed my tutoring business. The AI assistant helps me prepare materials and handle basic questions, allowing me to focus on complex problem-solving with my students. My student base has grown by 300%!",
      avatar: "/placeholder-avatar.svg",
      results: ["300% student growth", "Better preparation", "Increased efficiency"],
      featured: false
    },
    {
      id: 5,
      name: "James Thompson",
      role: "College Student",
      type: "ai-users",
      subject: "Computer Science",
      rating: 5,
      content: "The AI CS tutor is incredible! It helps me debug code, explain algorithms, and prepare for technical interviews. I've landed my dream internship thanks to the coding practice and interview prep I got here.",
      avatar: "/placeholder-avatar.svg",
      results: ["Dream internship secured", "Improved coding skills", "Interview success"],
      featured: true
    },
    {
      id: 6,
      name: "Lisa Park",
      role: "Parent",
      type: "parents",
      subject: "English Literature",
      rating: 4,
      content: "My son struggled with essay writing until we found TutorConnect. The AI tutor helps him structure his essays, and the human tutor provides detailed feedback. His writing has improved dramatically, and he's much more confident now.",
      avatar: "/placeholder-avatar.svg",
      results: ["Better essay writing", "Increased confidence", "Improved grades"],
      featured: false
    },
    {
      id: 7,
      name: "Prof. David Kim",
      role: "University Professor",
      type: "tutors",
      subject: "Physics",
      rating: 5,
      content: "I've been tutoring for 15 years, and TutorConnect's platform is by far the best I've used. The video quality is excellent, the scheduling system is seamless, and the AI tools help me provide better value to my students.",
      avatar: "/placeholder-avatar.svg",
      results: ["Better platform", "Improved efficiency", "Higher student satisfaction"],
      featured: false
    },
    {
      id: 8,
      name: "Maria Garcia",
      role: "High School Student",
      type: "students",
      subject: "Chemistry",
      rating: 5,
      content: "Chemistry was my worst subject until I started using the AI tutor. It explains reactions in a way that makes sense, and the practice problems really helped me prepare for exams. I went from failing to getting a B+!",
      avatar: "/placeholder-avatar.svg",
      results: ["Grade improvement: F to B+", "Better understanding", "Exam success"],
      featured: true
    }
  ];

  const filteredTestimonials = activeFilter === "all" 
    ? testimonials 
    : testimonials.filter(testimonial => testimonial.type === activeFilter);

  const stats = [
    { label: "Student Satisfaction", value: "98%", icon: Star },
    { label: "Grade Improvement", value: "85%", icon: TrendingUp },
    { label: "Active Tutors", value: "10,000+", icon: Users },
    { label: "Sessions Completed", value: "1M+", icon: GraduationCap }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Success Stories</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Real Stories, Real
              <span className="text-yellow-300"> Results</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Hear from students, parents, and tutors who have transformed their learning experience with TutorConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Success Stories
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <ArrowRight className="mr-2 h-5 w-5" />
                Join Our Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.id)}
                className="min-w-[120px]"
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className={`hover:shadow-xl transition-all ${testimonial.featured ? 'border-blue-500 border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                        {testimonial.featured && (
                          <Badge className="bg-blue-600">FEATURED</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-xs text-gray-500">({testimonial.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4 leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900">Key Results:</h4>
                    <ul className="space-y-1">
                      {testimonial.results.map((result, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant="outline" className="text-xs">
                      {testimonial.subject}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Video Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch real students and parents share their TutorConnect experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative aspect-video bg-gray-200 flex items-center justify-center cursor-pointer group">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <PlayCircle className="h-16 w-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold">Success Story {item}</h3>
                    <p className="text-sm opacity-90">3:45</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Student Success Story {item}</h3>
                  <p className="text-sm text-gray-600">
                    Hear how this student transformed their learning experience and achieved academic success.
                  </p>
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
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of students who are already achieving their learning goals with TutorConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
              <Brain className="mr-2 h-5 w-5" />
              Try AI Tutor Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              <ArrowRight className="mr-2 h-5 w-5" />
              Find a Human Tutor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}