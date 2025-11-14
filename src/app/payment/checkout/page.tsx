"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Suspense } from "react";
import { 
  CreditCard, Lock, CheckCircle, AlertCircle, ArrowLeft, 
  Shield, Clock, Gift, Crown, Zap, Users, Calendar, Smartphone,
  FileText, Headset, Star, TrendingUp, Globe, DollarSign, Euro,
  PoundSterling, Yen, RefreshCw
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const subscriptionId = searchParams.get("subscriptionId");
  const plan = searchParams.get("plan");
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("card");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Mock payment data based on parameters
  useEffect(() => {
    const mockPaymentDetails = {
      id: paymentId || "pay_" + Math.random().toString(36).substr(2, 9),
      amount: plan === "basic" ? 9.99 : plan === "premium" ? 29.99 : plan === "pro" ? 59.99 : 199.99,
      currency: selectedCurrency,
      type: subscriptionId ? "subscription" : "one-time",
      plan: plan || "premium",
      description: subscriptionId ? "Monthly Subscription" : "Tutoring Session",
      billingCycle: subscriptionId ? "monthly" : "once",
      features: subscriptionId ? getSubscriptionFeatures(plan) : getSessionFeatures()
    };
    
    setPaymentDetails(mockPaymentDetails);
    setLoading(false);
  }, [paymentId, subscriptionId, plan, selectedCurrency]);

  const getSubscriptionFeatures = (planName?: string) => {
    const features = {
      basic: [
        "Up to 5 sessions per month",
        "Basic video recording",
        "Standard whiteboard",
        "Email support",
        "Mobile app access"
      ],
      premium: [
        "Up to 20 sessions per month",
        "Enhanced video recording",
        "Advanced whiteboard",
        "Priority email support",
        "AI-powered recommendations",
        "Recording storage",
        "Group sessions (up to 5)"
      ],
      pro: [
        "Unlimited sessions",
        "Professional video recording",
        "Full whiteboard suite",
        "24/7 priority support",
        "Advanced AI features",
        "Unlimited recording storage",
        "Large group sessions (up to 20)",
        "Advanced analytics"
      ],
      enterprise: [
        "Everything in Pro",
        "Unlimited group sessions",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced admin controls",
        "SLA guarantee",
        "API access"
      ]
    };
    
    return features[planName as keyof typeof features] || features.premium;
  };

  const getSessionFeatures = () => [
    "1-hour tutoring session",
    "HD video quality",
    "Interactive whiteboard",
    "Session recording",
    "Progress tracking"
  ];

  const handleCardInputChange = (field: string, value: string) => {
    setCardInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, "").replace(/(.{2})/, "$1/").trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful payment
      setSuccess(true);
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push("/payment/success");
      }, 2000);
      
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0 },
    { code: "EUR", name: "Euro", symbol: "€", rate: 0.85 },
    { code: "GBP", name: "British Pound", symbol: "£", rate: 0.73 },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.25 },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.35 }
  ];

  const getConvertedAmount = (amount: number, currency: string) => {
    const currencyObj = currencies.find(c => c.code === currency);
    return currencyObj ? (amount * currencyObj.rate).toFixed(2) : amount.toFixed(2);
  };

  const getCurrencySymbol = (currency: string) => {
    const currencyObj = currencies.find(c => c.code === currency);
    return currencyObj?.symbol || "$";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Checkout</h1>
                <p className="text-sm text-gray-600">Complete your payment securely</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Secured by Stripe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Enter your payment details to complete the purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card">Credit Card</TabsTrigger>
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="mt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Currency Selection */}
                      <div>
                        <Label>Currency</Label>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {currencies.map((currency) => (
                            <button
                              key={currency.code}
                              type="button"
                              onClick={() => setSelectedCurrency(currency.code)}
                              className={`p-3 border rounded-lg text-center transition-colors ${
                                selectedCurrency === currency.code
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="font-semibold">{currency.code}</div>
                              <div className="text-xs text-gray-600">{currency.symbol}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card Information */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={formatCardNumber(cardInfo.number)}
                            onChange={(e) => handleCardInputChange("number", e.target.value.replace(/\s/g, ""))}
                            maxLength={19}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={formatExpiry(cardInfo.expiry)}
                              onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={cardInfo.cvv}
                              onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="name">Cardholder Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={cardInfo.name}
                            onChange={(e) => handleCardInputChange("name", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Security Notice */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900">Secure Payment</h4>
                            <p className="text-sm text-blue-700">
                              Your payment information is encrypted and secure. We never store your full card details.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={processing || !cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name}
                      >
                        {processing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay {getCurrencySymbol(selectedCurrency)}{getConvertedAmount(paymentDetails.amount, selectedCurrency)}
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="paypal" className="mt-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Globe className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">PayPal Checkout</h3>
                      <p className="text-gray-600 mb-4">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                      <Button className="w-full" size="lg">
                        Continue with PayPal
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="bank" className="mt-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Bank Transfer</h3>
                      <p className="text-gray-600 mb-4">
                        Bank transfer details will be provided after order confirmation.
                      </p>
                      <Button className="w-full" size="lg">
                        Continue with Bank Transfer
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plan</span>
                  <Badge className="capitalize">{paymentDetails.plan}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="capitalize">{paymentDetails.type}</span>
                </div>

                {paymentDetails.billingCycle && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="capitalize">{paymentDetails.billingCycle}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">
                    {getCurrencySymbol(selectedCurrency)}{getConvertedAmount(paymentDetails.amount, selectedCurrency)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">
                      {getCurrencySymbol(selectedCurrency)}{getConvertedAmount(paymentDetails.amount, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {paymentDetails.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security & Guarantee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">256-bit SSL Encryption</p>
                    <p className="text-xs text-gray-600">Bank-level security</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">30-Day Money Back</p>
                    <p className="text-xs text-gray-600">Satisfaction guarantee</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Headset className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">24/7 Support</p>
                    <p className="text-xs text-gray-600">Always here to help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}