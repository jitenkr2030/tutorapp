"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Star, Crown, Zap, Users, Calendar, CreditCard, AlertCircle } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: string[];
  popular?: boolean;
  maxSessions: number;
  maxGroupSessions: number;
  prioritySupport: boolean;
  aiFeatures: boolean;
  recordingStorage: string;
  whiteboardFeatures: string[];
}

interface UserSubscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for occasional learners",
    price: { monthly: 9.99, yearly: 99.99 },
    currency: "USD",
    features: [
      "Up to 5 sessions per month",
      "Basic video recording",
      "Standard whiteboard",
      "Email support",
      "Mobile app access"
    ],
    maxSessions: 5,
    maxGroupSessions: 0,
    prioritySupport: false,
    aiFeatures: false,
    recordingStorage: "1GB",
    whiteboardFeatures: ["Basic drawing", "Text tool", "Shapes"]
  },
  {
    id: "premium",
    name: "Premium",
    description: "Ideal for regular learners",
    price: { monthly: 29.99, yearly: 299.99 },
    currency: "USD",
    features: [
      "Up to 20 sessions per month",
      "Enhanced video recording",
      "Advanced whiteboard",
      "Priority email support",
      "AI-powered recommendations",
      "Recording storage",
      "Group sessions (up to 5)"
    ],
    popular: true,
    maxSessions: 20,
    maxGroupSessions: 5,
    prioritySupport: true,
    aiFeatures: true,
    recordingStorage: "10GB",
    whiteboardFeatures: ["Basic drawing", "Text tool", "Shapes", "Math equations", "Image upload"]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious learners and tutors",
    price: { monthly: 59.99, yearly: 599.99 },
    currency: "USD",
    features: [
      "Unlimited sessions",
      "Professional video recording",
      "Full whiteboard suite",
      "24/7 priority support",
      "Advanced AI features",
      "Unlimited recording storage",
      "Large group sessions (up to 20)",
      "Advanced analytics",
      "Custom branding"
    ],
    maxSessions: -1, // Unlimited
    maxGroupSessions: 20,
    prioritySupport: true,
    aiFeatures: true,
    recordingStorage: "Unlimited",
    whiteboardFeatures: ["All premium features", "LaTeX support", "Collaborative tools", "Templates", "Export options"]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For institutions and organizations",
    price: { monthly: 199.99, yearly: 1999.99 },
    currency: "USD",
    features: [
      "Everything in Pro",
      "Unlimited group sessions",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced admin controls",
      "SLA guarantee",
      "Custom pricing plans",
      "White-glove onboarding",
      "API access"
    ],
    maxSessions: -1, // Unlimited
    maxGroupSessions: -1, // Unlimited
    prioritySupport: true,
    aiFeatures: true,
    recordingStorage: "Unlimited",
    whiteboardFeatures: ["All pro features", "Custom integrations", "Admin controls", "Advanced collaboration"]
  }
];

export default function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/current");
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setProcessingPlan(planId);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planId,
          billingCycle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const data = await response.json();
      
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        await fetchCurrentSubscription();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      await fetchCurrentSubscription();
      setShowCancelDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/reactivate", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription");
      }

      await fetchCurrentSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reactivate subscription");
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "basic":
        return <Star className="h-6 w-6" />;
      case "premium":
        return <Crown className="h-6 w-6" />;
      case "pro":
        return <Zap className="h-6 w-6" />;
      case "enterprise":
        return <Users className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    return billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;
  };

  const getPlanPeriod = () => {
    return billingCycle === "monthly" ? "month" : "year";
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const savings = monthlyTotal - plan.price.yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Choose Your Plan</h2>
          <p className="text-gray-600 mt-2">Select the perfect plan for your learning journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold capitalize">{currentSubscription.plan} Plan</p>
                <p className="text-sm text-gray-600">
                  Status: <Badge variant={currentSubscription.status === "ACTIVE" ? "default" : "secondary"}>
                    {currentSubscription.status}
                  </Badge>
                </p>
                <p className="text-sm text-gray-600">
                  Current period: {formatDate(currentSubscription.currentPeriodStart)} - {formatDate(currentSubscription.currentPeriodEnd)}
                </p>
                {currentSubscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-orange-600">
                    Your subscription will cancel at the end of the current billing period
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {currentSubscription.cancelAtPeriodEnd ? (
                  <Button variant="outline" onClick={handleReactivateSubscription}>
                    Reactivate
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle Toggle */}
      <div className="text-center">
        <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}>
          <TabsList className="mx-auto">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan.toLowerCase() === plan.id;
          const price = getPlanPrice(plan);
          const period = getPlanPeriod();

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-2">
                  <Badge variant="outline">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-gray-600">/{period}</span>
                  {billingCycle === "yearly" && (
                    <div className="text-sm text-green-600">
                      Save {getYearlySavings(plan)}%
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processingPlan === plan.id || isCurrentPlan}
                  >
                    {processingPlan === plan.id ? (
                      "Processing..."
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}