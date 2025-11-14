"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, CheckCircle, Zap, Users, Brain, Video, Shield, Globe, 
  CreditCard, Award, Clock, ArrowRight, Crown, Gift, TrendingUp,
  BookOpen, MessageSquare, FileText, Calendar, Headset, Smartphone,
  Mic, Languages, PenTool, Lightbulb, Settings, GraduationCap, BarChart3, Code
} from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeTab, setActiveTab] = useState("individuals");

  const pricingPlans = {
    individuals: [
      {
        name: "Free Trial",
        price: { monthly: "$0", annual: "$0" },
        description: "Try TutorConnect with limited features",
        featured: false,
        features: [
          "1 AI tutoring session per week",
          "Basic tutor search",
          "Limited messaging",
          "Community support",
          "Profile creation"
        ],
        limitations: [
          "No human tutor sessions",
          "Limited AI subjects",
          "No advanced analytics",
          "No priority support"
        ],
        cta: "Start Free Trial",
        popular: false
      },
      {
        name: "Basic",
        price: { monthly: "$25", annual: "$250" },
        description: "Perfect for occasional learners",
        featured: false,
        features: [
          "5 AI tutoring sessions per week",
          "2 human tutor sessions per month",
          "All AI subjects available",
          "Basic progress tracking",
          "Email support"
        ],
        limitations: [
          "Limited session recording",
          "No advanced features",
          "Standard response time"
        ],
        cta: "Get Started",
        popular: false
      },
      {
        name: "Professional",
        price: { monthly: "$49", annual: "$490" },
        description: "Ideal for serious students",
        featured: true,
        features: [
          "Unlimited AI tutoring",
          "10 human tutor sessions per month",
          "Advanced analytics & insights",
          "Session recordings",
          "Priority support",
          "Custom learning plans",
          "Progress reports"
        ],
        limitations: [],
        cta: "Most Popular",
        popular: true,
        savings: "Save $58/year"
      },
      {
        name: "Premium",
        price: { monthly: "$99", annual: "$990" },
        description: "Maximum learning potential",
        featured: false,
        features: [
          "Everything in Professional",
          "Unlimited human tutor sessions",
          "1-on-1 success coach",
          "Premium content library",
          "24/7 phone support",
          "Early feature access",
          "Custom integrations"
        ],
        limitations: [],
        cta: "Go Premium",
        popular: false,
        savings: "Save $118/year"
      }
    ],
    families: [
      {
        name: "Family Starter",
        price: { monthly: "$79", annual: "$790" },
        description: "For families with 2-3 students",
        featured: false,
        features: [
          "Up to 3 student accounts",
          "Shared AI tutoring sessions",
          "5 human tutor sessions per month",
          "Parent dashboard",
          "Progress monitoring",
          "Family coordination"
        ],
        limitations: [
          "Limited per-student sessions",
          "No advanced analytics"
        ],
        cta: "Start Family Plan",
        popular: false
      },
      {
        name: "Family Plus",
        price: { monthly: "$149", annual: "$1490" },
        description: "Perfect for growing families",
        featured: true,
        features: [
          "Up to 5 student accounts",
          "Unlimited AI tutoring",
          "20 human tutor sessions per month",
          "Advanced family analytics",
          "Parent-tutor communication",
          "Custom learning paths",
          "Family progress reports"
        ],
        limitations: [],
        cta: "Best for Families",
        popular: true,
        savings: "Save $298/year"
      },
      {
        name: "Family Premium",
        price: { monthly: "$249", annual: "$2490" },
        description: "Ultimate family learning solution",
        featured: false,
        features: [
          "Unlimited student accounts",
          "Everything in Family Plus",
          "Dedicated family coordinator",
          "Home visit options",
          "Custom curriculum design",
          "Family learning workshops",
          "Priority scheduling"
        ],
        limitations: [],
        cta: "Premium Family",
        popular: false,
        savings: "Save $498/year"
      }
    ],
    tutors: [
      {
        name: "Tutor Basic",
        price: { monthly: "Free", annual: "Free" },
        description: "Start your tutoring journey",
        featured: false,
        features: [
          "Basic profile creation",
          "Limited student visibility",
          "Standard commission (20%)",
          "Basic messaging",
          "Community access"
        ],
        limitations: [
          "No premium placement",
          "Limited analytics",
          "Standard support"
        ],
        cta: "Join as Tutor",
        popular: false
      },
      {
        name: "Tutor Pro",
        price: { monthly: "$29", annual: "$290" },
        description: "Grow your tutoring business",
        featured: true,
        features: [
          "Enhanced profile visibility",
          "Reduced commission (15%)",
          "Advanced scheduling tools",
          "Student analytics",
          "Marketing support",
          "Priority placement"
        ],
        limitations: [],
        cta: "Boost Your Business",
        popular: true,
        savings: "Save $58/year"
      },
      {
        name: "Tutor Elite",
        price: { monthly: "$79", annual: "$790" },
        description: "Maximize your earning potential",
        featured: false,
        features: [
          "Everything in Tutor Pro",
          "Lowest commission (10%)",
          "Premium placement",
          "Dedicated account manager",
          "Professional development",
          "Custom branding",
          "API access"
        ],
        limitations: [],
        cta: "Go Elite",
        popular: false,
        savings: "Save $158/year"
      }
    ]
  };

  const addOns = [
    {
      name: "Additional AI Sessions",
      price: "$10/month",
      description: "10 extra AI tutoring sessions per month",
      icon: Brain
    },
    {
      name: "Human Tutor Pack",
      price: "$25/month",
      description: "5 additional human tutor sessions",
      icon: Users
    },
    {
      name: "Advanced Analytics",
      price: "$15/month",
      description: "Detailed learning analytics and insights",
      icon: TrendingUp
    },
    {
      name: "Content Library Access",
      price: "$20/month",
      description: "Premium educational resources and materials",
      icon: BookOpen
    },
    {
      name: "Priority Support",
      price: "$10/month",
      description: "24/7 priority customer support",
      icon: Headset
    },
    {
      name: "Recording Storage",
      price: "$5/month",
      description: "Additional cloud storage for session recordings",
      icon: Video
    }
  ];

  const enterpriseFeatures = [
    {
      title: "Custom Solutions",
      description: "Tailored pricing and features for educational institutions",
      icon: Settings
    },
    {
      title: "Volume Discounts",
      description: "Special pricing for large groups and organizations",
      icon: TrendingUp
    },
    {
      title: "Dedicated Support",
      description: "24/7 dedicated account management and technical support",
      icon: Headset
    },
    {
      title: "Custom Integration",
      description: "API access and integration with existing systems",
      icon: Code
    },
    {
      title: "Training & Onboarding",
      description: "Comprehensive training for administrators and users",
      icon: GraduationCap
    },
    {
      title: "Advanced Analytics",
      description: "Custom dashboards and reporting for institutions",
      icon: BarChart3
    }
  ];

  const compareFeatures = [
    {
      feature: "AI Tutoring Sessions",
      free: "1/week",
      basic: "5/week",
      professional: "Unlimited",
      premium: "Unlimited"
    },
    {
      feature: "Human Tutor Sessions",
      free: "0",
      basic: "2/month",
      professional: "10/month",
      premium: "Unlimited"
    },
    {
      feature: "Subjects Available",
      free: "Limited",
      basic: "All",
      professional: "All + Advanced",
      premium: "All + Premium"
    },
    {
      feature: "Progress Analytics",
      free: "Basic",
      basic: "Basic",
      professional: "Advanced",
      premium: "Premium"
    },
    {
      feature: "Support Response Time",
      free: "24-48 hours",
      basic: "12-24 hours",
      professional: "2-4 hours",
      premium: "1 hour"
    },
    {
      feature: "Session Recordings",
      free: "No",
      basic: "Limited",
      professional: "Yes",
      premium: "Unlimited"
    },
    {
      feature: "Mobile App",
      free: "Basic",
      basic: "Full",
      professional: "Full",
      premium: "Premium"
    },
    {
      feature: "Custom Learning Plans",
      free: "No",
      basic: "No",
      professional: "Yes",
      premium: "Advanced"
    }
  ];

  const renderPlanCard = (plan: any, index: number) => (
    <Card key={index} className={`relative ${plan.featured ? 'border-blue-500 border-2 shadow-xl' : ''} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-4 py-1">MOST POPULAR</Badge>
        </div>
      )}
      {plan.savings && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-600 text-white px-3 py-1 text-xs">
            {plan.savings}
          </Badge>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <div className="text-4xl font-bold text-blue-600">
            {billingCycle === "monthly" ? plan.price.monthly : plan.price.annual}
            <span className="text-base font-normal text-gray-500">
              /{billingCycle === "monthly" ? "month" : "year"}
            </span>
          </div>
          {billingCycle === "annual" && plan.price.annual !== "$0" && (
            <p className="text-sm text-green-600 mt-1">
              Billed annually (save 17%)
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {plan.features.map((feature: string, featureIndex: number) => (
            <div key={featureIndex} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </div>
          ))}
          {plan.limitations.map((limitation: string, limitIndex: number) => (
            <div key={limitIndex} className="flex items-center text-sm text-gray-500">
              <div className="h-4 w-4 mr-2 flex-shrink-0">•</div>
              {limitation}
            </div>
          ))}
        </div>
        <Button 
          className="w-full" 
          variant={plan.popular ? "default" : "outline"}
          size="lg"
        >
          {plan.cta}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Choose Your Perfect
              <span className="text-yellow-300"> Plan</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Flexible pricing options designed to fit every learning need and budget. 
              No hidden fees, cancel anytime.
            </p>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Button
                variant={billingCycle === "monthly" ? "default" : "outline"}
                onClick={() => setBillingCycle("monthly")}
                className="bg-white text-gray-900 hover:bg-gray-100 border-white"
              >
                Monthly Billing
              </Button>
              <Button
                variant={billingCycle === "annual" ? "default" : "outline"}
                onClick={() => setBillingCycle("annual")}
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 border-yellow-400"
              >
                Annual Billing
                <Badge className="ml-2 bg-green-600 text-white">Save 17%</Badge>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
              <TabsTrigger value="individuals">For Individuals</TabsTrigger>
              <TabsTrigger value="families">For Families</TabsTrigger>
              <TabsTrigger value="tutors">For Tutors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="individuals" className="mt-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {pricingPlans.individuals.map((plan, index) => renderPlanCard(plan, index))}
              </div>
            </TabsContent>
            
            <TabsContent value="families" className="mt-12">
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {pricingPlans.families.map((plan, index) => renderPlanCard(plan, index))}
              </div>
            </TabsContent>
            
            <TabsContent value="tutors" className="mt-12">
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {pricingPlans.tutors.map((plan, index) => renderPlanCard(plan, index))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Compare Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div className="font-semibold text-gray-900">Feature</div>
                <div className="text-center font-semibold text-gray-900">Free Trial</div>
                <div className="text-center font-semibold text-gray-900">Basic</div>
                <div className="text-center font-semibold text-blue-600">Professional</div>
                <div className="text-center font-semibold text-gray-900">Premium</div>
              </div>
              
              {compareFeatures.map((row, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-200">
                  <div className="font-medium text-gray-900">{row.feature}</div>
                  <div className="text-center text-sm text-gray-600">{row.free}</div>
                  <div className="text-center text-sm text-gray-600">{row.basic}</div>
                  <div className="text-center text-sm text-blue-600 font-medium">{row.professional}</div>
                  <div className="text-center text-sm text-gray-600">{row.premium}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enhance Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Add extra features to customize your learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {addOns.map((addOn, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <addOn.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{addOn.name}</h3>
                      <p className="text-lg font-bold text-blue-600">{addOn.price}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{addOn.description}</p>
                  <Button variant="outline" className="w-full mt-4">
                    Add to Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-600 rounded-full px-4 py-2 mb-6">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Enterprise Solutions</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Custom Solutions for Institutions
              </h2>
              <p className="text-xl mb-8 text-gray-300">
                Partner with TutorConnect to provide comprehensive learning solutions for your school, 
                university, or organization. Get custom pricing, dedicated support, and tailored features.
              </p>
              <div className="space-y-4 mb-8">
                {enterpriseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="h-5 w-5 text-blue-400" />
                    <span>{feature.description}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                  Contact Sales
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                  Schedule Demo
                </Button>
              </div>
            </div>
            <div>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Enterprise Benefits</CardTitle>
                  <CardDescription className="text-gray-300">
                    Why institutions choose TutorConnect
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Cost Savings</span>
                    <Badge className="bg-green-600">Up to 40%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Student Engagement</span>
                    <Badge className="bg-blue-600">+85%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Learning Outcomes</span>
                    <Badge className="bg-purple-600">+65%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Teacher Satisfaction</span>
                    <Badge className="bg-yellow-600">+90%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our pricing
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any differences.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, 
                  contact our support team for a full refund.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, PayPal, and bank transfers. 
                  All payments are processed securely through our payment partners.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a long-term contract?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No, we don't believe in long-term contracts. All our plans are month-to-month, 
                  and you can cancel anytime without penalties.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of students who are already achieving their learning goals with TutorConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
              <Brain className="mr-2 h-5 w-5" />
              Start Free Trial
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