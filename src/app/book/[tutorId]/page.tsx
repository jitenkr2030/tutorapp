"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Video, 
  Map,
  CheckCircle,
  DollarSign,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import StripeElements from "@/components/payment/stripe-elements";

interface Tutor {
  id: string;
  name: string;
  subject: string;
  rating: number;
  reviews: number;
  experience: number;
  hourlyRate: number;
  avatar: string;
  bio: string;
  location: string;
  verified: boolean;
  onlineOnly: boolean;
  inPersonOnly: boolean;
  subjects: string[];
}

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingFormData {
  selectedDate: Date | undefined;
  selectedTime: string;
  duration: number;
  sessionType: "online" | "in-person";
  location: string;
  message: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params.tutorId as string;
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: undefined,
    selectedTime: "",
    duration: 60,
    sessionType: "online",
    location: "",
    message: "",
    studentName: "",
    studentEmail: "",
    studentPhone: ""
  });

  // Mock tutor data
  const tutor: Tutor = {
    id: tutorId,
    name: "Dr. Sarah Johnson",
    subject: "Mathematics",
    rating: 4.9,
    reviews: 127,
    experience: 10,
    hourlyRate: 45,
    avatar: "/placeholder-avatar.svg",
    bio: "PhD in Mathematics with 10+ years of teaching experience.",
    location: "New York, NY",
    verified: true,
    onlineOnly: false,
    inPersonOnly: false,
    subjects: ["Mathematics", "Calculus", "Algebra"]
  };

  // Mock availability data
  const timeSlots: TimeSlot[] = [
    { id: "1", dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", available: true },
    { id: "2", dayOfWeek: "Monday", startTime: "10:00", endTime: "11:00", available: true },
    { id: "3", dayOfWeek: "Monday", startTime: "11:00", endTime: "12:00", available: false },
    { id: "4", dayOfWeek: "Monday", startTime: "14:00", endTime: "15:00", available: true },
    { id: "5", dayOfWeek: "Monday", startTime: "15:00", endTime: "16:00", available: true },
    { id: "6", dayOfWeek: "Tuesday", startTime: "09:00", endTime: "10:00", available: true },
    { id: "7", dayOfWeek: "Tuesday", startTime: "10:00", endTime: "11:00", available: true },
    { id: "8", dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:00", available: true },
    { id: "9", dayOfWeek: "Thursday", startTime: "09:00", endTime: "10:00", available: true },
    { id: "10", dayOfWeek: "Friday", startTime: "09:00", endTime: "10:00", available: true }
  ];

  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return [];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek && slot.available);
  };

  const calculateTotalPrice = () => {
    return (formData.duration / 60) * tutor.hourlyRate;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: "" }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, selectedTime: time }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // In a real app, this would submit the booking to the backend
    console.log("Booking submitted:", formData);
    const transactionId = "txn_" + Date.now();
    router.push(`/payment/success/${transactionId}`);
  };

  const isStep1Complete = formData.selectedDate && formData.selectedTime;
  const isStep2Complete = formData.studentName && formData.studentEmail && formData.sessionType;

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
            <h1 className="text-2xl font-bold">Book a Session</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {stepNumber}
                    </div>
                    <span className={`ml-2 text-sm ${
                      step >= stepNumber ? "text-blue-600 font-semibold" : "text-gray-500"
                    }`}>
                      {stepNumber === 1 ? "Select Time" : stepNumber === 2 ? "Your Details" : "Confirm & Pay"}
                    </span>
                    {stepNumber < 3 && (
                      <div className={`w-16 h-1 mx-4 ${
                        step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Select Date & Time</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div>
                      <h3 className="font-medium mb-3">Choose Date</h3>
                      <Calendar
                        mode="single"
                        selected={formData.selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const today = new Date();
                          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                          const hasAvailableSlots = timeSlots.some(slot => 
                            slot.dayOfWeek === dayOfWeek && slot.available
                          );
                          return date < today || !hasAvailableSlots;
                        }}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <h3 className="font-medium mb-3">Available Times</h3>
                      {formData.selectedDate ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {getAvailableTimesForDate(formData.selectedDate).length > 0 ? (
                            getAvailableTimesForDate(formData.selectedDate).map((slot) => (
                              <Button
                                key={slot.id}
                                variant={formData.selectedTime === slot.startTime ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => handleTimeSelect(slot.startTime)}
                              >
                                {slot.startTime} - {slot.endTime}
                              </Button>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p>No available slots for this date</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                          <p>Select a date to see available times</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Session Duration</h3>
                    <Select value={formData.duration.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Your Information</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <Input
                          value={formData.studentName}
                          onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email Address *</label>
                        <Input
                          type="email"
                          value={formData.studentEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <Input
                        type="tel"
                        value={formData.studentPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentPhone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Session Type *</label>
                      <Select value={formData.sessionType} onValueChange={(value: "online" | "in-person") => setFormData(prev => ({ ...prev, sessionType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online Session</SelectItem>
                          <SelectItem value="in-person">In-Person Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.sessionType === "in-person" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Enter preferred location or address"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1">Message to Tutor (Optional)</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Let the tutor know what you'd like to focus on..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Confirm & Pay</h2>
                  
                  <div className="space-y-6">
                    {/* Booking Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={tutor.avatar} alt={tutor.name} />
                            <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{tutor.name}</h3>
                            <p className="text-sm text-gray-600">{tutor.subject}</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium">
                              {formData.selectedDate?.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-medium">{formData.selectedTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">{formData.duration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Session Type</span>
                            <span className="font-medium">
                              {formData.sessionType === "online" ? "Online" : "In-Person"}
                            </span>
                          </div>
                          {formData.sessionType === "in-person" && formData.location && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Location</span>
                              <span className="font-medium">{formData.location}</span>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-2xl font-bold text-blue-600">
                            ${calculateTotalPrice()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Student Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name</span>
                            <span className="font-medium">{formData.studentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="font-medium">{formData.studentEmail}</span>
                          </div>
                          {formData.studentPhone && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone</span>
                              <span className="font-medium">{formData.studentPhone}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>
                          Choose how you'd like to pay for this session
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StripeElements
                          bookingId="booking_temp" // This would be created when booking is submitted
                          amount={calculateTotalPrice()}
                          onSuccess={(paymentIntentId) => {
                            console.log("Payment successful:", paymentIntentId);
                            handleSubmit();
                          }}
                          onError={(error) => {
                            console.error("Payment failed:", error);
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={step === 1 ? !isStep1Complete : !isStep2Complete}
                  >
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} size="lg">
                    Confirm & Pay ${calculateTotalPrice()}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tutor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Tutor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={tutor.avatar} alt={tutor.name} />
                    <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{tutor.name}</h3>
                    <p className="text-sm text-gray-600">{tutor.subject}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">{tutor.rating} ({tutor.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{tutor.experience} years experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{tutor.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-medium">${tutor.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{formData.duration} minutes</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${calculateTotalPrice()}
                  </span>
                </div>
                {formData.duration >= 120 && (
                  <div className="text-sm text-green-600">
                    ✓ 10% discount applied for sessions 2+ hours
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>One-on-one tutoring session</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Customized learning plan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Session recording (online)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Free cancellation up to 24h before</span>
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