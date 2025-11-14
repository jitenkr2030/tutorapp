"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Lock, Eye, Download, Share, Mail, Phone, Calendar, 
  CheckCircle, AlertCircle, Info, FileText, ArrowRight, Globe,
  Database, Server, Key, User, Settings, Trash
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", name: "Overview", icon: Info },
    { id: "data-collection", name: "Data Collection", icon: Database },
    { id: "data-use", name: "Data Use", icon: Settings },
    { id: "data-sharing", name: "Data Sharing", icon: Share },
    { id: "user-rights", name: "Your Rights", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "cookies", name: "Cookies", icon: Globe },
    { id: "changes", name: "Policy Changes", icon: Calendar }
  ];

  const privacyPrinciples = [
    {
      title: "Transparency",
      description: "We clearly explain what data we collect and how we use it",
      icon: Eye
    },
    {
      title: "Control",
      description: "You have control over your personal information and privacy settings",
      icon: Settings
    },
    {
      title: "Security",
      description: "We protect your data with industry-standard security measures",
      icon: Lock
    },
    {
      title: "Compliance",
      description: "We comply with GDPR, CCPA, and other privacy regulations",
      icon: CheckCircle
    }
  ];

  const dataCategories = [
    {
      category: "Personal Information",
      items: [
        "Name and contact details",
        "Email address and phone number",
        "Profile information and photos",
        "Date of birth and age verification"
      ],
      purpose: "Account creation, profile management, and communication"
    },
    {
      category: "Academic Information",
      items: [
        "Subjects of interest",
        "Learning preferences and goals",
        "Academic performance data",
        "Session history and progress"
      ],
      purpose: "Personalized learning experience and tutor matching"
    },
    {
      category: "Payment Information",
      items: [
        "Payment method details",
        "Billing address",
        "Transaction history",
        "Subscription information"
      ],
      purpose: "Payment processing and billing management"
    },
    {
      category: "Technical Data",
      items: [
        "IP address and device information",
        "Browser type and version",
        "Operating system",
        "Usage patterns and interactions"
      ],
      purpose: "Platform functionality, security, and service improvement"
    }
  ];

  const userRights = [
    {
      right: "Right to Access",
      description: "You can request a copy of all personal data we hold about you",
      icon: Download
    },
    {
      right: "Right to Correct",
      description: "You can update or correct inaccurate personal information",
      icon: Settings
    },
    {
      right: "Right to Delete",
      description: "You can request deletion of your personal data (with some exceptions)",
      icon: Trash
    },
    {
      right: "Right to Opt-out",
      description: "You can opt-out of marketing communications and data sharing",
      icon: Eye
    },
    {
      right: "Right to Portability",
      description: "You can request your data in a portable, machine-readable format",
      icon: FileText
    },
    {
      right: "Right to Object",
      description: "You can object to certain types of data processing",
      icon: AlertCircle
    }
  ];

  const securityMeasures = [
    {
      measure: "Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard protocols",
      icon: Lock
    },
    {
      measure: "Access Controls",
      description: "Strict access controls limit who can view and process your data",
      icon: Key
    },
    {
      measure: "Regular Audits",
      description: "Regular security audits and vulnerability assessments",
      icon: Shield
    },
    {
      measure: "Secure Infrastructure",
      description: "Cloud infrastructure with advanced security certifications",
      icon: Server
    }
  ];

  const cookieTypes = [
    {
      type: "Essential Cookies",
      description: "Required for basic website functionality",
      required: true,
      examples: ["Login authentication", "Security tokens", "Session management"]
    },
    {
      type: "Performance Cookies",
      description: "Help us understand how you use our platform",
      required: false,
      examples: ["Analytics", "Performance monitoring", "Usage statistics"]
    },
    {
      type: "Functional Cookies",
      description: "Remember your preferences and settings",
      required: false,
      examples: ["Language preferences", "Theme settings", "Personalization"]
    },
    {
      type: "Marketing Cookies",
      description: "Used for advertising and marketing purposes",
      required: false,
      examples: ["Targeted ads", "Marketing campaigns", "Third-party tracking"]
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
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Privacy Policy</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Privacy is Our
              <span className="text-yellow-300"> Priority</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              We're committed to protecting your personal information and ensuring your privacy while using TutorConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                <FileText className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <ArrowRight className="mr-2 h-5 w-5" />
                Contact Privacy Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Privacy Principles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The core values that guide how we handle your personal information
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {privacyPrinciples.map((principle, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <principle.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{principle.title}</CardTitle>
                  <CardDescription>{principle.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Privacy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>November 15, 2024</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    We review and update this policy regularly to ensure it remains current and accurate.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                {/* Overview Section */}
                <Card id="overview" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Info className="h-6 w-6" />
                      <span>Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base leading-relaxed">
                      At TutorConnect, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                      disclose, and safeguard your personal information when you use our platform. By using TutorConnect, 
                      you agree to the practices described in this policy.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Key Point:</strong> We only collect data that is necessary to provide you with the best 
                        tutoring experience and to improve our services.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Collection Section */}
                <Card id="data-collection" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Database className="h-6 w-6" />
                      <span>Information We Collect</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {dataCategories.map((category, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-lg mb-2">{category.category}</h4>
                          <ul className="space-y-1 mb-3">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm text-gray-600">
                            <strong>Purpose:</strong> {category.purpose}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Use Section */}
                <Card id="data-use" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Settings className="h-6 w-6" />
                      <span>How We Use Your Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Service Provision</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Connect you with qualified tutors</li>
                            <li>• Provide AI tutoring services</li>
                            <li>• Schedule and manage sessions</li>
                            <li>• Process payments and billing</li>
                          </ul>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Platform Improvement</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Analyze usage patterns</li>
                            <li>• Improve user experience</li>
                            <li>• Develop new features</li>
                            <li>• Optimize performance</li>
                          </ul>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Communication</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Send important notifications</li>
                            <li>• Provide customer support</li>
                            <li>• Share platform updates</li>
                            <li>• Send marketing communications</li>
                          </ul>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Safety & Security</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Verify user identities</li>
                            <li>• Prevent fraud</li>
                            <li>• Monitor platform activity</li>
                            <li>• Ensure compliance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Sharing Section */}
                <Card id="data-sharing" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Share className="h-6 w-6" />
                      <span>Information Sharing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-base">
                        We do not sell your personal information. We only share data in specific circumstances:
                      </p>
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold">With Tutors</h4>
                          <p className="text-sm text-gray-600">
                            We share necessary information with tutors to facilitate sessions, including your name, 
                            subject needs, and contact information.
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold">Service Providers</h4>
                          <p className="text-sm text-gray-600">
                            We work with third-party service providers for payment processing, data storage, 
                            and customer support. All providers are bound by strict confidentiality agreements.
                          </p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-4">
                          <h4 className="font-semibold">Legal Requirements</h4>
                          <p className="text-sm text-gray-600">
                            We may disclose information when required by law, to protect our rights, or to ensure 
                            the safety of our users.
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold">Business Transfers</h4>
                          <p className="text-sm text-gray-600">
                            In the event of a merger, acquisition, or sale of assets, your information may be 
                            transferred as part of the business transaction.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Rights Section */}
                <Card id="user-rights" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <User className="h-6 w-6" />
                      <span>Your Privacy Rights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {userRights.map((right, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <right.icon className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold">{right.right}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{right.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">How to Exercise Your Rights</h4>
                      <p className="text-sm text-gray-700">
                        To exercise any of these rights, please contact our Privacy Team at 
                        <span className="text-blue-600"> privacy@tutorconnect.com</span>. 
                        We'll respond to your request within 30 days as required by law.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Section */}
                <Card id="security" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Shield className="h-6 w-6" />
                      <span>Data Security</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {securityMeasures.map((measure, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <measure.icon className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold">{measure.measure}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{measure.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-800">Security Certifications</h4>
                          <p className="text-sm text-green-700">
                            We maintain SOC 2 Type II compliance and follow industry best practices for data protection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cookies Section */}
                <Card id="cookies" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Globe className="h-6 w-6" />
                      <span>Cookies and Tracking</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-base">
                        We use cookies and similar tracking technologies to enhance your experience on our platform.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {cookieTypes.map((cookie, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{cookie.type}</h4>
                              {cookie.required && (
                                <Badge className="bg-red-600 text-white">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{cookie.description}</p>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Examples:</p>
                              {cookie.examples.map((example, exampleIndex) => (
                                <p key={exampleIndex} className="text-xs text-gray-600">• {example}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Policy Changes Section */}
                <Card id="changes" className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <Calendar className="h-6 w-6" />
                      <span>Changes to This Policy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-base">
                        We may update this Privacy Policy from time to time to reflect changes in our practices 
                        or applicable laws. When we make changes, we will:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Update the "Last Updated" date at the top of this policy</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Notify users of significant changes through email or platform notifications</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Post a prominent notice on our platform for major changes</span>
                        </li>
                      </ul>
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Important:</strong> Continued use of TutorConnect after any changes to this policy 
                          constitutes acceptance of those changes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions About Your Privacy?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              If you have any questions about this Privacy Policy or how we handle your personal information, 
              please don't hesitate to contact our Privacy Team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Mail className="mr-2 h-5 w-5" />
                Email Privacy Team
              </Button>
              <Button size="lg" variant="outline">
                <Phone className="mr-2 h-5 w-5" />
                Call Support
              </Button>
            </div>
            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>privacy@tutorconnect.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-PRIVACY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}