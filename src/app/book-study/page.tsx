'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BookOpen, 
  Brain, 
  FileText, 
  Target, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter,
  Plus,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  Bookmark,
  FileEdit,
  Highlighter,
  Settings
} from 'lucide-react'

interface Document {
  id: string
  title: string
  author: string
  format: string
  pageCount: number
  uploadDate: Date
  status: 'processing' | 'completed' | 'error'
  progress: number
  readingTime: number
  lastAccessed: Date
  analysis?: {
    topics: string[]
    difficulty: string
    summary: string
    estimatedStudyTime: number
  }
}

interface StudySession {
  id: string
  documentId: string
  documentTitle: string
  startTime: Date
  endTime?: Date
  duration: number
  chaptersStudied: string[]
  conceptsCovered: string[]
  notes: string
  productivity: number
}

interface Exam {
  id: string
  title: string
  documentId: string
  documentTitle: string
  questionCount: number
  difficulty: string
  createdAt: Date
  completedAt?: Date
  score?: number
  timeSpent: number
  status: 'pending' | 'in-progress' | 'completed'
}

interface Note {
  id: string
  documentId: string
  documentTitle: string
  chapter: string
  section: string
  content: string
  timestamp: Date
  tags: string[]
}

interface Highlight {
  id: string
  documentId: string
  documentTitle: string
  text: string
  chapter: string
  section: string
  color: string
  timestamp: Date
}

export default function BookStudyDashboard() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-progress' | 'completed'>('all')
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  // Mock data initialization
  useEffect(() => {
    // Mock documents
    const mockDocuments: Document[] = [
      {
        id: '1',
        title: 'Introduction to Mathematics',
        author: 'Dr. Sarah Johnson',
        format: 'PDF',
        pageCount: 350,
        uploadDate: new Date('2024-01-15'),
        status: 'completed',
        progress: 75,
        readingTime: 12.5,
        lastAccessed: new Date('2024-01-20'),
        analysis: {
          topics: ['Algebra', 'Calculus', 'Geometry'],
          difficulty: 'Intermediate',
          summary: 'Comprehensive introduction to mathematical concepts and applications.',
          estimatedStudyTime: 20
        }
      },
      {
        id: '2',
        title: 'Physics Fundamentals',
        author: 'Prof. Michael Chen',
        format: 'EPUB',
        pageCount: 280,
        uploadDate: new Date('2024-01-10'),
        status: 'completed',
        progress: 45,
        readingTime: 8.2,
        lastAccessed: new Date('2024-01-18'),
        analysis: {
          topics: ['Mechanics', 'Thermodynamics', 'Waves'],
          difficulty: 'Advanced',
          summary: 'In-depth exploration of physics principles and their real-world applications.',
          estimatedStudyTime: 25
        }
      },
      {
        id: '3',
        title: 'Chemistry Basics',
        author: 'Dr. Emily Rodriguez',
        format: 'DOCX',
        pageCount: 200,
        uploadDate: new Date('2024-01-12'),
        status: 'in-progress',
        progress: 20,
        readingTime: 3.1,
        lastAccessed: new Date('2024-01-19'),
        analysis: {
          topics: ['Atomic Structure', 'Chemical Bonds', 'Reactions'],
          difficulty: 'Beginner',
          summary: 'Foundational chemistry concepts for beginners.',
          estimatedStudyTime: 15
        }
      }
    ]

    // Mock study sessions
    const mockStudySessions: StudySession[] = [
      {
        id: '1',
        documentId: '1',
        documentTitle: 'Introduction to Mathematics',
        startTime: new Date('2024-01-20T10:00:00'),
        endTime: new Date('2024-01-20T11:30:00'),
        duration: 90,
        chaptersStudied: ['Chapter 3: Algebra'],
        conceptsCovered: ['Linear Equations', 'Quadratic Functions'],
        notes: 'Covered basic algebraic concepts. Need more practice with word problems.',
        productivity: 85
      },
      {
        id: '2',
        documentId: '2',
        documentTitle: 'Physics Fundamentals',
        startTime: new Date('2024-01-19T14:00:00'),
        endTime: new Date('2024-01-19T15:45:00'),
        duration: 105,
        chaptersStudied: ['Chapter 2: Mechanics'],
        conceptsCovered: ['Newton\'s Laws', 'Force and Motion'],
        notes: 'Good progress on mechanics. The examples were very helpful.',
        productivity: 92
      }
    ]

    // Mock exams
    const mockExams: Exam[] = [
      {
        id: '1',
        title: 'Mathematics Chapter 1-3 Quiz',
        documentId: '1',
        documentTitle: 'Introduction to Mathematics',
        questionCount: 15,
        difficulty: 'Medium',
        createdAt: new Date('2024-01-18'),
        completedAt: new Date('2024-01-18'),
        score: 85,
        timeSpent: 25,
        status: 'completed'
      },
      {
        id: '2',
        title: 'Physics Midterm Practice',
        documentId: '2',
        documentTitle: 'Physics Fundamentals',
        questionCount: 30,
        difficulty: 'Hard',
        createdAt: new Date('2024-01-17'),
        status: 'pending'
      }
    ]

    // Mock notes
    const mockNotes: Note[] = [
      {
        id: '1',
        documentId: '1',
        documentTitle: 'Introduction to Mathematics',
        chapter: 'Chapter 3: Algebra',
        section: '3.2 Linear Equations',
        content: 'Linear equations are equations of the first degree. Key steps: 1) Isolate variable, 2) Solve for unknown, 3) Check solution.',
        timestamp: new Date('2024-01-20'),
        tags: ['algebra', 'equations', 'math']
      },
      {
        id: '2',
        documentId: '2',
        documentTitle: 'Physics Fundamentals',
        chapter: 'Chapter 2: Mechanics',
        section: '2.1 Newton\'s Laws',
        content: 'Newton\'s First Law: An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.',
        timestamp: new Date('2024-01-19'),
        tags: ['physics', 'mechanics', 'newton']
      }
    ]

    // Mock highlights
    const mockHighlights: Highlight[] = [
      {
        id: '1',
        documentId: '1',
        documentTitle: 'Introduction to Mathematics',
        text: 'The quadratic formula is x = [-b ± √(b² - 4ac)] / (2a)',
        chapter: 'Chapter 3: Algebra',
        section: '3.3 Quadratic Functions',
        color: 'yellow',
        timestamp: new Date('2024-01-20')
      },
      {
        id: '2',
        documentId: '2',
        documentTitle: 'Physics Fundamentals',
        text: 'Force equals mass times acceleration (F = ma)',
        chapter: 'Chapter 2: Mechanics',
        section: '2.1 Newton\'s Laws',
        color: 'green',
        timestamp: new Date('2024-01-19')
      }
    ]

    setDocuments(mockDocuments)
    setStudySessions(mockStudySessions)
    setExams(mockExams)
    setNotes(mockNotes)
    setHighlights(mockHighlights)
  }, [])

  // Filter documents based on search and status
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'in-progress' && doc.progress < 100) ||
                          (filterStatus === 'completed' && doc.progress === 100)
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalDocuments = documents.length
  const completedDocuments = documents.filter(doc => doc.progress === 100).length
  const inProgressDocuments = documents.filter(doc => doc.progress > 0 && doc.progress < 100).length
  const totalReadingTime = documents.reduce((sum, doc) => sum + doc.readingTime, 0)
  const averageProductivity = studySessions.length > 0 
    ? studySessions.reduce((sum, session) => sum + session.productivity, 0) / studySessions.length 
    : 0
  const completedExams = exams.filter(exam => exam.status === 'completed').length
  const averageExamScore = completedExams > 0
    ? exams.filter(exam => exam.score).reduce((sum, exam) => sum + (exam.score || 0), 0) / completedExams
    : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your learning materials, track progress, and access AI-powered study tools
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload New Material
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalDocuments}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalReadingTime}h</p>
                <p className="text-sm text-muted-foreground">Reading Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(averageProductivity)}%</p>
                <p className="text-sm text-muted-foreground">Avg Productivity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(averageExamScore)}%</p>
                <p className="text-sm text-muted-foreground">Avg Exam Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="sessions">Study Sessions</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="notes">Notes & Highlights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Document Library
              </CardTitle>
              <CardDescription>
                Your uploaded study materials and progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Document Grid */}
              <div className="grid gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-8 w-8 text-blue-500" />
                            {doc.status === 'completed' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {doc.status === 'in-progress' && (
                              <AlertCircle className="h-5 w-5 text-orange-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              by {doc.author} • {doc.format} • {doc.pageCount} pages
                            </p>
                            
                            {/* Progress */}
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{doc.progress}%</span>
                              </div>
                              <Progress value={doc.progress} className="w-full" />
                            </div>

                            {/* Topics and Tags */}
                            {doc.analysis && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{doc.analysis.difficulty}</Badge>
                                  <Badge variant="secondary">
                                    {doc.analysis.estimatedStudyTime}h estimated
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {doc.analysis.topics.map((topic, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {doc.analysis.summary}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Study
                          </Button>
                          <Button size="sm" variant="outline">
                            <Brain className="h-4 w-4 mr-2" />
                            AI Help
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Study Sessions
              </CardTitle>
              <CardDescription>
                Your recent study sessions and productivity tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studySessions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No study sessions yet
                  </p>
                  <p className="text-gray-500 mb-4">
                    Start studying to track your sessions and productivity
                  </p>
                  <Button>Start Studying</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {studySessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                session.productivity >= 80 ? 'bg-green-500' :
                                session.productivity >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{session.documentTitle}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {new Date(session.startTime).toLocaleDateString()} • {session.duration} minutes
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>Productivity: {session.productivity}%</span>
                                <span>Chapters: {session.chaptersStudied.join(', ')}</span>
                                <span>Concepts: {session.conceptsCovered.length}</span>
                              </div>
                              {session.notes && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {session.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Exams & Assessments
              </CardTitle>
              <CardDescription>
                Generated exams and your performance history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No exams yet
                  </p>
                  <p className="text-gray-500 mb-4">
                    Generate exams from your study materials to test your knowledge
                  </p>
                  <Button>Generate Exam</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <Card key={exam.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              {exam.status === 'completed' && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                              {exam.status === 'in-progress' && (
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                              )}
                              {exam.status === 'pending' && (
                                <Target className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{exam.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {exam.documentTitle} • {exam.questionCount} questions • {exam.difficulty}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>Status: {exam.status}</span>
                                {exam.completedAt && (
                                  <span>Completed: {exam.completedAt.toLocaleDateString()}</span>
                                )}
                                {exam.score !== undefined && (
                                  <span className="font-semibold">Score: {exam.score}%</span>
                                )}
                                {exam.timeSpent > 0 && (
                                  <span>Time: {exam.timeSpent} min</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {exam.status === 'pending' && (
                              <Button size="sm">
                                Start Exam
                              </Button>
                            )}
                            {exam.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                View Results
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Note className="h-5 w-5" />
                  Notes
                </CardTitle>
                <CardDescription>
                  Your study notes and annotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <Note className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No notes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <Card key={note.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{note.documentTitle}</h4>
                            <span className="text-xs text-gray-500">
                              {note.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {note.chapter} • {note.section}
                          </p>
                          <p className="text-sm line-clamp-3">{note.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {note.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Highlight className="h-5 w-5" />
                  Highlights
                </CardTitle>
                <CardDescription>
                  Important passages you've highlighted
                </CardDescription>
              </CardHeader>
              <CardContent>
                {highlights.length === 0 ? (
                  <div className="text-center py-8">
                    <Highlight className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No highlights yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {highlights.map((highlight) => (
                      <Card key={highlight.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{highlight.documentTitle}</h4>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: highlight.color }}
                              />
                              <span className="text-xs text-gray-500">
                                {highlight.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {highlight.chapter} • {highlight.section}
                          </p>
                          <p className="text-sm italic line-clamp-2">"{highlight.text}"</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round((completedDocuments / totalDocuments) * 100)}%</span>
                    </div>
                    <Progress value={(completedDocuments / totalDocuments) * 100} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Documents Completed</span>
                      <span>{completedDocuments}/{totalDocuments}</span>
                    </div>
                    <Progress value={(completedDocuments / totalDocuments) * 100} className="w-full" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>In Progress</span>
                      <span>{inProgressDocuments} documents</span>
                    </div>
                    <Progress value={(inProgressDocuments / totalDocuments) * 100} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Study Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Study Time</span>
                    <span className="font-semibold">{totalReadingTime} hours</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Study Sessions</span>
                    <span className="font-semibold">{studySessions.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Notes Created</span>
                    <span className="font-semibold">{notes.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Highlights</span>
                    <span className="font-semibold">{highlights.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Exams Completed</span>
                    <span className="font-semibold">{completedExams}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Score</span>
                    <span className="font-semibold">{Math.round(averageExamScore)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}