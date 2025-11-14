'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, BookOpen, Brain, CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react'

interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error'
  progress: number
  message: string
  documentId?: string
}

interface DocumentInfo {
  id: string
  title: string
  author: string
  format: string
  pageCount: number
  uploadDate: Date
  status: 'processing' | 'completed' | 'error'
  analysis?: {
    topics: string[]
    difficulty: string
    summary: string
  }
}

export default function BookProcessingPage() {
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to upload documents'
  })
  
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentInfo[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/epub+zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!validTypes.includes(file.type)) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: 'Unsupported file type. Please upload PDF, EPUB, DOCX, or TXT files.'
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: 'File size too large. Please upload files smaller than 50MB.'
      })
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const uploadDocument = async () => {
    if (!selectedFile) return

    setProcessingStatus({
      status: 'uploading',
      progress: 0,
      message: 'Uploading document...'
    })

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setProcessingStatus(prev => ({
          ...prev,
          progress: i,
          message: `Uploading... ${i}%`
        }))
      }

      setProcessingStatus({
        status: 'processing',
        progress: 0,
        message: 'Processing document content...'
      })

      // Simulate processing
      for (let i = 0; i <= 100; i += 15) {
        await new Promise(resolve => setTimeout(resolve, 150))
        setProcessingStatus(prev => ({
          ...prev,
          progress: i,
          message: `Processing... ${i}%`
        }))
      }

      setProcessingStatus({
        status: 'analyzing',
        progress: 0,
        message: 'Analyzing content with AI...'
      })

      // Simulate AI analysis
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setProcessingStatus(prev => ({
          ...prev,
          progress: i,
          message: `AI Analysis... ${i}%`
        }))
      }

      // Add to uploaded documents
      const newDocument: DocumentInfo = {
        id: `doc_${Date.now()}`,
        title: selectedFile.name.replace(/\.[^/.]+$/, ''),
        author: 'Unknown Author',
        format: selectedFile.type.split('/')[1].toUpperCase(),
        pageCount: Math.floor(Math.random() * 500) + 50, // Mock page count
        uploadDate: new Date(),
        status: 'completed',
        analysis: {
          topics: ['Mathematics', 'Science', 'Education'],
          difficulty: 'Intermediate',
          summary: 'This document covers fundamental concepts in mathematics and science with practical applications.'
        }
      }

      setUploadedDocuments(prev => [newDocument, ...prev])
      setSelectedFile(null)

      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: 'Document processed successfully!',
        documentId: newDocument.id
      })

    } catch (error) {
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: 'Failed to process document. Please try again.'
      })
    }
  }

  const getStatusIcon = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'analyzing':
        return <Clock className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Upload className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'analyzing':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI-Powered Book Processing</h1>
        <p className="text-muted-foreground">
          Upload your books and study materials to get AI explanations, generate exams, and enhance your learning experience
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Process</TabsTrigger>
          <TabsTrigger value="library">My Library</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription>
                Upload your books, study materials, or documents in PDF, EPUB, DOCX, or TXT format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop your document here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.epub,.docx,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type.split('/')[1].toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button onClick={uploadDocument} disabled={processingStatus.status !== 'idle'}>
                        Process Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Processing Status */}
              {processingStatus.status !== 'idle' && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(processingStatus.status)}
                        <span className={`font-medium ${getStatusColor(processingStatus.status)}`}>
                          {processingStatus.message}
                        </span>
                      </div>
                      
                      {processingStatus.status !== 'idle' && processingStatus.status !== 'error' && (
                        <Progress value={processingStatus.progress} className="w-full" />
                      )}
                      
                      {processingStatus.status === 'error' && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{processingStatus.message}</AlertDescription>
                        </Alert>
                      )}
                      
                      {processingStatus.status === 'completed' && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Document processed successfully! You can now access AI explanations, generate exams, and study with your material.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Library
              </CardTitle>
              <CardDescription>
                Your processed documents and study materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No documents yet
                  </p>
                  <p className="text-gray-500 mb-4">
                    Upload your first document to get started with AI-powered learning
                  </p>
                  <Button onClick={() => document.querySelector('[value="upload"]')?.click()}>
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {uploadedDocuments.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <FileText className="h-8 w-8 text-blue-500 mt-1" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                by {doc.author} • {doc.format} • {doc.pageCount} pages
                              </p>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant={doc.status === 'completed' ? 'default' : 'secondary'}>
                                  {doc.status === 'completed' ? 'Ready' : 'Processing'}
                                </Badge>
                                {doc.analysis && (
                                  <Badge variant="outline">
                                    {doc.analysis.difficulty}
                                  </Badge>
                                )}
                              </div>
                              {doc.analysis && (
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-1">
                                    {doc.analysis.topics.map((topic, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
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
                              <Brain className="h-4 w-4 mr-2" />
                              Study
                            </Button>
                            <Button size="sm" variant="outline">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Exam
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

        <TabsContent value="features" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  AI Explanations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Get instant, context-aware explanations for any concept in your uploaded materials. 
                  Choose from beginner, intermediate, or advanced explanation levels.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Smart Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Generate intelligent quizzes and exams based on your study materials. 
                  Adaptive difficulty and comprehensive question types.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Interactive Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Highlight text, add notes, create bookmarks, and get AI assistance 
                  while reading through your study materials.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Monitor your learning progress, track completed chapters, 
                  and receive personalized study recommendations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-red-500" />
                  Multi-Format Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Upload documents in PDF, EPUB, DOCX, or TXT formats. 
                  Intelligent content extraction and processing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Content Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI-powered analysis identifies key concepts, topics, 
                  and difficulty levels to optimize your learning experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}