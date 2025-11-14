"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  Video,
  DollarSign,
  ArrowLeft,
  Receipt,
  Share
} from "lucide-react";

interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
  session: {
    tutor: {
      id: string;
      name: string;
      subject: string;
      avatar: string;
    };
    student: {
      name: string;
      email: string;
    };
    date: string;
    time: string;
    duration: number;
    type: "online" | "in-person";
    location?: string;
  };
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.transactionId as string;
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock transaction data - in real app this would come from API
    const mockTransaction: Transaction = {
      id: transactionId || "txn_123456789",
      bookingId: "booking_123456789",
      amount: 90.00,
      currency: "USD",
      status: "COMPLETED",
      paymentMethod: "Credit Card",
      transactionId: "ch_12345678901234567890",
      paidAt: new Date().toISOString(),
      session: {
        tutor: {
          id: "1",
          name: "Dr. Sarah Johnson",
          subject: "Mathematics",
          avatar: "/placeholder-avatar.svg"
        },
        student: {
          name: "John Doe",
          email: "john.doe@email.com"
        },
        date: "2024-01-20",
        time: "14:00",
        duration: 120,
        type: "online",
        location: "Zoom Meeting"
      }
    };

    // Simulate API call
    setTimeout(() => {
      setTransaction(mockTransaction);
      setLoading(false);
    }, 1000);
  }, [transactionId]);

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert("Receipt downloaded successfully!");
  };

  const handleShareReceipt = () => {
    // In a real app, this would share the receipt
    alert("Receipt sharing functionality would be implemented here!");
  };

  const handleViewBooking = () => {
    router.push("/dashboard/student/bookings");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Transaction not found</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Payment Successful</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h2>
                <p className="text-green-700">
                  Your payment has been processed successfully. A confirmation email has been sent to {transaction.session.student.email}.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5" />
                    <span>Transaction Details</span>
                  </CardTitle>
                  <CardDescription>Payment information and receipt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-mono text-sm">{transaction.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-medium">{new Date(transaction.paidAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium">{transaction.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Information</CardTitle>
                  <CardDescription>Details about your booked session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={transaction.session.tutor.avatar} alt={transaction.session.tutor.name} />
                      <AvatarFallback>{transaction.session.tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{transaction.session.tutor.name}</h3>
                      <p className="text-gray-600">{transaction.session.tutor.subject}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Date</span>
                      </div>
                      <p className="font-medium ml-6">{transaction.session.date}</p>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Time</span>
                      </div>
                      <p className="font-medium ml-6">{transaction.session.time}</p>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Duration</span>
                      </div>
                      <p className="font-medium ml-6">{transaction.session.duration} minutes</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        {transaction.session.type === "online" ? (
                          <Video className="h-4 w-4 text-gray-500" />
                        ) : (
                          <MapPin className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-600">Session Type</span>
                      </div>
                      <p className="font-medium ml-6 capitalize">{transaction.session.type}</p>
                      
                      {transaction.session.location && (
                        <>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Location</span>
                          </div>
                          <p className="font-medium ml-6">{transaction.session.location}</p>
                        </>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Amount Paid</span>
                      </div>
                      <p className="font-medium ml-6">${transaction.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{transaction.session.student.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{transaction.session.student.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Paid</span>
                    <span className="text-xl font-bold text-green-600">
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Receipt Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={handleDownloadReceipt}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleShareReceipt}>
                    <Share className="h-4 w-4 mr-2" />
                    Share Receipt
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleViewBooking}>
                    View Booking Details
                  </Button>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Check your email for session confirmation and meeting link</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Add the session to your calendar</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Prepare any questions or materials for the session</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Join the session 5 minutes before scheduled time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    If you have any questions about your booking or payment, our support team is here to help.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}