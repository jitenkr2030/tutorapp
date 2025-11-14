"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Video, Shield, Star, Globe, CreditCard, Users, BookOpen, 
  Calendar, MessageSquare, FileText, Award, Zap, Target, Gift, 
  Headset, Smartphone, Mic, Languages, PenTool, Lightbulb, TrendingUp, 
  UserCheck, Clock, MapPin, CheckCircle, ArrowRight
} from "lucide-react";

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Features" },
    { id: "ai", name: "AI Features" },
    { id: "learning", name: "Learning Tools" },
    { id: "communication", name: "Communication" },
    { id: "payment", name: "Payment & Billing" },
    { id: "security", name: "Security & Trust" }
  ];

  const features = [
    {
      id: 1,
      title: "AI Tutor Assistant",
      description: "24/7 AI-powered tutoring support with personalized learning across multiple subjects.",
      icon: Brain,
      category: "ai",
      highlight: true,
      benefits: [
        "Available 24/7 for instant help",
        "Personalized learning experience",
        "Multiple teaching styles",
        "Step-by-step guidance"
      ]
    },
    {
      id: 2,
      title: "Live Video Sessions",
      description: "HD video calls with interactive whiteboard for engaging online learning.",
      icon: Video,
      category: "learning",
      benefits: [
        "HD video quality",
        "Interactive whiteboard",
        "Screen sharing",
        "Recording capabilities"
      ]
    },
    {
      id: 3,
      title: "Verified Tutors",
      description: "All tutors undergo background checks and qualification verification.",
      icon: Shield,
      category: "security",
      benefits: [
        "Background checks",
        "Qualification verification",
        "Identity verification",
        "Continuous monitoring"
      ]
    },
    {
      id: 4,
      title: "Ratings & Reviews",
      description: "Make informed decisions with genuine reviews from other students.",
      icon: Star,
      category: "security",
      benefits: [
        "Genuine student reviews",
        "Detailed ratings",
        "Tutor responses",
        "Review verification"
      ]
    },
    {
      id: 5,
      title: "Multi-Currency Support",
      description: "Pay in your local currency with real-time exchange rates and automatic conversion.",
      icon: Globe,
      category: "payment",
      benefits: [
        "50+ currencies supported",
        "Real-time exchange rates",
        "Automatic conversion",
        "Transparent pricing"
      ]
    },
    {
      id: 6,
      title: "Flexible Payment Plans",
      description: "Choose from single payments, subscriptions, or installment plans that fit your budget.",
      icon: CreditCard,
      category: "payment",
      benefits: [
        "Pay-per-session option",
        "Monthly subscriptions",
        "Installment plans",
        "Multiple payment methods"
      ]
    },
    {
      id: 7,
      title: "Smart Matching",
      description: "AI-powered tutor matching based on learning style, goals, and preferences.",
      icon: Users,
      category: "ai",
      benefits: [
        "AI-powered matching",
        "Learning style analysis",
        "Goal-based recommendations",
        "Preference matching"
      ]
    },
    {
      id: 8,
      title: "Interactive Learning Tools",
      description: "Comprehensive set of tools including assessments, homework management, and resource library.",
      icon: BookOpen,
      category: "learning",
      benefits: [
        "Interactive assessments",
        "Homework management",
        "Resource library",
        "Progress tracking"
      ]
    },
    {
      id: 9,
      title: "Smart Scheduling",
      description: "Intelligent calendar system with automatic timezone conversion and reminders.",
      icon: Calendar,
      category: "communication",
      benefits: [
        "Smart scheduling",
        "Timezone conversion",
        "Automatic reminders",
        "Calendar integration"
      ]
    },
    {
      id: 10,
      title: "Real-time Messaging",
      description: "Instant messaging with tutors, parents, and support team for seamless communication.",
      icon: MessageSquare,
      category: "communication",
      benefits: [
        "Real-time messaging",
        "File sharing",
        "Group chats",
        "Message history"
      ]
    },
    {
      id: 11,
      title: "Progress Analytics",
      description: "Detailed analytics and insights to track learning progress and identify improvement areas.",
      icon: TrendingUp,
      category: "learning",
      benefits: [
        "Progress tracking",
        "Performance analytics",
        "Improvement insights",
        "Goal achievement"
      ]
    },
    {
      id: 12,
      title: "Achievement System",
      description: "Gamified learning experience with badges, points, and leaderboards to motivate students.",
      icon: Award,
      category: "learning",
      benefits: [
        "Achievement badges",
        "Points system",
        "Leaderboards",
        "Progress milestones"
      ]
    }
  ];

  const filteredFeatures = activeCategory === "all" 
    ? features 
    : features.filter(feature => feature.category === activeCategory);

  const pricingFeatures = [
    {
      title: "Pay-Per-Session",
      description: "Pay only for the sessions you need with no long-term commitment.",
      price: "Starting from $25/hour",
      features: [
        "No subscription required",
        "Pay only for what you use",
        "Flexible scheduling",
        "All basic features included"
      ]
    },
    {
      title: "Monthly Subscription",
      description: "Unlimited access to AI tutors and discounted rates on human tutors.",
      price: "From $49/month",
      features: [
        "Unlimited AI tutoring",
        "20% off human tutors",
        "Priority support",
        "Advanced analytics"
      ],
      popular: true
    },
    {
      title: "Annual Plan",
      description: "Best value with maximum savings and premium features.",
      price: "From $499/year",
      features: [
        "Everything in monthly",
        "40% off human tutors",
        "Premium content library",
        "1-on-1 success coach"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Powerful Features</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Everything You Need to
              <span className="text-yellow-300"> Succeed</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover the comprehensive features that make TutorConnect the ultimate learning platform, 
              combining cutting-edge AI technology with human expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                <Target className="mr-2 h-5 w-5" />
                Explore Features
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <ArrowRight className="mr-2 h-5 w-5" />
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="min-w-[120px]"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFeatures.map((feature) => (
              <Card key={feature.id} className={`hover:shadow-xl transition-all ${feature.highlight ? 'border-blue-500 border-2' : ''}`}>
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${feature.highlight ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <feature.icon className={`h-8 w-8 ${feature.highlight ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                  {feature.highlight && (
                    <div className="flex justify-center">
                      <Badge className="bg-blue-600">FEATURED</Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for you. No hidden fees, cancel anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingFeatures.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">MOST POPULAR</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
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
            Ready to Transform Your Learning?
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
              View All Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}