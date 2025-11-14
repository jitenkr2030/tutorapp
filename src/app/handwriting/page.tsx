"use client";

import { HandwritingRecognitionDashboard } from "@/components/handwriting/handwriting-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, Calculator, BookOpen, FileImage, Trophy, Target, TrendingUp, Lightbulb } from "lucide-react";

export default function HandwritingRecognitionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Handwriting Recognition for Math & Notes</h1>
        <p className="text-xl text-muted-foreground">
          Transform handwritten math equations, notes, and diagrams into digital text with AI-powered recognition
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardHeader>
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <PenTool className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Smart Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Advanced AI that recognizes handwritten text, math equations, and diagrams 
              with high accuracy and confidence scoring.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Math Equation Solving</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Write math equations and get instant solutions with step-by-step explanations 
              and verification of your work.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle>Note Digitization</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Convert handwritten notes into searchable, editable text while preserving 
              your original writing style and structure.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Types */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Supported Exercise Types</CardTitle>
          <CardDescription>
            Different types of handwriting recognition for various learning needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Math Equations
              </h4>
              <p className="text-sm text-muted-foreground">
                Write and solve mathematical equations with step-by-step solutions.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Note Taking
              </h4>
              <p className="text-sm text-muted-foreground">
                Convert handwritten notes into digital text for easy searching and editing.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <FileImage className="h-4 w-4 mr-2" />
                Diagram Drawing
              </h4>
              <p className="text-sm text-muted-foreground">
                Draw and label diagrams for biology, physics, and other subjects.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <PenTool className="h-4 w-4 mr-2" />
                Handwriting Practice
              </h4>
              <p className="text-sm text-muted-foreground">
                Improve penmanship with personalized feedback and quality assessments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Subjects */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Supported Subjects</CardTitle>
          <CardDescription>
            Handwriting recognition tailored for different academic subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'General Notes', 'Signature'].map((subj) => (
              <div key={subj} className="text-center p-3 border rounded-lg">
                <PenTool className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium">{subj}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Assessment */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Handwriting Quality Assessment</span>
          </CardTitle>
          <CardDescription>
            Get detailed analysis of your handwriting quality with personalized improvement recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h4 className="font-semibold">Quality Metrics</h4>
              <p className="text-sm text-muted-foreground">
                Analyze legibility, consistency, and neatness with detailed scoring
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h4 className="font-semibold">Progress Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Monitor improvement over time with detailed progress analytics
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💡</div>
              <h4 className="font-semibold">Personalized Tips</h4>
              <p className="text-sm text-muted-foreground">
                Get customized recommendations to improve your handwriting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>AI-Powered Features</span>
          </CardTitle>
          <CardDescription>
            Advanced artificial intelligence capabilities for intelligent handwriting analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">High Accuracy Recognition</h4>
                  <p className="text-sm text-muted-foreground">
                    State-of-the-art AI models achieve over 90% accuracy in text and equation recognition
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Real-time Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Instant analysis and feedback with processing times under 2 seconds
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calculator className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Mathematical Intelligence</h4>
                  <p className="text-sm text-muted-foreground">
                    Understands and solves complex mathematical equations with step-by-step explanations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Trophy className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Adaptive Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Learns from your writing style to provide increasingly accurate recognition over time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <HandwritingRecognitionDashboard />
    </div>
  );
}