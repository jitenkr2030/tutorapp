"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp,
  Info,
  FileText
} from "lucide-react";

interface InstallmentPlan {
  id: string;
  bookingId: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  paidInstallments: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  frequency: "monthly" | "bi-weekly" | "weekly";
  currency: string;
  nextPaymentDate?: string;
  remainingAmount?: number;
  bookingDetails?: {
    sessionTitle: string;
    tutorName: string;
    scheduledAt: string;
  };
}

interface CreateInstallmentPlanData {
  bookingId: string;
  installmentCount: number;
  frequency: "monthly" | "bi-weekly" | "weekly";
  firstPaymentDate: string;
}

export default function InstallmentPlans() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [availableBookings, setAvailableBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchPlans();
    fetchAvailableBookings();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/installment-plans");
      if (!response.ok) {
        throw new Error("Failed to fetch installment plans");
      }
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      const response = await fetch("/api/installment-plans/available-bookings");
      if (response.ok) {
        const data = await response.json();
        setAvailableBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Error fetching available bookings:", err);
    }
  };

  const handleCreatePlan = async (planData: CreateInstallmentPlanData) => {
    setCreatingPlan(true);
    setError(null);

    try {
      const response = await fetch("/api/installment-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error("Failed to create installment plan");
      }

      await fetchPlans();
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleMakePayment = async (planId: string) => {
    setProcessingPayment(planId);
    setError(null);

    try {
      const response = await fetch(`/api/installment-plans/${planId}/pay`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to process payment");
      }

      const data = await response.json();
      
      // Redirect to payment page if needed
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        await fetchPlans();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setProcessingPayment(null);
    }
  };

  const activePlans = plans.filter(plan => plan.status === "PENDING" || plan.status === "OVERDUE");
  const completedPlans = plans.filter(plan => plan.status === "PAID");
  const cancelledPlans = plans.filter(plan => plan.status === "CANCELLED");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressPercentage = (plan: InstallmentPlan) => {
    return (plan.paidInstallments / plan.installmentCount) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextPaymentDate = (plan: InstallmentPlan) => {
    if (plan.paidInstallments >= plan.installmentCount) return null;
    
    const dueDate = new Date(plan.dueDate);
    const interval = plan.frequency === "weekly" ? 7 : plan.frequency === "bi-weekly" ? 14 : 30;
    const nextDate = new Date(dueDate.getTime() + (plan.paidInstallments * interval * 24 * 60 * 60 * 1000));
    
    return nextDate;
  };

  const getRemainingAmount = (plan: InstallmentPlan) => {
    const remainingInstallments = plan.installmentCount - plan.paidInstallments;
    return remainingInstallments * plan.installmentAmount;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Installment Plans</h2>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-40"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Installment Plans</h2>
          <p className="text-gray-600 mt-1">Manage your payment plans and track installments</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button disabled={availableBookings.length === 0}>
              <CreditCard className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Installment Plan</DialogTitle>
              <DialogDescription>
                Set up an installment plan for an existing booking.
              </DialogDescription>
            </DialogHeader>
            <CreateInstallmentPlanForm
              availableBookings={availableBookings}
              onSubmit={handleCreatePlan}
              loading={creatingPlan}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold">{activePlans.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedPlans.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">
                  {plans.filter(p => p.status === "OVERDUE").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Remaining</p>
                <p className="text-2xl font-bold">
                  {plans.reduce((sum, plan) => sum + getRemainingAmount(plan), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Plans ({activePlans.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedPlans.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledPlans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <PlansGrid 
            plans={activePlans}
            onMakePayment={handleMakePayment}
            processingPayment={processingPayment}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getProgressPercentage={getProgressPercentage}
            getNextPaymentDate={getNextPaymentDate}
            getRemainingAmount={getRemainingAmount}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <PlansGrid 
            plans={completedPlans}
            onMakePayment={handleMakePayment}
            processingPayment={processingPayment}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getProgressPercentage={getProgressPercentage}
            getNextPaymentDate={getNextPaymentDate}
            getRemainingAmount={getRemainingAmount}
          />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <PlansGrid 
            plans={cancelledPlans}
            onMakePayment={handleMakePayment}
            processingPayment={processingPayment}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getProgressPercentage={getProgressPercentage}
            getNextPaymentDate={getNextPaymentDate}
            getRemainingAmount={getRemainingAmount}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Plans Grid Component
interface PlansGridProps {
  plans: InstallmentPlan[];
  onMakePayment: (planId: string) => void;
  processingPayment: string | null;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getProgressPercentage: (plan: InstallmentPlan) => number;
  getNextPaymentDate: (plan: InstallmentPlan) => Date | null;
  getRemainingAmount: (plan: InstallmentPlan) => number;
}

function PlansGrid({ 
  plans, 
  onMakePayment, 
  processingPayment, 
  formatDate, 
  getStatusColor, 
  getProgressPercentage,
  getNextPaymentDate,
  getRemainingAmount
}: PlansGridProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans found</h3>
        <p className="text-gray-600">There are no installment plans in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {plans.map((plan) => {
        const progressPercentage = getProgressPercentage(plan);
        const nextPaymentDate = getNextPaymentDate(plan);
        const remainingAmount = getRemainingAmount(plan);
        
        return (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {plan.bookingDetails?.sessionTitle || "Installment Plan"}
                  </CardTitle>
                  <CardDescription>
                    {plan.bookingDetails?.tutorName && `Tutor: ${plan.bookingDetails.tutorName}`}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(plan.status)}>
                  {plan.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Booking Details */}
              {plan.bookingDetails && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(plan.bookingDetails.scheduledAt)}</span>
                  </div>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{plan.paidInstallments}/{plan.installmentCount} payments</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{progressPercentage.toFixed(0)}% complete</span>
                  <span>{remainingAmount.toFixed(2)} {plan.currency} remaining</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-semibold">{plan.totalAmount.toFixed(2)} {plan.currency}</p>
                </div>
                <div>
                  <p className="text-gray-600">Installment</p>
                  <p className="font-semibold">{plan.installmentAmount.toFixed(2)} {plan.currency}</p>
                </div>
                <div>
                  <p className="text-gray-600">Frequency</p>
                  <p className="font-semibold capitalize">{plan.frequency}</p>
                </div>
                <div>
                  <p className="text-gray-600">Started</p>
                  <p className="font-semibold">{formatDate(plan.dueDate)}</p>
                </div>
              </div>

              {/* Next Payment */}
              {plan.status === "PENDING" && nextPaymentDate && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Next Payment:</span>
                    <span>{formatDate(nextPaymentDate.toISOString())}</span>
                  </div>
                </div>
              )}

              {/* Overdue Notice */}
              {plan.status === "OVERDUE" && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Payment overdue</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {(plan.status === "PENDING" || plan.status === "OVERDUE") && (
                <Button 
                  className="w-full" 
                  onClick={() => onMakePayment(plan.id)}
                  disabled={processingPayment === plan.id}
                >
                  {processingPayment === plan.id ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Make Payment ({plan.installmentAmount.toFixed(2)} {plan.currency})
                    </>
                  )}
                </Button>
              )}

              {/* Completed Status */}
              {plan.status === "PAID" && (
                <div className="text-center py-2">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">Plan Completed</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Create Installment Plan Form Component
interface CreateInstallmentPlanFormProps {
  availableBookings: any[];
  onSubmit: (data: CreateInstallmentPlanData) => void;
  loading: boolean;
  onCancel: () => void;
}

function CreateInstallmentPlanForm({ availableBookings, onSubmit, loading, onCancel }: CreateInstallmentPlanFormProps) {
  const [formData, setFormData] = useState({
    bookingId: "",
    installmentCount: 3,
    frequency: "monthly" as "monthly" | "bi-weekly" | "weekly",
    firstPaymentDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedBooking = availableBookings.find(b => b.id === formData.bookingId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="booking">Select Booking</Label>
        <Select value={formData.bookingId} onValueChange={(value) => setFormData({ ...formData, bookingId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a booking" />
          </SelectTrigger>
          <SelectContent>
            {availableBookings.map((booking) => (
              <SelectItem key={booking.id} value={booking.id}>
                {booking.sessionTitle} - {booking.totalAmount.toFixed(2)} {booking.currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBooking && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="space-y-1 text-sm">
            <div><strong>Session:</strong> {selectedBooking.sessionTitle}</div>
            <div><strong>Tutor:</strong> {selectedBooking.tutorName}</div>
            <div><strong>Total Amount:</strong> {selectedBooking.totalAmount.toFixed(2)} {selectedBooking.currency}</div>
            <div><strong>Scheduled:</strong> {new Date(selectedBooking.scheduledAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="installmentCount">Number of Installments</Label>
        <Select 
          value={formData.installmentCount.toString()} 
          onValueChange={(value) => setFormData({ ...formData, installmentCount: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 payments</SelectItem>
            <SelectItem value="3">3 payments</SelectItem>
            <SelectItem value="4">4 payments</SelectItem>
            <SelectItem value="6">6 payments</SelectItem>
            <SelectItem value="12">12 payments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="frequency">Payment Frequency</Label>
        <Select 
          value={formData.frequency} 
          onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="firstPaymentDate">First Payment Date</Label>
        <Input
          id="firstPaymentDate"
          type="date"
          value={formData.firstPaymentDate}
          onChange={(e) => setFormData({ ...formData, firstPaymentDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      {selectedBooking && formData.installmentCount > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="space-y-1 text-sm">
            <div className="font-medium">Payment Summary:</div>
            <div>Each payment: {(selectedBooking.totalAmount / formData.installmentCount).toFixed(2)} {selectedBooking.currency}</div>
            <div>Total payments: {formData.installmentCount}</div>
            <div>Frequency: {formData.frequency}</div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading || !formData.bookingId}>
          {loading ? "Creating..." : "Create Plan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}