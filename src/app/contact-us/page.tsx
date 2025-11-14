"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, Phone, MessageSquare, MapPin, Clock, Send, Users, Building, 
  Globe, CheckCircle, AlertCircle, ArrowRight, Headset, Video, FileText
} from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods = [
    {
      title: "Email Support",
      description: "For general inquiries and detailed questions",
      icon: Mail,
      value: "support@tutorconnect.com",
      responseTime: "2-4 hours",
      hours: "24/7"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support team",
      icon: Phone,
      value: "1-800-TUTOR-01",
      responseTime: "1-2 minutes",
      hours: "Mon-Fri 9AM-6PM EST"
    },
    {
      title: "Live Chat",
      description: "Instant support through our platform",
      icon: MessageSquare,
      value: "Available on platform",
      responseTime: "Instant",
      hours: "24/7"
    },
    {
      title: "Video Support",
      description: "Screen sharing for technical issues",
      icon: Video,
      value: "By appointment",
      responseTime: "Scheduled",
      hours: "Mon-Fri 10AM-4PM EST"
    }
  ];

  const officeLocations = [
    {
      city: "New York",
      address: "123 Tutor Street, Manhattan, NY 10001",
      phone: "+1 (212) 555-0123",
      hours: "Mon-Fri 9AM-6PM EST"
    },
    {
      city: "San Francisco",
      address: "456 Learning Avenue, San Francisco, CA 94105",
      phone: "+1 (415) 555-0124",
      hours: "Mon-Fri 9AM-6PM PST"
    },
    {
      city: "London",
      address: "789 Education Lane, London, UK EC1A 1BB",
      phone: "+44 20 7123 4567",
      hours: "Mon-Fri 9AM-6PM GMT"
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Head of Customer Success",
      email: "sarah.j@tutorconnect.com",
      department: "Student Support"
    },
    {
      name: "Michael Chen",
      role: "Technical Support Lead",
      email: "michael.c@tutorconnect.com",
      department: "Technical Issues"
    },
    {
      name: "Emily Rodriguez",
      role: "Billing Specialist",
      email: "emily.r@tutorconnect.com",
      department: "Payments & Billing"
    },
    {
      name: "David Kim",
      role: "Partnership Manager",
      email: "david.k@tutorconnect.com",
      department: "Tutor Partnerships"
    }
  ];

  const faqs = [
    {
      question: "What's the best way to contact support?",
      answer: "For urgent issues, use live chat for instant help. For detailed inquiries, email us at support@tutorconnect.com. Phone support is available during business hours for complex issues."
    },
    {
      question: "How quickly will I get a response?",
      answer: "Live chat responses are instant. Email responses typically take 2-4 hours. Phone calls are answered within 1-2 minutes during business hours."
    },
    {
      question: "Do you offer support in multiple languages?",
      answer: "Yes! We offer support in English, Spanish, French, German, and Mandarin. Please specify your preferred language when contacting us."
    },
    {
      question: "Can I schedule a call with support?",
      answer: "Absolutely! You can schedule a video support call through our platform. This is especially helpful for technical issues that require screen sharing."
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you for your message! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: ""
      });
    }, 2000);
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
              <span className="text-sm font-medium">Get in Touch</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              We'd Love to
              <span className="text-yellow-300"> Hear</span> From You
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Whether you have questions, feedback, or need support, our team is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Live Chat
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <ArrowRight className="mr-2 h-5 w-5" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Contact Method
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple ways to reach us, choose what works best for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <method.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-lg font-semibold text-blue-600">
                      {method.value}
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Response: {method.responseTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.hours}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <Input
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject *</label>
                      <Input
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing & Payments</SelectItem>
                          <SelectItem value="tutor">Tutor Related</SelectItem>
                          <SelectItem value="student">Student Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Message *</label>
                      <Textarea
                        placeholder="Please describe your inquiry in detail..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Office Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Office Locations</span>
                  </CardTitle>
                  <CardDescription>
                    Visit us at one of our global offices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {officeLocations.map((office, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900">{office.city}</h4>
                      <p className="text-sm text-gray-600 mb-1">{office.address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{office.phone}</span>
                        <span>•</span>
                        <span>{office.hours}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Team Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Team Contacts</span>
                  </CardTitle>
                  <CardDescription>
                    Reach out to specific team members
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <p className="text-xs text-blue-600">{member.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.department}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Quick FAQ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Response Times
              </h2>
              <p className="text-lg text-gray-600">
                We're committed to getting back to you as quickly as possible
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Emergency</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">&lt; 30 min</p>
                  <p className="text-sm text-gray-600">For urgent technical issues and account problems</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Standard</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">2-4 hours</p>
                  <p className="text-sm text-gray-600">For general inquiries and support requests</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <Headset className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Complex Issues</h3>
                  <p className="text-3xl font-bold text-purple-600 mb-2">24 hours</p>
                  <p className="text-sm text-gray-600">For detailed technical and billing issues</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of students and tutors who are already part of the TutorConnect community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Us Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              <ArrowRight className="mr-2 h-5 w-5" />
              Explore Platform
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}