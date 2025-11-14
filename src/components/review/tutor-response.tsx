"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Send, AlertCircle, CheckCircle, MessageSquare, Clock } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  tutorResponse?: string;
  tutorRespondedAt?: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
  session: {
    title: string;
    scheduledAt: string;
  };
}

interface TutorResponseProps {
  review: Review;
  onResponseSubmitted?: () => void;
}

export default function TutorResponse({ review, onResponseSubmitted }: TutorResponseProps) {
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(!review.tutorResponse);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      setError("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const responseApi = await fetch("/api/reviews/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: review.id,
          response: response.trim(),
        }),
      });

      if (!responseApi.ok) {
        const data = await responseApi.json();
        throw new Error(data.error || "Failed to submit response");
      }

      setSuccess(true);
      setIsEditing(false);
      onResponseSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (success) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Response Submitted!</h3>
          <p className="text-gray-600 mb-4">
            Your response has been sent to the student and will be displayed publicly.
          </p>
          <Button onClick={onResponseSubmitted}>
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Student Review</span>
        </CardTitle>
        <CardDescription>
          Respond to this student's feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Original Review */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start space-x-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.student.avatar} alt={review.student.name} />
              <AvatarFallback>{review.student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium">{review.student.name}</h4>
                <div className="flex items-center space-x-1">
                  {renderStars(review.rating)}
                  <Badge variant="secondary" className="text-xs">
                    {review.rating}/5
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{formatDate(review.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Session:</span> {review.session.title}
          </p>
          
          {review.comment && (
            <p className="text-gray-700 italic">"{review.comment}"</p>
          )}
        </div>

        {/* Existing Response */}
        {review.tutorResponse && !isEditing && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Your Response</h4>
              <div className="flex items-center space-x-2">
                {review.tutorRespondedAt && (
                  <span className="text-sm text-blue-700">
                    {formatDate(review.tutorRespondedAt)}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </div>
            </div>
            <p className="text-blue-800">{review.tutorResponse}</p>
          </div>
        )}

        {/* Response Form */}
        {(isEditing || !review.tutorResponse) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Response *
              </label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Thank the student for their feedback and address any specific points they mentioned..."
                rows={4}
                maxLength={1000}
                defaultValue={review.tutorResponse || ""}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {response.length}/1000
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={isSubmitting || !response.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>{review.tutorResponse ? "Update Response" : "Submit Response"}</span>
                  </div>
                )}
              </Button>
              
              {review.tutorResponse && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}