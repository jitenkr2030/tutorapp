"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

interface PaymentMethodsProps {
  onPaymentMethodSelect?: (methodId: string) => void;
  selectedMethodId?: string;
}

export default function PaymentMethods({ onPaymentMethodSelect, selectedMethodId }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payments/methods");
      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch("/api/payments/methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add payment method");
      }

      await fetchPaymentMethods();
      setShowAddDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add payment method");
    }
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/payments/methods?paymentMethodId=${methodId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove payment method");
      }

      await fetchPaymentMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove payment method");
    }
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      case "discover":
        return "💳";
      default:
        return "💳";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage your saved payment methods
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Use the Stripe Elements form below to add a new payment method.
                </DialogDescription>
              </DialogHeader>
              <AddPaymentMethodForm
                onSuccess={(paymentMethodId) => {
                  handleAddPaymentMethod(paymentMethodId);
                }}
                onError={(err) => setError(err)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4" />
            <p>No payment methods saved</p>
            <p className="text-sm">Add a payment method to make future payments faster</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethodId === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onPaymentMethodSelect?.(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCardBrandIcon(method.card.brand)}</span>
                  <div>
                    <div className="font-medium capitalize">{method.card.brand}</div>
                    <div className="text-sm text-gray-600">
                      •••• {method.card.last4} • Exp {method.card.expMonth}/{method.card.expYear}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedMethodId === method.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePaymentMethod(method.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add Payment Method Form Component
function AddPaymentMethodForm({
  onSuccess,
  onError,
}: {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMethod = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // This would typically integrate with Stripe Elements
      // For now, we'll simulate the process
      setTimeout(() => {
        onSuccess("pm_" + Math.random().toString(36).substr(2, 9));
        setIsProcessing(false);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add payment method";
      setError(errorMessage);
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-4">
          Stripe Elements integration would go here
        </p>
        <Button onClick={handleAddMethod} disabled={isProcessing}>
          {isProcessing ? "Adding..." : "Add Payment Method"}
        </Button>
      </div>
    </div>
  );
}