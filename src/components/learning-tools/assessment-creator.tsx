"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Eye, Clock, Target, FileText } from "lucide-react";

interface Question {
  id: string;
  content: string;
  type: string;
  points: number;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Assessment {
  title: string;
  description: string;
  type: string;
  subject: string;
  grade: string;
  timeLimit: number | null;
  instructions: string;
  allowRetake: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
  questions: Question[];
}

export default function AssessmentCreator() {
  const [assessment, setAssessment] = useState<Assessment>({
    title: "",
    description: "",
    type: "QUIZ",
    subject: "",
    grade: "",
    timeLimit: null,
    instructions: "",
    allowRetake: false,
    shuffleQuestions: false,
    showResults: true,
    questions: [],
  });

  const [activeTab, setActiveTab] = useState("details");

  const questionTypes = [
    { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
    { value: "TRUE_FALSE", label: "True/False" },
    { value: "SHORT_ANSWER", label: "Short Answer" },
    { value: "ESSAY", label: "Essay" },
    { value: "FILL_IN_BLANK", label: "Fill in the Blank" },
    { value: "MATCHING", label: "Matching" },
  ];

  const assessmentTypes = [
    { value: "QUIZ", label: "Quiz" },
    { value: "TEST", label: "Test" },
    { value: "ASSIGNMENT", label: "Assignment" },
    { value: "EXAM", label: "Exam" },
  ];

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Languages"
  ];

  const grades = [
    "K-1", "2-3", "4-5", "6-8", "9-10", "11-12", "College", "Adult"
  ];

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      content: "",
      type: "MULTIPLE_CHOICE",
      points: 1,
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    };
    setAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (questionId: string) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const addOption = (questionId: string) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q
      )
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = q.options.filter((_, i) => i !== optionIndex);
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const calculateTotalPoints = () => {
    return assessment.questions.reduce((total, q) => total + q.points, 0);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessment),
      });

      if (response.ok) {
        alert("Assessment saved successfully!");
      } else {
        alert("Failed to save assessment");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Error saving assessment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Assessment</h1>
          <p className="text-gray-600">Create quizzes, tests, and assignments for your students</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>{calculateTotalPoints()} points</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>{assessment.questions.length} questions</span>
          </Badge>
          {assessment.timeLimit && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{assessment.timeLimit} min</span>
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>Basic information about your assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter assessment title"
                    value={assessment.title}
                    onChange={(e) => setAssessment(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={assessment.type} onValueChange={(value) => setAssessment(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter assessment description"
                  value={assessment.description}
                  onChange={(e) => setAssessment(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={assessment.subject} onValueChange={(value) => setAssessment(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade Level</Label>
                  <Select value={assessment.grade} onValueChange={(value) => setAssessment(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Enter instructions for students"
                  value={assessment.instructions}
                  onChange={(e) => setAssessment(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Questions</h2>
            <Button onClick={addQuestion} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </Button>
          </div>

          {assessment.questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No questions yet</p>
                <Button onClick={addQuestion}>Add Your First Question</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assessment.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateQuestion(question.id, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, "points", parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        placeholder="Enter your question"
                        value={question.content}
                        onChange={(e) => updateQuestion(question.id, "content", e.target.value)}
                        rows={3}
                      />
                    </div>

                    {question.type === "MULTIPLE_CHOICE" && (
                      <div className="space-y-3">
                        <Label>Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Input
                              placeholder={`Option ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(question.id, optionIndex)}
                              disabled={question.options.length <= 2}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(question.id)}
                          className="flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Option</span>
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Input
                          placeholder="Enter correct answer"
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Explanation (Optional)</Label>
                        <Input
                          placeholder="Explain the correct answer"
                          value={question.explanation}
                          onChange={(e) => updateQuestion(question.id, "explanation", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Settings</CardTitle>
              <CardDescription>Configure assessment options and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  placeholder="Leave empty for no time limit"
                  value={assessment.timeLimit || ""}
                  onChange={(e) => setAssessment(prev => ({ 
                    ...prev, 
                    timeLimit: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Retakes</Label>
                    <p className="text-sm text-gray-500">Let students retake the assessment</p>
                  </div>
                  <Switch
                    checked={assessment.allowRetake}
                    onCheckedChange={(checked) => setAssessment(prev => ({ ...prev, allowRetake: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shuffle Questions</Label>
                    <p className="text-sm text-gray-500">Randomize question order for each student</p>
                  </div>
                  <Switch
                    checked={assessment.shuffleQuestions}
                    onCheckedChange={(checked) => setAssessment(prev => ({ ...prev, shuffleQuestions: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Results</Label>
                    <p className="text-sm text-gray-500">Allow students to see their results</p>
                  </div>
                  <Switch
                    checked={assessment.showResults}
                    onCheckedChange={(checked) => setAssessment(prev => ({ ...prev, showResults: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Review your assessment before saving</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{assessment.title || "Untitled Assessment"}</h3>
                  <p className="text-gray-600">{assessment.description || "No description"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{assessment.type}</Badge>
                  {assessment.subject && <Badge variant="outline">{assessment.subject}</Badge>}
                  {assessment.grade && <Badge variant="outline">{assessment.grade}</Badge>}
                  {assessment.timeLimit && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {assessment.timeLimit} min
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Total Points: {calculateTotalPoints()} | Questions: {assessment.questions.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button onClick={handleSave} disabled={!assessment.title || assessment.questions.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Save Assessment
        </Button>
      </div>
    </div>
  );
}