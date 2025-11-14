"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  Video, 
  Map,
  Award,
  BookOpen,
  CheckCircle,
  MessageCircle,
  DollarSign,
  Users
} from "lucide-react";

interface Tutor {
  id: string;
  name: string;
  email: string;
  phone: string;
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
  qualifications: Qualification[];
  availability: AvailabilitySlot[];
  reviewsList: Review[];
}

interface Qualification {
  id: string;
  title: string;
  institution: string;
  year: number;
  certificate?: string;
  verified: boolean;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface Review {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  date: string;
  subject: string;
}

export default function TutorProfilePage() {
  const params = useParams();
  const tutorId = params.id as string;

  // Mock data - in real app this would come from API
  const tutor: Tutor = {
    id: tutorId,
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    subject: "Mathematics",
    rating: 4.9,
    reviews: 127,
    experience: 10,
    hourlyRate: 45,
    avatar: "/placeholder-avatar.svg",
    bio: "I am a passionate mathematics educator with over 10 years of teaching experience. I hold a PhD in Mathematics from Stanford University and specialize in Calculus, Algebra, and Statistics. My teaching philosophy focuses on making complex mathematical concepts accessible and enjoyable for students of all levels. I have successfully helped hundreds of students improve their grades and develop a deeper understanding of mathematics.",
    location: "New York, NY",
    verified: true,
    onlineOnly: false,
    inPersonOnly: false,
    subjects: ["Mathematics", "Calculus", "Algebra", "Statistics", "Geometry"],
    qualifications: [
      {
        id: "1",
        title: "PhD in Mathematics",
        institution: "Stanford University",
        year: 2013,
        verified: true
      },
      {
        id: "2",
        title: "Master of Science in Mathematics",
        institution: "MIT",
        year: 2009,
        verified: true
      },
      {
        id: "3",
        title: "Bachelor of Science in Mathematics",
        institution: "UC Berkeley",
        year: 2007,
        verified: true
      },
      {
        id: "4",
        title: "Teaching Certification",
        institution: "State of New York",
        year: 2014,
        verified: true
      }
    ],
    availability: [
      { id: "1", dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00" },
      { id: "2", dayOfWeek: "Tuesday", startTime: "09:00", endTime: "17:00" },
      { id: "3", dayOfWeek: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { id: "4", dayOfWeek: "Thursday", startTime: "09:00", endTime: "17:00" },
      { id: "5", dayOfWeek: "Friday", startTime: "09:00", endTime: "15:00" },
      { id: "6", dayOfWeek: "Saturday", startTime: "10:00", endTime: "14:00" }
    ],
    reviewsList: [
      {
        id: "1",
        studentName: "Emily Chen",
        studentAvatar: "/placeholder-avatar.svg",
        rating: 5,
        comment: "Dr. Johnson is an amazing tutor! She helped me understand calculus concepts that I had been struggling with for months. Her teaching style is clear and patient.",
        date: "2024-01-15",
        subject: "Calculus"
      },
      {
        id: "2",
        studentName: "Michael Rodriguez",
        studentAvatar: "/placeholder-avatar.svg",
        rating: 5,
        comment: "Excellent tutor! Very knowledgeable and explains complex topics in a way that's easy to understand. Highly recommend!",
        date: "2024-01-10",
        subject: "Algebra"
      },
      {
        id: "3",
        studentName: "Sarah Williams",
        studentAvatar: "/placeholder-avatar.svg",
        rating: 4,
        comment: "Great tutor who really knows her stuff. Helped me improve my grade from C to A in statistics. Would definitely recommend.",
        date: "2024-01-05",
        subject: "Statistics"
      },
      {
        id: "4",
        studentName: "David Kim",
        studentAvatar: "/placeholder-avatar.svg",
        rating: 5,
        comment: "Dr. Johnson is fantastic! She's patient, knowledgeable, and really cares about her students' success. Worth every penny!",
        date: "2023-12-28",
        subject: "Geometry"
      },
      {
        id: "5",
        studentName: "Lisa Thompson",
        studentAvatar: "/placeholder-avatar.svg",
        rating: 5,
        comment: "Best math tutor I've ever had! She makes difficult concepts seem easy and is always available for questions.",
        date: "2023-12-20",
        subject: "Mathematics"
      }
    ]
  };

  const [selectedTab, setSelectedTab] = useState("overview");

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const RatingDistribution = () => {
    const ratings = [5, 4, 3, 2, 1];
    const distribution = [98, 2, 0, 0, 0]; // percentage for each rating

    return (
      <div className="space-y-2">
        {ratings.map((rating) => (
          <div key={rating} className="flex items-center space-x-2">
            <span className="text-sm w-8">{rating}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${distribution[ratings.indexOf(rating)]}%` }}
              />
            </div>
            <span className="text-sm w-12 text-right">
              {distribution[ratings.indexOf(rating)]}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={tutor.avatar} alt={tutor.name} />
              <AvatarFallback className="text-2xl">{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{tutor.name}</h1>
                {tutor.verified && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>
              
              <p className="text-xl text-gray-600 mb-3">{tutor.subject}</p>
              
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(tutor.rating)}
                  <span className="font-semibold ml-1">{tutor.rating}</span>
                  <span className="text-gray-500">({tutor.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{tutor.experience} years experience</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{tutor.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-blue-600">
                  ${tutor.hourlyRate}<span className="text-sm font-normal text-gray-600">/hour</span>
                </div>
                <div className="flex items-center space-x-2">
                  {tutor.onlineOnly && <Video className="h-5 w-5 text-blue-600" />}
                  {tutor.inPersonOnly && <Map className="h-5 w-5 text-green-600" />}
                  {!tutor.onlineOnly && !tutor.inPersonOnly && (
                    <>
                      <Video className="h-5 w-5 text-blue-600" />
                      <Map className="h-5 w-5 text-green-600" />
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button size="lg" className="px-8" onClick={() => router.push(`/book/${tutor.id}`)}>
                Book Session
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Subjects I Teach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span>{tutor.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span>{tutor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{tutor.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="qualifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Education & Certifications</CardTitle>
                    <CardDescription>
                      All qualifications have been verified by our team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tutor.qualifications.map((qual) => (
                        <div key={qual.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg">{qual.title}</h3>
                            {qual.verified && (
                              <Badge variant="secondary" className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Verified</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{qual.institution}</p>
                          <p className="text-sm text-gray-500">{qual.year}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="availability" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Availability</CardTitle>
                    <CardDescription>
                      Available time slots for booking sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tutor.availability.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{slot.dayOfWeek}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Session Options</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4" />
                          <span>Online sessions available</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Map className="h-4 w-4" />
                          <span>In-person sessions available within 10 miles</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Minimum session duration: 60 minutes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>
                      Reviews from students who have taken sessions with this tutor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Rating Distribution</h4>
                        <RatingDistribution />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Quick Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Reviews</span>
                            <span className="font-semibold">{tutor.reviews}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Rating</span>
                            <span className="font-semibold">{tutor.rating}/5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Response Rate</span>
                            <span className="font-semibold">98%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-6">
                      {tutor.reviewsList.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={review.studentAvatar} alt={review.studentName} />
                              <AvatarFallback>{review.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold">{review.studentName}</h5>
                                  <p className="text-sm text-gray-500">{review.subject} • {review.date}</p>
                                </div>
                                {renderStars(review.rating)}
                              </div>
                              
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => router.push(`/book/${tutor.id}`)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book a Session
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Video className="h-4 w-4 mr-2" />
                  Trial Session
                </Button>
              </CardContent>
            </Card>
            
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-semibold text-lg">${tutor.hourlyRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Minimum Duration</span>
                  <span className="font-semibold">60 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Package Discount</span>
                  <span className="font-semibold text-green-600">10% off 10+ sessions</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Tutor Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-600">Rating</span>
                  </div>
                  <span className="font-semibold">{tutor.rating}/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">Sessions</span>
                  </div>
                  <span className="font-semibold">500+</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">Students</span>
                  </div>
                  <span className="font-semibold">200+</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-600">Experience</span>
                  </div>
                  <span className="font-semibold">{tutor.experience} years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}