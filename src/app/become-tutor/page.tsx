"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  BookOpen, 
  Award,
  Users,
  CheckCircle,
  Shield,
  Video,
  MessageSquare,
  Calendar
} from "lucide-react";

export default function BecomeTutorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subjects: [] as string[],
    experience: "",
    education: "",
    bio: "",
    hourlyRate: "",
    location: "",
    teachingMode: "",
    availability: ""
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Languages",
    "Music", "Art", "Physical Education", "Economics", "Psychology"
  ];

  const experienceLevels = [
    "Less than 1 year", "1-2 years", "3-5 years", "6-10 years", "10+ years"
  ];

  const educationLevels = [
    "High School", "Associate's Degree", "Bachelor's Degree", 
    "Master's Degree", "PhD", "Other"
  ];

  const teachingModes = [
    "Online Only", "In-Person Only", "Both Online and In-Person"
  ];

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Here you would typically submit the data to your API
    console.log("Form submitted:", formData);
    // For now, redirect to verification page
    router.push("/verification");
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.subjects.length > 0 && formData.experience && formData.education;
      case 3:
        return formData.bio && formData.hourlyRate && formData.location;
      case 4:
        return formData.teachingMode && formData.availability;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Become a Tutor</h1>
                <p className="text-gray-600">Join our community of expert educators</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[...Array(totalSteps)].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1 <= step ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Expertise</span>
            <span>Details</span>
            <span>Availability</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {step === 1 && <Users className="h-5 w-5 text-blue-600" />}
                {step === 2 && <BookOpen className="h-5 w-5 text-blue-600" />}
                {step === 3 && <Star className="h-5 w-5 text-blue-600" />}
                {step === 4 && <Calendar className="h-5 w-5 text-blue-600" />}
                <span>
                  {step === 1 && "Personal Information"}
                  {step === 2 && "Teaching Expertise"}
                  {step === 3 && "Professional Details"}
                  {step === 4 && "Availability & Preferences"}
                </span>
              </CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "Share your teaching experience and subjects"}
                {step === 3 && "Provide your professional details and rates"}
                {step === 4 && "Set your availability and teaching preferences"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Teaching Expertise */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label>Subjects You Teach *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {subjects.map((subject) => (
                        <Button
                          key={subject}
                          variant={formData.subjects.includes(subject) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSubjectToggle(subject)}
                          className="justify-start"
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                    {formData.subjects.length === 0 && (
                      <p className="text-sm text-red-600 mt-1">Please select at least one subject</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="experience">Teaching Experience *</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="education">Education Level *</Label>
                    <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your highest education" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Professional Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about your teaching philosophy, experience, and what makes you a great tutor..."
                      className="min-h-24"
                    />
                    <p className="text-sm text-gray-600 mt-1">Minimum 50 characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                        placeholder="50"
                        min="10"
                        max="200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Availability & Preferences */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="teachingMode">Teaching Mode *</Label>
                    <Select value={formData.teachingMode} onValueChange={(value) => handleInputChange("teachingMode", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred teaching mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachingModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability *</Label>
                    <Textarea
                      id="availability"
                      value={formData.availability}
                      onChange={(e) => handleInputChange("availability", e.target.value)}
                      placeholder="Describe your availability (e.g., 'Weekdays after 5 PM, Weekends flexible')"
                      className="min-h-20"
                    />
                  </div>

                  {/* Benefits Section */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Why Join TutorConnect?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span>Competitive compensation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Flexible scheduling</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-blue-600" />
                        <span>Modern teaching tools</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Secure platform</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isStepComplete()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepComplete()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}