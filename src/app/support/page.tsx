"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Headset, MessageSquare, BookOpen, Users, Clock, CheckCircle, 
  ArrowRight, Mail, Phone, Chat, Video, FileText, Settings,
  AlertCircle, TrendingUp, Star, HelpCircle, Send
} from "lucide-react";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("help-center");
  const [searchQuery, setSearchQuery] = useState("");

  const supportOptions = [
    {
      title: "24/7 Live Chat",
      description: "Get instant help from our support team through live chat",
      icon: MessageSquare,
      responseTime: "Instant",
      availability: "24/7",
      action: "Start Chat"
    },
    {
      title: "Email Support",
      description: "Send us detailed inquiries and get a response within hours",
      icon: Mail,
      responseTime: "2-4 hours",
      availability: "24/7",
      action: "Send Email"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support representatives",
      icon: Phone,
      responseTime: "1-2 minutes",
      availability: "Mon-Fri 9AM-6PM EST",
      action: "Call Us"
    },
    {
      title: "Video Support",
      description: "Screen sharing and video calls for complex technical issues",
      icon: Video,
      responseTime: "By appointment",
      availability: "Mon-Fri 10AM-4PM EST",
      action: "Schedule Call"
    }
  ];

  const helpCategories = [
    {
      title: "Getting Started",
      icon: Users,
      articles: [
        "How to create an account",
        "Setting up your profile",
        "Finding your first tutor",
        "Understanding the dashboard"
      ]
    },
    {
      title: "AI Tutor Features",
      icon: HelpCircle,
      articles: [
        "How to use AI Tutor Assistant",
        "Choosing the right AI personality",
        "AI tutor capabilities and limits",
        "Conversation history and tracking"
      ]
    },
    {
      title: "Billing & Payments",
      icon: CreditCard,
      articles: [
        "Understanding pricing plans",
        "Payment methods accepted",
        "Refund policy",
        "Subscription management"
      ]
    },
    {
      title: "Technical Issues",
      icon: Settings,
      articles: [
        "Video call troubleshooting",
        "Audio problems and solutions",
        "Platform compatibility",
        "Mobile app issues"
      ]
    },
    {
      title: "Account Management",
      icon: Users,
      articles: [
        "Changing your password",
        "Updating profile information",
        "Privacy settings",
        "Account deletion"
      ]
    },
    {
      title: "Safety & Security",
      icon: Shield,
      articles: [
        "Tutor verification process",
        "Reporting inappropriate behavior",
        "Data protection policies",
        "Safe tutoring practices"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do I find the right tutor for my needs?",
      answer: "You can use our smart matching system that considers your learning style, subject needs, and schedule. Alternatively, you can browse tutors manually and filter by subject, rating, price, and availability."
    },
    {
      question: "What subjects are available for AI tutoring?",
      answer: "Our AI tutors currently specialize in Mathematics, Physics, Chemistry, and English Literature. We're constantly expanding our AI capabilities to cover more subjects."
    },
    {
      question: "How does the pricing work?",
      answer: "We offer flexible pricing options: pay-per-session (starting from $25/hour), monthly subscriptions (from $49/month), and annual plans (from $499/year). Each plan includes different features and benefits."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your payment information. We never store your full payment details on our servers."
    },
    {
      question: "Can I switch between AI and human tutors?",
      answer: "Absolutely! You can use AI tutors for instant help and schedule sessions with human tutors for more personalized learning. Many students use both for different needs."
    },
    {
      question: "What if I'm not satisfied with a session?",
      answer: "We offer a satisfaction guarantee. If you're not happy with a session, contact our support team within 24 hours, and we'll work to resolve the issue or provide a refund."
    }
  ];

  const contactInfo = [
    {
      type: "Email",
      value: "support@tutorconnect.com",
      icon: Mail,
      description: "For general inquiries and support"
    },
    {
      type: "Phone",
      value: "1-800-TUTOR-01",
      icon: Phone,
      description: "Mon-Fri 9AM-6PM EST"
    },
    {
      type: "Live Chat",
      value: "Available 24/7",
      icon: MessageSquare,
      description: "Instant support through our platform"
    },
    {
      type: "Emergency",
      value: "emergency@tutorconnect.com",
      icon: AlertCircle,
      description: "For urgent issues only"
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
              <Headset className="h-4 w-4" />
              <span className="text-sm font-medium">Support Center</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              We're Here to
              <span className="text-yellow-300"> Help</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Get the support you need, when you need it. Our dedicated team is available 24/7 to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Live Chat
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Help Center
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Support Method
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple ways to get help, choose what works best for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <option.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Response: {option.responseTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.availability}
                    </div>
                  </div>
                  <Button className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Support Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="help-center">Help Center</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="contact">Contact Us</TabsTrigger>
              <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
            </TabsList>
            
            <TabsContent value="help-center" className="mt-8">
              <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <category.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.map((article, articleIndex) => (
                          <li key={articleIndex}>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                              {article}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className="mt-8">
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start space-x-2">
                        <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <span>{faq.question}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {faq.answer}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                  <div className="space-y-4">
                    {contactInfo.map((info, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <info.icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{info.type}</h4>
                              <p className="text-sm text-gray-600">{info.value}</p>
                              <p className="text-xs text-gray-500">{info.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-6">Support Hours</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Live Chat</span>
                          <Badge className="bg-green-600">24/7</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Email Support</span>
                          <Badge className="bg-green-600">24/7</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Phone Support</span>
                          <span className="text-sm text-gray-600">Mon-Fri 9AM-6PM EST</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Video Support</span>
                          <span className="text-sm text-gray-600">Mon-Fri 10AM-4PM EST</span>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600">
                          <strong>Emergency Support:</strong> For urgent issues outside business hours, 
                          please use our emergency email or live chat for immediate assistance.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ticket" className="mt-8">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Support Ticket</CardTitle>
                    <CardDescription>
                      Fill out the form below and our support team will get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input placeholder="your.email@example.com" type="email" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <Input placeholder="Brief description of your issue" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Technical Issue</option>
                        <option>Billing Question</option>
                        <option>Account Problem</option>
                        <option>General Inquiry</option>
                        <option>Feature Request</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        placeholder="Please describe your issue in detail..." 
                        rows={6}
                      />
                    </div>
                    
                    <Button className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Our support team is here to help you succeed. Don't hesitate to reach out!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Live Chat Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              <ArrowRight className="mr-2 h-5 w-5" />
              Browse Help Articles
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}