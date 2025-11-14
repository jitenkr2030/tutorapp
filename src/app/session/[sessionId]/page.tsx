'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  FileText,
  Share2,
  Monitor,
  MonitorOff
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import Peer from 'simple-peer'
import DigitalWhiteboard from '@/components/whiteboard/digital-whiteboard'
import FileSharing from '@/components/file-sharing/file-sharing'

interface Session {
  id: string
  tutorId: string
  studentId: string
  subject: string
  scheduledAt: string
  duration: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  tutor: {
    name: string
    email: string
  }
  student: {
    name: string
    email: string
  }
}

interface Message {
  id: string
  sessionId: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

export default function VideoSessionPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sessionData, setSessionData] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  
  // Video states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [peer, setPeer] = useState<Peer.Instance | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${params.sessionId}`)
        if (!response.ok) {
          throw new Error('Session not found')
        }
        const data = await response.json()
        setSessionData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [params.sessionId, router, status])

  useEffect(() => {
    if (!sessionData || !session) return

    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      setIsConnected(true)
      // Join session room
      socketInstance.emit('join-session', {
        sessionId: params.sessionId,
        userId: session.user.id,
        userName: session.user.name
      })
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    // Handle WebRTC signaling
    socketInstance.on('offer', async (data: { offer: any; from: string }) => {
      if (!peer) {
        await initializePeer(true, data.offer)
      }
    })

    socketInstance.on('answer', (data: { answer: any }) => {
      if (peer) {
        peer.signal(data.answer)
      }
    })

    socketInstance.on('ice-candidate', (data: { candidate: any }) => {
      if (peer) {
        peer.signal(data.candidate)
      }
    })

    // Handle chat messages
    socketInstance.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    // Handle session events
    socketInstance.on('session-ended', () => {
      endSession()
    })

    return () => {
      socketInstance.disconnect()
      if (peer) {
        peer.destroy()
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [sessionData, session, params.sessionId])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      return stream
    } catch (err) {
      setError('Failed to access camera and microphone')
      return null
    }
  }

  const initializePeer = async (isInitiator: boolean = false, offer?: any) => {
    const stream = await initializeMedia()
    if (!stream) return

    const peerInstance = new Peer({
      initiator: isInitiator,
      trickle: true,
      stream: stream
    })

    peerInstance.on('signal', (data) => {
      if (socket) {
        if (data.type === 'offer') {
          socket.emit('offer', { offer: data, to: getOtherUserId() })
        } else if (data.type === 'answer') {
          socket.emit('answer', { answer: data, to: getOtherUserId() })
        } else if (data.candidate) {
          socket.emit('ice-candidate', { candidate: data, to: getOtherUserId() })
        }
      }
    })

    peerInstance.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream)
    })

    peerInstance.on('close', () => {
      endSession()
    })

    peerInstance.on('error', (err) => {
      console.error('Peer error:', err)
      setError('Connection error occurred')
    })

    if (offer) {
      peerInstance.signal(offer)
    }

    setPeer(peerInstance)
  }

  const getOtherUserId = () => {
    if (!sessionData || !session) return ''
    return session.user.id === sessionData.tutorId ? sessionData.studentId : sessionData.tutorId
  }

  const startSession = async () => {
    if (!socket || !sessionData) return
    
    try {
      // Update session status
      await fetch(`/api/sessions/${params.sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      })

      // Initialize peer connection
      await initializePeer(true)
    } catch (err) {
      setError('Failed to start session')
    }
  }

  const endSession = async () => {
    if (peer) {
      peer.destroy()
      setPeer(null)
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    setRemoteStream(null)
    
    if (socket) {
      socket.emit('end-session', { sessionId: params.sessionId })
    }

    // Update session status
    try {
      await fetch(`/api/sessions/${params.sessionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      })
    } catch (err) {
      console.error('Failed to update session status:', err)
    }

    router.push('/dashboard')
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (localStream) {
        const screenTrack = localStream.getVideoTracks().find(track => 
          track.label.includes('screen')
        )
        if (screenTrack) {
          screenTrack.stop()
          localStream.removeTrack(screenTrack)
        }
      }
      setIsScreenSharing(false)
      
      // Re-enable camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (localStream && peer) {
        const videoTrack = stream.getVideoTracks()[0]
        localStream.addTrack(videoTrack)
        peer.addTrack(videoTrack, localStream)
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        const screenTrack = screenStream.getVideoTracks()[0]
        
        if (localStream && peer) {
          // Remove camera track
          const cameraTrack = localStream.getVideoTracks().find(track => 
            !track.label.includes('screen')
          )
          if (cameraTrack) {
            localStream.removeTrack(cameraTrack)
          }
          
          // Add screen track
          localStream.addTrack(screenTrack)
          peer.addTrack(screenTrack, localStream)
          
          screenTrack.onended = () => {
            toggleScreenShare()
          }
        }
        
        setIsScreenSharing(true)
      } catch (err) {
        console.error('Failed to start screen sharing:', err)
      }
    }
  }

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !session) return

    const message: Message = {
      id: Date.now().toString(),
      sessionId: params.sessionId,
      senderId: session.user.id,
      senderName: session.user.name || '',
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    socket.emit('chat-message', message)
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>{error || 'Session not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Video Session</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={isConnected ? 'default' : 'destructive'}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <Badge variant="outline">
                      {sessionData.subject}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      You
                    </div>
                  </div>
                  <div className="relative">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {session.user?.id === sessionData.tutorId ? sessionData.student.name : sessionData.tutor.name}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {!peer ? (
                    <Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={isVideoEnabled ? 'default' : 'destructive'}
                        onClick={toggleVideo}
                      >
                        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant={isAudioEnabled ? 'default' : 'destructive'}
                        onClick={toggleAudio}
                      >
                        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant={isScreenSharing ? 'default' : 'outline'}
                        onClick={toggleScreenShare}
                      >
                        {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </Button>
                      <Button variant="destructive" onClick={endSession}>
                        <PhoneOff className="w-4 h-4 mr-2" />
                        End Session
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Whiteboard and File Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="whiteboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="whiteboard">
                      <FileText className="w-4 h-4 mr-2" />
                      Whiteboard
                    </TabsTrigger>
                    <TabsTrigger value="files">
                      <Share2 className="w-4 h-4 mr-2" />
                      File Sharing
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="whiteboard" className="mt-4">
                    {session && (
                      <DigitalWhiteboard
                        sessionId={params.sessionId}
                        userId={session.user.id}
                        userName={session.user.name || ''}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="files" className="mt-4">
                    {session && (
                      <FileSharing
                        sessionId={params.sessionId}
                        userId={session.user.id}
                        userName={session.user.name || ''}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto space-y-2 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        message.senderId === session?.user?.id ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] p-2 rounded-lg ${
                          message.senderId === session?.user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle>Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subject:</span>
                  <span>{sessionData.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tutor:</span>
                  <span>{sessionData.tutor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Student:</span>
                  <span>{sessionData.student.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{sessionData.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={
                    sessionData.status === 'IN_PROGRESS' ? 'default' :
                    sessionData.status === 'COMPLETED' ? 'secondary' :
                    sessionData.status === 'CANCELLED' ? 'destructive' : 'outline'
                  }>
                    {sessionData.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}