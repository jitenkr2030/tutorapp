"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Clock, 
  Trophy, 
  Target, 
  BarChart3,
  Users,
  Star,
  Volume2,
  VolumeX,
  Languages,
  Award,
  TrendingUp
} from "lucide-react";

interface VoiceExercise {
  id: string;
  title: string;
  description: string;
  type: string;
  language: string;
  difficulty: number;
  content: string;
  audioUrl?: string;
  isActive: boolean;
  _count: {
    sessions: number;
    userProgress: number;
  };
}

interface VoiceSession {
  id: string;
  exerciseId: string;
  audioUrl: string;
  transcript?: string;
  accuracy?: number;
  pronunciation?: number;
  fluency?: number;
  feedback?: string;
  score?: number;
  duration?: number;
  exercise: VoiceExercise;
}

interface VoiceProgress {
  id: string;
  exerciseId: string;
  language: string;
  proficiency: string;
  totalScore: number;
  bestScore?: number;
  attempts: number;
  completed: boolean;
  lastAccessed: string;
  streakDays: number;
  exercise: VoiceExercise;
}

interface VoiceAnalytics {
  totalSessions: number;
  totalDuration: number;
  totalScore: number;
  avgAccuracy: number;
  avgPronunciation: number;
  avgFluency: number;
  completedExercises: number;
  totalStreakDays: number;
  languageProgress: Record<string, any>;
  recentActivity: VoiceSession[];
}

interface ProficiencyAssessment {
  level: string;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export function VoiceRecognitionDashboard() {
  const [exercises, setExercises] = useState<VoiceExercise[]>([]);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [progress, setProgress] = useState<VoiceProgress[]>([]);
  const [analytics, setAnalytics] = useState<VoiceAnalytics | null>(null);
  const [proficiency, setProficiency] = useState<ProficiencyAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<VoiceExercise | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("exercises");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetchVoiceData();
  }, []);

  const fetchVoiceData = async () => {
    try {
      setLoading(true);
      
      const [exercisesRes, sessionsRes, progressRes, analyticsRes] = await Promise.all([
        fetch('/api/voice/exercises'),
        fetch('/api/voice/sessions'),
        fetch('/api/voice/progress'),
        fetch('/api/voice/analytics?type=user')
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
      console.error('Error fetching voice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const submitRecording = async () => {
    if (!selectedExercise || !audioBlob) return;

    try {
      setProcessing(true);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Submit to API
        const response = await fetch('/api/voice/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exerciseId: selectedExercise.id,
            audioUrl: base64Audio,
            // Mock data - in real app, this would come from AI processing
            transcript: "This is a simulated transcript of the user's speech.",
            accuracy: 0.85,
            pronunciation: 0.78,
            fluency: 0.82,
            feedback: "Good pronunciation overall. Pay attention to the vowel sounds in the middle of words.",
            score: 82,
            duration: 15
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Voice session created:', data.session);
          
          // Reset state
          setAudioBlob(null);
          setAudioUrl("");
          setSelectedExercise(null);
          
          // Refresh data
          fetchVoiceData();
          
          alert('Voice exercise completed successfully!');
        } else {
          throw new Error('Failed to submit recording');
        }
      };
    } catch (error) {
      console.error('Error submitting recording:', error);
      alert('Error submitting recording. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const assessProficiency = async (language: string) => {
    try {
      const response = await fetch(`/api/voice/analytics?type=proficiency&language=${language}`);
      if (response.ok) {
        const data = await response.json();
        setProficiency(data.analytics);
        setSelectedLanguage(language);
      }
    } catch (error) {
      console.error('Error assessing proficiency:', error);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case 'PRONUNCIATION': return <Volume2 className="h-4 w-4" />;
      case 'CONVERSATION': return <Users className="h-4 w-4" />;
      case 'DICTATION': return <Target className="h-4 w-4" />;
      case 'LISTENING_COMPREHENSION': return <Volume2 className="h-4 w-4" />;
      case 'VOCABULARY_PRACTICE': return <Languages className="h-4 w-4" />;
      case 'GRAMMAR_PRACTICE': return <Target className="h-4 w-4" />;
      default: return <Mic className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading voice recognition data...</p>
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
                {Math.floor(analytics.totalDuration / 60)}m {analytics.totalDuration % 60}s total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.avgAccuracy * 100)}%</div>
              <p className="text-xs text-muted-foreground">
                Pronunciation: {Math.round(analytics.avgPronunciation * 100)}%
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
                {analytics.totalStreakDays} day streak
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
                Fluency: {Math.round(analytics.avgFluency * 100)}%
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
          <TabsTrigger value="proficiency">Proficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Exercises</CardTitle>
              <CardDescription>
                Practice pronunciation, conversation, and language skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {exercises.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No voice exercises available
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
                            <Badge variant="outline">{exercise.language}</Badge>
                            <Badge className={getDifficultyColor(exercise.difficulty)}>
                              Level {exercise.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Content:</strong> {exercise.content}
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
                          <Play className="h-4 w-4 mr-1" />
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
              <CardTitle>Voice Practice</CardTitle>
              <CardDescription>
                Record your voice and get instant feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedExercise ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">{selectedExercise.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedExercise.description}</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{selectedExercise.language}</Badge>
                      <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                        Level {selectedExercise.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm"><strong>Practice text:</strong> {selectedExercise.content}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        onClick={recording ? stopRecording : startRecording}
                        disabled={processing}
                        className={`flex items-center space-x-2 ${
                          recording ? 'bg-red-600 hover:bg-red-700' : ''
                        }`}
                      >
                        {recording ? (
                          <>
                            <MicOff className="h-4 w-4" />
                            <span>Stop Recording</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            <span>Start Recording</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {audioUrl && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-4">
                          <audio controls src={audioUrl} className="w-full max-w-md" />
                        </div>
                        
                        <div className="flex items-center justify-center space-x-4">
                          <Button
                            onClick={submitRecording}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing ? 'Processing...' : 'Submit for Analysis'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setAudioUrl("");
                              setAudioBlob(null);
                            }}
                          >
                            Discard
                          </Button>
                        </div>
                      </div>
                    )}

                    {recording && (
                      <div className="text-center">
                        <div className="animate-pulse text-red-600">
                          <Mic className="h-8 w-8 mx-auto mb-2" />
                          <p>Recording... Speak clearly into your microphone</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                Track your voice learning journey
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
                          <p className="text-sm text-muted-foreground mb-2">{prog.exercise.language}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{prog.attempts} attempts</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Trophy className="h-3 w-3" />
                              <span>Best: {prog.bestScore || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{prog.streakDays} day streak</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm">Total Score: {prog.totalScore}</span>
                            {prog.completed && (
                              <Badge className="bg-green-500">Completed</Badge>
                            )}
                            <Badge variant="outline">{prog.proficiency}</Badge>
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

        <TabsContent value="proficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Proficiency Assessment</CardTitle>
              <CardDescription>
                Get AI-powered assessment of your language skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['ENGLISH', 'SPANISH', 'FRENCH', 'GERMAN'].map((lang) => (
                    <Button
                      key={lang}
                      variant={selectedLanguage === lang ? "default" : "outline"}
                      onClick={() => assessProficiency(lang)}
                      className="h-20 flex flex-col"
                    >
                      <Languages className="h-6 w-6 mb-2" />
                      <span className="text-sm">{lang}</span>
                    </Button>
                  ))}
                </div>

                {proficiency && (
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2">
                          {selectedLanguage} Proficiency
                        </h3>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {proficiency.level}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {Math.round(proficiency.confidence * 100)}%
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                          <ul className="space-y-1">
                            {proficiency.strengths.map((strength, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                • {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-orange-600">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {proficiency.weaknesses.map((weakness, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                • {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-blue-600">Recommendations</h4>
                        <ul className="space-y-1">
                          {proficiency.recommendations.map((recommendation, index) => (
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