'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Star, 
  Clock, 
  DollarSign, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Target
} from 'lucide-react';

interface Tutor {
  id: string;
  name: string;
  hourlyRate: number;
  experience: number;
  subjects: string[];
  qualifications: Array<{ title: string; institution: string }>;
  rating: number;
  totalSessions: number;
  availability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
}

interface Recommendation {
  tutorId: string;
  matchScore: number;
  reasoning: string;
  strengths: string[];
  considerations: string[];
  tutor: Tutor | null;
}

interface SmartMatchingProps {
  studentId?: string;
  onMatchSelect?: (tutorId: string) => void;
}

export default function SmartMatching({ studentId, onMatchSelect }: SmartMatchingProps) {
  const [preferences, setPreferences] = useState({
    subject: '',
    level: '',
    budget: '',
    availability: '',
    learningStyle: '',
    goals: ''
  });

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchingFactors, setMatchingFactors] = useState<string[]>([]);
  const [additionalRecommendations, setAdditionalRecommendations] = useState<string[]>([]);

  const handleSmartMatch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          preferences,
          subject: preferences.subject,
          level: preferences.level,
          budget: preferences.budget ? parseFloat(preferences.budget) : undefined,
          availability: preferences.availability
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setMatchingFactors(data.matchingFactors);
      setAdditionalRecommendations(data.additionalRecommendations);
    } catch (error) {
      console.error('Error getting smart matching:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDayOfWeek = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <div className="space-y-6">
      {/* Matching Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            AI-Powered Tutor Matching
          </CardTitle>
          <CardDescription>
            Tell us your learning preferences and our AI will find the perfect tutor match for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={preferences.subject} onValueChange={(value) => setPreferences(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select value={preferences.level} onValueChange={(value) => setPreferences(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Budget (per hour)</label>
              <Input
                type="number"
                placeholder="50"
                value={preferences.budget}
                onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Availability</label>
              <Select value={preferences.availability} onValueChange={(value) => setPreferences(prev => ({ ...prev, availability: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="evenings">Evenings</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Learning Style</label>
            <Textarea
              placeholder="Describe your learning style (e.g., visual, hands-on, theoretical...)"
              value={preferences.learningStyle}
              onChange={(e) => setPreferences(prev => ({ ...prev, learningStyle: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Learning Goals</label>
            <Textarea
              placeholder="What do you want to achieve? (e.g., improve grades, prepare for exams, learn new skills...)"
              value={preferences.goals}
              onChange={(e) => setPreferences(prev => ({ ...prev, goals: e.target.value }))}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSmartMatch} 
            disabled={loading || !preferences.subject}
            className="w-full"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Finding Perfect Matches...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find My Perfect Tutor
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Matching Results */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          {/* Matching Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Matching Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {matchingFactors.map((factor, index) => (
                  <Badge key={index} variant="secondary">
                    {factor}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <Card key={recommendation.tutorId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`/api/placeholder/avatar/${recommendation.tutorId}`} />
                        <AvatarFallback>
                          {recommendation.tutor?.name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {recommendation.tutor?.name || 'Tutor'}
                          <Badge className={`text-sm ${getScoreColor(recommendation.matchScore)}`}>
                            {recommendation.matchScore}% Match
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {recommendation.tutor?.subjects?.join(', ') || 'Multiple Subjects'}
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      onClick={() => onMatchSelect?.(recommendation.tutorId)}
                      className="shrink-0"
                    >
                      Select Tutor
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendation.tutor && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{recommendation.tutor.rating.toFixed(1)} Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{recommendation.tutor.experience} years exp.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>${recommendation.tutor.hourlyRate}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span>{recommendation.tutor.totalSessions} sessions</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Why This Match Works
                    </h4>
                    <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-700">Strengths</h4>
                      <ul className="text-sm space-y-1">
                        {recommendation.strengths.map((strength, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-yellow-700">Considerations</h4>
                      <ul className="text-sm space-y-1">
                        {recommendation.considerations.map((consideration, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-yellow-500" />
                            {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {recommendation.tutor?.availability && (
                    <div>
                      <h4 className="font-medium mb-2">Available Times</h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.tutor.availability.slice(0, 4).map((avail, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {formatDayOfWeek(avail.dayOfWeek)} {avail.startTime}-{avail.endTime}
                          </Badge>
                        ))}
                        {recommendation.tutor.availability.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{recommendation.tutor.availability.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {additionalRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}