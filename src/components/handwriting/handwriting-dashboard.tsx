"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PenTool, 
  Upload, 
  Camera, 
  FileImage, 
  Calculator, 
  BookOpen, 
  Trophy, 
  Target, 
  BarChart3,
  Users,
  Star,
  CheckCircle,
  XCircle,
  TrendingUp,
  Zap,
  Award,
  Lightbulb
} from "lucide-react";

interface HandwritingExercise {
  id: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  difficulty: string;
  content: string;
  referenceUrl?: string;
  isActive: boolean;
  _count: {
    sessions: number;
    userProgress: number;
  };
}

interface HandwritingSession {
  id: string;
  exerciseId: string;
  imageUrl: string;
  transcript?: string;
  confidence?: number;
  accuracy?: number;
  feedback?: string;
  score?: number;
  processingTime?: number;
  exercise: HandwritingExercise;
}

interface HandwritingProgress {
  id: string;
  exerciseId: string;
  subject: string;
  totalScore: number;
  bestScore?: number;
  attempts: number;
  completed: boolean;
  lastAccessed: string;
  accuracy?: number;
  improvement?: number;
  exercise: HandwritingExercise;
}

interface HandwritingAnalytics {
  totalSessions: number;
  totalProcessingTime: number;
  totalScore: number;
  avgConfidence: number;
  avgAccuracy: number;
  completedExercises: number;
  totalImprovement: number;
  subjectProgress: Record<string, any>;
  recentActivity: HandwritingSession[];
}

interface QualityAssessment {
  overallScore: number;
  legibility: number;
  consistency: number;
  neatness: number;
  feedback: string;
  recommendations: string[];
}

export function HandwritingRecognitionDashboard() {
  const [exercises, setExercises] = useState<HandwritingExercise[]>([]);
  const [sessions, setSessions] = useState<HandwritingSession[]>([]);
  const [progress, setProgress] = useState<HandwritingProgress[]>([]);
  const [analytics, setAnalytics] = useState<HandwritingAnalytics | null>(null);
  const [quality, setQuality] = useState<QualityAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<HandwritingExercise | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("exercises");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHandwritingData();
  }, []);

  const fetchHandwritingData = async () => {
    try {
      setLoading(true);
      
      const [exercisesRes, sessionsRes, progressRes, analyticsRes] = await Promise.all([
        fetch('/api/handwriting/exercises'),
        fetch('/api/handwriting/sessions'),
        fetch('/api/handwriting/progress'),
        fetch('/api/handwriting/analytics?type=user')
      ]);

      const [exercisesData, sessionsData, progressData, analyticsData] = await Promise.all([
        exercisesRes.json(),
        sessionsRes.json(),
        progressRes.json(),
        analyticsRes.json()
      ]);

      setExercises(exercisesData.exercises || []);
      setSessions(sessionsData.sessions || []);
      setProgress(progressData.progress || []);
      setAnalytics(analyticsData.analytics || null);
    } catch (error) {
      console.error('Error fetching handwriting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const submitHandwriting = async () => {
    if (!selectedExercise || !selectedImage) return;

    try {
      setProcessing(true);

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        // Submit to API
        const response = await fetch('/api/handwriting/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exerciseId: selectedExercise.id,
            imageUrl: base64Image,
            // Mock data - in real app, this would come from AI processing
            transcript: "Sample recognized text from handwriting",
            confidence: 0.85,
            accuracy: 0.82,
            feedback: "Good handwriting overall. Some letters could be formed more clearly.",
            score: 82,
            processingTime: 1500
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Handwriting session created:', data.session);
          
          // Set recognition result for display
          setRecognitionResult({
            transcript: "Sample recognized text from handwriting",
            confidence: 0.85,
            accuracy: 0.82,
            feedback: "Good handwriting overall. Some letters could be formed more clearly.",
            score: 82,
            processingTime: 1500
          });
          
          // Reset state
          setSelectedImage(null);
          setImageUrl("");
          
          // Refresh data
          fetchHandwritingData();
        } else {
          throw new Error('Failed to submit handwriting');
        }
      };
    } catch (error) {
      console.error('Error submitting handwriting:', error);
      alert('Error submitting handwriting. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const assessQuality = async (subject: string) => {
    try {
      const response = await fetch(`/api/handwriting/analytics?type=quality&subject=${subject}`);
      if (response.ok) {
        const data = await response.json();
        setQuality(data.analytics);
        setSelectedSubject(subject);
      }
    } catch (error) {
      console.error('Error assessing quality:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BASIC': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-800';
      case 'ADVANCED': return 'bg-yellow-100 text-yellow-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case 'MATH_EQUATION': return <Calculator className="h-4 w-4" />;
      case 'NOTE_TAKING': return <BookOpen className="h-4 w-4" />;
      case 'DIAGRAM_DRAWING': return <FileImage className="h-4 w-4" />;
      case 'CHEMISTRY_FORMULA': return <Zap className="h-4 w-4" />;
      case 'PHYSICS_DIAGRAM': return <FileImage className="h-4 w-4" />;
      case 'HANDWRITING_PRACTICE': return <PenTool className="h-4 w-4" />;
      case 'SIGNATURE_RECOGNITION': return <PenTool className="h-4 w-4" />;
      default: return <PenTool className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading handwriting recognition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                {Math.floor(analytics.totalProcessingTime / 1000)}s total processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.avgConfidence * 100)}%</div>
              <p className="text-xs text-muted-foreground">
                Accuracy: {Math.round(analytics.avgAccuracy * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completedExercises}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(analytics.totalImprovement)}% improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.totalScore / Math.max(analytics.totalSessions, 1))}</div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Handwriting Exercises</CardTitle>
              <CardDescription>
                Practice math equations, note-taking, diagrams, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {exercises.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No handwriting exercises available
                  </p>
                ) : (
                  exercises.map((exercise) => (
                    <Card key={exercise.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getExerciseTypeIcon(exercise.type)}
                            <h4 className="font-semibold">{exercise.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{exercise.subject}</Badge>
                            <Badge className={getDifficultyColor(exercise.difficulty)}>
                              {exercise.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Task:</strong> {exercise.content}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{exercise._count.sessions} attempts</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedExercise(exercise);
                            setActiveTab("practice");
                          }}
                          className="ml-4"
                        >
                          <PenTool className="h-4 w-4 mr-1" />
                          Practice
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Handwriting Practice</CardTitle>
              <CardDescription>
                Upload your handwritten work for AI analysis and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedExercise ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">{selectedExercise.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedExercise.description}</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{selectedExercise.subject}</Badge>
                      <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                        {selectedExercise.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm"><strong>Instructions:</strong> {selectedExercise.content}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={processing}
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <Button
                        onClick={() => {
                          // In a real app, this would open camera
                          alert('Camera integration would be implemented here');
                        }}
                        disabled={processing}
                        variant="outline"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {imageUrl && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <img 
                            src={imageUrl} 
                            alt="Handwriting sample" 
                            className="max-w-md max-h-64 object-contain border rounded-lg"
                          />
                        </div>
                        
                        <div className="flex items-center justify-center space-x-4">
                          <Button
                            onClick={submitHandwriting}
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {processing ? 'Processing...' : 'Analyze Handwriting'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setImageUrl("");
                              setSelectedImage(null);
                              setRecognitionResult(null);
                            }}
                          >
                            Discard
                          </Button>
                        </div>
                      </div>
                    )}

                    {recognitionResult && (
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Analysis Results</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Recognition</h5>
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Transcript:</strong> {recognitionResult.transcript}
                            </p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Confidence:</span>
                                <span>{Math.round(recognitionResult.confidence * 100)}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Accuracy:</span>
                                <span>{Math.round(recognitionResult.accuracy * 100)}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Score:</span>
                                <span>{recognitionResult.score}/100</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-2">Feedback</h5>
                            <p className="text-sm text-muted-foreground mb-2">
                              {recognitionResult.feedback}
                            </p>
                            <div className="flex items-center space-x-2">
                              {recognitionResult.score >= 80 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm">
                                {recognitionResult.score >= 80 ? 'Excellent work!' : 'Keep practicing!'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <PenTool className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select an exercise from the Exercises tab to start practicing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>
                Track your handwriting learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {progress.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No progress yet. Start practicing to see your progress here!
                  </p>
                ) : (
                  progress.map((prog) => (
                    <Card key={prog.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{prog.exercise.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{prog.exercise.subject}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{prog.attempts} attempts</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Trophy className="h-3 w-3" />
                              <span>Best: {prog.bestScore || 0}</span>
                            </div>
                            {prog.improvement && (
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{Math.round(prog.improvement)}% improvement</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm">Total Score: {prog.totalScore}</span>
                            {prog.completed && (
                              <Badge className="bg-green-500">Completed</Badge>
                            )}
                            {prog.accuracy && (
                              <Badge variant="outline">{Math.round(prog.accuracy * 100)}% accuracy</Badge>
                            )}
                          </div>
                          <Progress value={(prog.totalScore / Math.max(prog.attempts, 1)) / 100 * 100} className="mt-2" />
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Handwriting Quality Assessment</CardTitle>
              <CardDescription>
                Get AI-powered assessment of your handwriting quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['MATHEMATICS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'GENERAL_NOTES', 'SIGNATURE'].map((subj) => (
                    <Button
                      key={subj}
                      variant={selectedSubject === subj ? "default" : "outline"}
                      onClick={() => assessQuality(subj)}
                      className="h-20 flex flex-col"
                    >
                      <PenTool className="h-6 w-6 mb-2" />
                      <span className="text-sm">{subj.replace('_', ' ')}</span>
                    </Button>
                  ))}
                </div>

                {quality && (
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2">
                          {selectedSubject.replace('_', ' ')} Handwriting Quality
                        </h3>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {Math.round(quality.overallScore)}%
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {quality.feedback}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {Math.round(quality.legibility * 100)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Legibility</p>
                          <Progress value={quality.legibility * 100} className="mt-2" />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {Math.round(quality.consistency * 100)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Consistency</p>
                          <Progress value={quality.consistency * 100} className="mt-2" />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {Math.round(quality.neatness * 100)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Neatness</p>
                          <Progress value={quality.neatness * 100} className="mt-2" />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-blue-600">Recommendations</h4>
                        <ul className="space-y-1">
                          {quality.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}