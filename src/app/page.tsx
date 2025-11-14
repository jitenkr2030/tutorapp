"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, MapPin, Star, Clock, BookOpen, Users, Award, Shield, Globe, CreditCard, 
  Video, Users2, FileText, Calendar, GraduationCap, Trophy, Zap, Target, Gift, 
  Headset, Smartphone, Mic, Languages, PenTool, Lightbulb, Brain, ArrowRight, 
  CheckCircle, PlayCircle, Sparkles, TrendingUp, UserCheck, MessageSquare, Upload,
  FileQuestion, BarChart3, Highlighter, Bookmark, Users as UsersIcon, Library
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Languages",
    "Economics", "Psychology", "Philosophy", "Art History"
  ];

  const featuredTutors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      subject: "Mathematics",
      rating: 4.9,
      reviews: 127,
      experience: 10,
      hourlyRate: 45,
      avatar: "/placeholder-avatar.svg",
      bio: "PhD in Mathematics with 10+ years of teaching experience. Specialized in Calculus and Algebra."
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      subject: "Physics",
      rating: 4.8,
      reviews: 89,
      experience: 8,
      hourlyRate: 50,
      avatar: "/placeholder-avatar.svg",
      bio: "University professor with expertise in Quantum Physics and Mechanics."
    },
    {
      id: 3,
      name: "Ms. Emily Rodriguez",
      subject: "English",
      rating: 4.7,
      reviews: 156,
      experience: 6,
      hourlyRate: 35,
      avatar: "/placeholder-avatar.svg",
      bio: "Certified English teacher specializing in literature and creative writing."
    }
  ];

  const aiTutorSubjects = [
    { name: "Mathematics", icon: "🔢", color: "bg-blue-500" },
    { name: "Physics", icon: "⚛️", color: "bg-purple-500" },
    { name: "Chemistry", icon: "🧪", color: "bg-green-500" },
    { name: "English Literature", icon: "📚", color: "bg-red-500" },
    { name: "Computer Science", icon: "💻", color: "bg-indigo-500" },
    { name: "Biology", icon: "🧬", color: "bg-emerald-500" },
    { name: "History", icon: "🏛️", color: "bg-amber-500" },
    { name: "Geography", icon: "🌍", color: "bg-cyan-500" },
    { name: "Economics", icon: "📈", color: "bg-orange-500" },
    { name: "Psychology", icon: "🧠", color: "bg-pink-500" },
    { name: "Philosophy", icon: "🤔", color: "bg-violet-500" },
    { name: "Art History", icon: "🎨", color: "bg-rose-500" }
  ];

  const stats = [
    { label: "AI Tutors Available", value: "24/7", icon: Clock },
    { label: "Subjects Covered", value: "12+", icon: BookOpen },
    { label: "Student Satisfaction", value: "98%", icon: Star },
    { label: "Response Time", value: "< 2s", icon: Zap },
    { label: "Books Processed", value: "10K+", icon: Library },
    { label: "AI Explanations", value: "50K+", icon: Brain }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI Tutor Assistant",
      description: "24/7 AI-powered tutoring support with personalized learning across multiple subjects.",
      highlight: true
    },
    {
      icon: Library,
      title: "AI Book Processing System",
      description: "Transform any book or study material into interactive learning content with AI-powered analysis and explanations.",
      highlight: true
    },
    {
      icon: Video,
      title: "Live Video Sessions",
      description: "HD video calls with interactive whiteboard for engaging online learning."
    },
    {
      icon: Shield,
      title: "Verified Tutors",
      description: "All tutors undergo background checks and qualification verification."
    },
    {
      icon: Star,
      title: "Ratings & Reviews",
      description: "Make informed decisions with genuine reviews from other students."
    },
    {
      icon: Globe,
      title: "Multi-Currency Support",
      description: "Pay in your local currency with real-time exchange rates and automatic conversion."
    },
    {
      icon: CreditCard,
      title: "Flexible Payment Plans",
      description: "Choose from single payments, subscriptions, or installment plans that fit your budget."
    },
    {
      icon: Users,
      title: "One-on-One Tutoring",
      description: "Personalized attention with tailored lesson plans for optimal learning outcomes."
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book sessions at your convenience with easy rescheduling and cancellation."
    },
    {
      icon: FileText,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed progress reports and analytics."
    }
  ];

  const pricingPlans = [
    {
      type: "student",
      title: "For Students",
      description: "Access expert tutors, AI assistance, and book processing to excel in your studies",
      plans: [
        {
          name: "Basic",
          price: "$9.99",
          period: "month",
          features: [
            "5 hours of human tutoring",
            "Unlimited AI tutor access",
            "5 books processed per month",
            "Basic progress tracking",
            "Email support",
            "1 subject focus"
          ],
          popular: false,
          cta: "Get Started"
        },
        {
          name: "Premium",
          price: "$29.99",
          period: "month",
          features: [
            "20 hours of human tutoring",
            "Unlimited AI tutor access",
            "25 books processed per month",
            "Advanced progress analytics",
            "Priority support",
            "Multiple subjects",
            "Session recordings",
            "Study materials",
            "AI-generated quizzes"
          ],
          popular: true,
          cta: "Most Popular"
        },
        {
          name: "Unlimited",
          price: "$79.99",
          period: "month",
          features: [
            "Unlimited human tutoring",
            "Unlimited AI tutor access",
            "Unlimited book processing",
            "Comprehensive analytics",
            "24/7 priority support",
            "All subjects",
            "Unlimited recordings",
            "Premium study materials",
            "Career counseling",
            "Advanced AI features"
          ],
          popular: false,
          cta: "Go Unlimited"
        }
      ]
    },
    {
      type: "tutor",
      title: "For Tutors",
      description: "Join our platform and reach students worldwide while growing your teaching business",
      plans: [
        {
          name: "Starter",
          price: "Free",
          period: "month",
          features: [
            "Basic profile creation",
            "Up to 5 students",
            "Standard commission (20%)",
            "Basic analytics",
            "Community support"
          ],
          popular: false,
          cta: "Join Free"
        },
        {
          name: "Professional",
          price: "$19.99",
          period: "month",
          features: [
            "Enhanced profile features",
            "Unlimited students",
            "Reduced commission (15%)",
            "Advanced analytics",
            "Priority support",
            "Marketing tools",
            "Custom scheduling"
          ],
          popular: true,
          cta: "Go Pro"
        },
        {
          name: "Enterprise",
          price: "$49.99",
          period: "month",
          features: [
            "Premium profile placement",
            "Unlimited students",
            "Lowest commission (10%)",
            "Comprehensive analytics",
            "Dedicated support",
            "Advanced marketing suite",
            "White-label options",
            "API access"
          ],
          popular: false,
          cta: "Contact Sales"
        }
      ]
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "University Student",
      content: "The AI Tutor Assistant helped me understand complex calculus concepts at 2 AM when I was stuck on my assignment. It's like having a personal tutor available 24/7!",
      rating: 5,
      avatar: "/placeholder-avatar.svg"
    },
    {
      name: "Sarah Williams",
      role: "High School Student",
      content: "I love how I can choose different teaching styles. The encouraging AI tutor helped me build confidence in physics, and my grades improved significantly!",
      rating: 5,
      avatar: "/placeholder-avatar.svg"
    },
    {
      name: "Michael Rodriguez",
      role: "Parent",
      content: "As a parent, I'm impressed by the quality of AI tutoring. My daughter gets instant help with chemistry homework, and the conversation history helps track her progress.",
      rating: 5,
      avatar: "/placeholder-avatar.svg"
    }
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedSubject) params.set("subject", selectedSubject);
    if (selectedLocation) params.set("location", selectedLocation);
    router.push(`/search?${params.toString()}`);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">New: AI Book Processing System</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Your Learning with
                <span className="text-yellow-300"> AI-Powered</span> Books & Tutoring
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Upload any book or study material and get instant AI-powered explanations, quizzes, and personalized learning paths. Plans starting from $9.99/month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300" onClick={() => window.location.href = '/book-processing'}>
                  <Library className="mr-2 h-5 w-5" />
                  Try Book Processing Free
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" onClick={() => window.location.href = '/ai-tutor'}>
                  <Brain className="mr-2 h-5 w-5" />
                  Try AI Tutor
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>Process any book format</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 rounded-full p-2">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 flex-1">
                      <p className="text-sm">Hi! I'm your AI Math Tutor. How can I help you today?</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-blue-600 rounded-lg p-3 flex-1">
                      <p className="text-sm">I'm struggling with calculus integration problems...</p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 rounded-full p-2">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 flex-1">
                      <p className="text-sm">I'd be happy to help! Let's break down integration step by step...</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {aiTutorSubjects.slice(0, 6).map((subject, index) => (
                      <div key={index} className={`w-8 h-8 ${subject.color} rounded-full flex items-center justify-center text-xs`}>
                        {subject.icon}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-300">
                    <MessageSquare className="inline h-3 w-3 mr-1" />
                    12+ Subjects Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
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

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of education with our comprehensive platform featuring AI-powered tutoring, expert human instructors, and advanced learning tools
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`text-center hover:shadow-xl transition-all ${feature.highlight ? 'border-blue-500 border-2' : ''}`}>
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${feature.highlight ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <feature.icon className={`h-8 w-8 ${feature.highlight ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                  {feature.highlight && (
                    <Badge className="mt-4 bg-blue-600">NEW</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Book Processing System Section */}
      <section id="book-processing" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-6">
              <Library className="h-4 w-4" />
              <span className="text-sm font-medium">NEW FEATURE</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI Book Processing System
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform any book, textbook, or study material into an interactive learning experience with our advanced AI-powered processing system
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-lg p-3">
                      <Upload className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Any Format</h3>
                      <p className="text-gray-600">Support for PDF, EPUB, DOCX, TXT, HTML, Markdown, and RTF files</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">AI Analysis & Explanation</h3>
                      <p className="text-gray-600">Get intelligent explanations, summaries, and concept mapping</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <FileQuestion className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Smart Quiz Generation</h3>
                      <p className="text-gray-600">Automatically generate quizzes and tests based on content</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-100 rounded-lg p-3">
                      <BarChart3 className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
                      <p className="text-gray-600">Monitor your learning progress with detailed analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Upload Your Material</h4>
                      <p className="text-gray-600 text-sm">Drag and drop or select your book/study material</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">AI Processing</h4>
                      <p className="text-gray-600 text-sm">Our AI analyzes and structures your content</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Interactive Learning</h4>
                      <p className="text-gray-600 text-sm">Access explanations, quizzes, and study tools</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">4</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Track Progress</h4>
                      <p className="text-gray-600 text-sm">Monitor your learning journey and improvement</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Processing Speed</span>
                    <span className="text-sm text-green-600 font-semibold">Instant</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Accuracy</span>
                    <span className="text-sm text-green-600 font-semibold">95%+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Formats Supported</span>
                    <span className="text-sm text-green-600 font-semibold">7+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Learning?</h3>
              <p className="text-gray-600 mb-6">
                Join thousands of students who are already using our AI Book Processing System to accelerate their learning
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = '/book-processing'}>
                  <Library className="mr-2 h-5 w-5" />
                  Start Processing Books
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = '/pricing'}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  View Pricing Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your learning journey or teaching career
            </p>
          </div>

          <div className="space-y-16">
            {pricingPlans.map((pricingCategory, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{pricingCategory.title}</h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {pricingCategory.description}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {pricingCategory.plans.map((plan, planIndex) => (
                    <Card key={planIndex} className={`relative hover:shadow-xl transition-all ${plan.popular ? 'border-blue-500 border-2 shadow-lg' : ''}`}>
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white px-4 py-2">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-8">
                        <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-gray-600">/{plan.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className={`w-full mt-6 ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                          size="lg"
                          onClick={() => window.location.href = '/pricing'}
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Solutions</h4>
              <p className="text-gray-600 mb-6">
                Need custom pricing for schools, universities, or large organizations? We offer tailored solutions with dedicated support, custom integrations, and volume discounts.
              </p>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/contact-us'}>
                Contact Sales Team
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor Assistant Showcase */}
      <section id="ai-tutor" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Your AI Tutor Assistant
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant help from specialized AI tutors anytime, anywhere
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Your AI Specialist</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {aiTutorSubjects.map((subject, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${subject.color} rounded-full flex items-center justify-center text-2xl mb-3 mx-auto`}>
                        {subject.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">{subject.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">Expert AI Tutor</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose AI Tutoring?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Availability</h4>
                    <p className="text-gray-600">Get help whenever you need it, no scheduling required</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Personalized Learning</h4>
                    <p className="text-gray-600">Adapts to your learning style and pace</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Instant Feedback</h4>
                    <p className="text-gray-600">Real-time responses and step-by-step guidance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Multiple Teaching Styles</h4>
                    <p className="text-gray-600">Choose from encouraging, strict, or friendly approaches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/book-processing'}>
                <Library className="mr-2 h-5 w-5" />
                Process Your Books
              </Button>
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = '/ai-tutor'}>
                <Brain className="mr-2 h-5 w-5" />
                Start Learning with AI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who are transforming their learning experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Upload your books and study materials to get instant AI-powered explanations, quizzes, and personalized learning paths
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300" onClick={() => window.location.href = '/book-processing'}>
              <Library className="mr-2 h-5 w-5" />
              Process Your First Book Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" onClick={() => window.location.href = '/ai-tutor'}>
              <Brain className="mr-2 h-5 w-5" />
              Try AI Tutor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">TutorConnect</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with AI-powered tutoring and book processing solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('book-processing')} className="hover:text-white transition-colors">Book Processing</button></li>
                <li><button onClick={() => scrollToSection('ai-tutor')} className="hover:text-white transition-colors">AI Tutor</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">Testimonials</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help-center" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact-us" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TutorConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}