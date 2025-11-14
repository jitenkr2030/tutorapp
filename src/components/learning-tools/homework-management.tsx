"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, FileText, Plus, Trash2, Edit, CheckCircle, AlertCircle, BookOpen } from "lucide-react";

interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: string;
  status: string;
  estimatedTime?: number;
  instructions?: string;
  resources?: string[];
  submissionUrl?: string;
  grade?: string;
  score?: number;
  maxScore?: number;
  feedback?: string;
  studentName: string;
  tutorName: string;
  createdAt: string;
  submittedAt?: string;
  gradedAt?: string;
}

interface HomeworkFormData {
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: string;
  estimatedTime?: number;
  instructions?: string;
  resources?: string[];
  studentId: string;
}

export default function HomeworkManagement() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [userRole, setUserRole] = useState<"student" | "tutor">("tutor");

  const [formData, setFormData] = useState<HomeworkFormData>({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    priority: "MEDIUM",
    estimatedTime: undefined,
    instructions: "",
    resources: [],
    studentId: "",
  });

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography",
    "Physics", "Chemistry", "Biology", "Computer Science", "Languages"
  ];

  const priorities = [
    { value: "LOW", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-800" },
  ];

  const statuses = [
    { value: "ASSIGNED", label: "Assigned", icon: FileText },
    { value: "IN_PROGRESS", label: "In Progress", icon: Clock },
    { value: "SUBMITTED", label: "Submitted", icon: CheckCircle },
    { value: "GRADED", label: "Graded", icon: CheckCircle },
    { value: "RETURNED", label: "Returned", icon: BookOpen },
    { value: "OVERDUE", label: "Overdue", icon: AlertCircle },
  ];

  useEffect(() => {
    fetchHomework();
    // In a real app, you would get the user role from authentication
    setUserRole("tutor");
  }, []);

  const fetchHomework = async () => {
    try {
      const response = await fetch("/api/homework");
      if (response.ok) {
        const data = await response.json();
        setHomework(data);
      }
    } catch (error) {
      console.error("Error fetching homework:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingHomework ? `/api/homework/${editingHomework.id}` : "/api/homework";
      const method = editingHomework ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchHomework();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving homework:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      priority: "MEDIUM",
      estimatedTime: undefined,
      instructions: "",
      resources: [],
      studentId: "",
    });
    setEditingHomework(null);
  };

  const handleEdit = (hw: Homework) => {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      description: hw.description,
      subject: hw.subject,
      dueDate: hw.dueDate,
      priority: hw.priority,
      estimatedTime: hw.estimatedTime,
      instructions: hw.instructions,
      resources: hw.resources,
      studentId: "", // In a real app, you'd get this from the homework data
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this homework?")) {
      try {
        const response = await fetch(`/api/homework/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchHomework();
        }
      } catch (error) {
        console.error("Error deleting homework:", error);
      }
    }
  };

  const filteredHomework = homework.filter(hw => {
    if (activeTab === "assigned") return hw.status === "ASSIGNED" || hw.status === "IN_PROGRESS";
    if (activeTab === "submitted") return hw.status === "SUBMITTED";
    if (activeTab === "graded") return hw.status === "GRADED" || hw.status === "RETURNED";
    if (activeTab === "overdue") return hw.status === "OVERDUE";
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    const p = priorities.find(pr => pr.value === priority);
    return p ? (
      <Badge className={p.color}>
        {p.label}
      </Badge>
    ) : null;
  };

  const getStatusBadge = (status: string) => {
    const s = statuses.find(st => st.value === status);
    return s ? (
      <Badge variant="outline" className="flex items-center space-x-1">
        <s.icon className="h-3 w-3" />
        <span>{s.label}</span>
      </Badge>
    ) : null;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Homework Management</h1>
          <p className="text-gray-600">
            {userRole === "tutor" ? "Assign and manage homework for your students" : "Track and submit your homework assignments"}
          </p>
        </div>
        {userRole === "tutor" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Assign Homework</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingHomework ? "Edit Homework" : "Assign New Homework"}
                </DialogTitle>
                <DialogDescription>
                  {editingHomework ? "Update homework details" : "Create a new homework assignment"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter homework title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter homework description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      min="1"
                      placeholder="60"
                      value={formData.estimatedTime || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        estimatedTime: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter detailed instructions for students"
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingHomework ? "Update Homework" : "Assign Homework"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredHomework.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No homework found</p>
                {userRole === "tutor" && (
                  <Button onClick={() => setIsDialogOpen(true)}>Assign Your First Homework</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHomework.map((hw) => (
                <Card key={hw.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{hw.title}</CardTitle>
                      <div className="flex flex-col space-y-1">
                        {getPriorityBadge(hw.priority)}
                        {getStatusBadge(hw.status)}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">{hw.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{hw.subject}</span>
                      <Badge variant="outline">{hw.studentName}</Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(hw.dueDate)}</span>
                      </div>
                      {hw.estimatedTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{hw.estimatedTime}m</span>
                        </div>
                      )}
                    </div>

                    {hw.score !== undefined && hw.maxScore !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Score:</span>
                        <Badge variant="outline">
                          {hw.score}/{hw.maxScore} ({Math.round((hw.score / hw.maxScore) * 100)}%)
                        </Badge>
                      </div>
                    )}

                    {hw.grade && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Grade:</span>
                        <Badge>{hw.grade}</Badge>
                      </div>
                    )}

                    {isOverdue(hw.dueDate) && hw.status !== "GRADED" && hw.status !== "RETURNED" && (
                      <div className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Overdue</span>
                      </div>
                    )}

                    {userRole === "tutor" && (
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(hw)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(hw.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}