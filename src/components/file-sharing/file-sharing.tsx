'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music,
  Trash2,
  Eye,
  Share2
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface FileSharingProps {
  sessionId: string
  userId: string
  userName: string
}

interface SharedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedBy: string
  uploadedByName: string
  timestamp: string
}

export default function FileSharing({ sessionId, userId, userName }: FileSharingProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [files, setFiles] = useState<SharedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('File sharing connected to socket')
    })

    // Handle file sharing updates
    socketInstance.on('file-shared', (file: SharedFile) => {
      setFiles(prev => [...prev, file])
    })

    // Handle file removal
    socketInstance.on('file-removed', (fileId: string) => {
      setFiles(prev => prev.filter(f => f.id !== fileId))
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile || !socket) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('sessionId', sessionId)
      formData.append('userId', userId)
      formData.append('userName', userName)

      // Upload file to server
      const response = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const result = await response.json()
      
      // Create shared file object
      const sharedFile: SharedFile = {
        id: result.fileId,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        url: result.url,
        uploadedBy: userId,
        uploadedByName: userName,
        timestamp: new Date().toISOString()
      }

      // Emit file share event
      socket.emit('file-share', {
        sessionId,
        fileData: sharedFile
      })

      // Add to local files list
      setFiles(prev => [...prev, sharedFile])
      
      // Reset form
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = (fileId: string) => {
    if (!socket) return

    // Remove from local list
    setFiles(prev => prev.filter(f => f.id !== fileId))

    // Emit file removal event
    socket.emit('file-remove', {
      sessionId,
      fileId
    })
  }

  const downloadFile = (file: SharedFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.click()
  }

  const previewFile = (file: SharedFile) => {
    if (file.type.startsWith('image/')) {
      window.open(file.url, '_blank')
    } else if (file.type === 'application/pdf') {
      window.open(file.url, '_blank')
    } else {
      // For other file types, just download
      downloadFile(file)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" alt="Image file" />
    } else if (type.startsWith('video/')) {
      return <Video className="w-4 h-4" alt="Video file" />
    } else if (type.startsWith('audio/')) {
      return <Music className="w-4 h-4" alt="Audio file" />
    } else {
      return <FileText className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          File Sharing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {getFileIcon(selectedFile.type)}
                  <span className="font-medium">{selectedFile.name}</span>
                  <Badge variant="outline">{formatFileSize(selectedFile.size)}</Badge>
                </div>
                
                {uploading ? (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={uploadFile}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedFile(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: Images, Videos, Audio, PDF, Documents
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Files List */}
          <div className="space-y-2">
            <h3 className="font-medium">Shared Files ({files.length})</h3>
            
            {files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No files shared yet
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.uploadedByName}</span>
                          <span>•</span>
                          <span>{formatTime(file.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => previewFile(file)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {file.uploadedBy === userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          title="Remove"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}