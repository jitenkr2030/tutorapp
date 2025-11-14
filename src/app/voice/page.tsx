"use client";

import { VoiceRecognitionDashboard } from "@/components/voice/voice-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Languages, Target, Award, TrendingUp, Globe } from "lucide-react";

export default function VoiceRecognitionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Voice Recognition for Language Learning</h1>
        <p className="text-xl text-muted-foreground">
          Practice pronunciation, conversation, and language skills with AI-powered voice recognition
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <CardHeader>
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Mic className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Speech Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Advanced AI-powered speech recognition that analyzes your pronunciation, 
              accuracy, and fluency in real-time.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Languages className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Multiple Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Practice speaking in 10 different languages including English, Spanish, 
              French, German, and more.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle>Personalized Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get instant, detailed feedback on your pronunciation and suggestions 
              for improvement tailored to your skill level.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Types */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Exercise Types</CardTitle>
          <CardDescription>
            Different types of voice exercises to improve your language skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Mic className="h-4 w-4 mr-2" />
                Pronunciation Practice
              </h4>
              <p className="text-sm text-muted-foreground">
                Practice pronouncing words and phrases with immediate feedback on accuracy.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Conversation Practice
              </h4>
              <p className="text-sm text-muted-foreground">
                Engage in simulated conversations to improve your speaking fluency.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Dictation Exercises
              </h4>
              <p className="text-sm text-muted-foreground">
                Listen and repeat to improve your listening comprehension and speaking skills.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Mic className="h-4 w-4 mr-2" />
                Listening Comprehension
              </h4>
              <p className="text-sm text-muted-foreground">
                Test your understanding of spoken language through interactive exercises.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Languages className="h-4 w-4 mr-2" />
                Vocabulary Practice
              </h4>
              <p className="text-sm text-muted-foreground">
                Learn and practice new vocabulary with voice recognition feedback.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Grammar Practice
              </h4>
              <p className="text-sm text-muted-foreground">
                Improve your grammar through speaking exercises with real-time correction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Languages */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
          <CardDescription>
            Practice speaking in these languages with our voice recognition system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic'].map((lang) => (
              <div key={lang} className="text-center p-3 border rounded-lg">
                <Languages className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium">{lang}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Progress Tracking</span>
          </CardTitle>
          <CardDescription>
            Monitor your improvement with detailed analytics and proficiency assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <h4 className="font-semibold">Detailed Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Track accuracy, pronunciation, fluency, and improvement over time
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <h4 className="font-semibold">Proficiency Levels</h4>
              <p className="text-sm text-muted-foreground">
                Get assessed from Beginner to Native level with confidence scores
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <h4 className="font-semibold">Streak Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Maintain daily practice streaks and build consistent learning habits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <VoiceRecognitionDashboard />
    </div>
  );
}