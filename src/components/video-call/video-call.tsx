'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  MonitorOff,
  Settings,
  Users,
  MessageSquare,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Circle,
  Square,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallProps {
  sessionId: string;
  userId: string;
  userName: string;
  userRole: 'tutor' | 'student';
  otherUserId: string;
  otherUserName: string;
  onEndCall: () => void;
}

interface VideoTrack {
  kind: string;
  id: string;
  label: string;
  deviceId: string;
}

export default function VideoCall({ 
  sessionId, 
  userId, 
  userName, 
  userRole, 
  otherUserId, 
  otherUserName, 
  onEndCall 
}: VideoCallProps) {
  const [localVideoRef, setLocalVideoRef] = useState<HTMLVideoElement | null>(null);
  const [remoteVideoRef, setRemoteVideoRef] = useState<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Device management
  const [videoDevices, setVideoDevices] = useState<VideoTrack[]>([]);
  const [audioDevices, setAudioDevices] = useState<VideoTrack[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  
  // Quality settings
  const [videoQuality, setVideoQuality] = useState('720p');
  const [frameRate, setFrameRate] = useState([30]);
  const [audioBitrate, setAudioBitrate] = useState([128]);

  const socketRef = useRef<any>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize WebRTC
  useEffect(() => {
    initializeCall();
    return () => {
      cleanupCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get media devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      setVideoDevices(videoInputs as VideoTrack[]);
      setAudioDevices(audioInputs as VideoTrack[]);
      
      if (videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      if (audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }

      // Get initial media stream
      const stream = await getMediaStream();
      setLocalStream(stream);
      
      if (localVideoRef) {
        localVideoRef.srcObject = stream;
      }

      // Initialize peer connection
      const pc = createPeerConnection();
      setPeerConnection(pc);

      // Initialize socket connection
      initializeSocket();

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize video call');
    }
  };

  const getMediaStream = async (screenShare = false): Promise<MediaStream> => {
    const constraints: MediaStreamConstraints = {
      video: screenShare ? 
        { 
          cursor: 'always',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } : 
        {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: videoQuality === '1080p' ? 1920 : 1280 },
          height: { ideal: videoQuality === '1080p' ? 1080 : 720 },
          frameRate: { ideal: frameRate[0] }
        },
      audio: {
        deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2
      }
    };

    if (screenShare) {
      return await navigator.mediaDevices.getDisplayMedia(constraints);
    } else {
      return await navigator.mediaDevices.getUserMedia(constraints);
    }
  };

  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:your-turn-server.com:3478',
          username: 'your-username',
          credential: 'your-credential'
        }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      if (remoteVideoRef) {
        remoteVideoRef.srcObject = stream;
      }
      setIsConnected(true);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          sessionId,
          candidate: event.candidate,
          userId
        });
      }
    };

    // Monitor connection quality
    pc.onconnectionstatechange = () => {
      updateConnectionQuality(pc);
    };

    pc.oniceconnectionstatechange = () => {
      updateConnectionQuality(pc);
    };

    return pc;
  };

  const initializeSocket = () => {
    // Initialize socket connection for signaling
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
      socketRef.current.emit('join-session', { sessionId, userId, userName });
    });

    socketRef.current.on('offer', async (data: any) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socketRef.current.emit('answer', {
          sessionId,
          answer,
          userId
        });
      }
    });

    socketRef.current.on('answer', async (data: any) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socketRef.current.on('ice-candidate', async (data: any) => {
      if (peerConnection && data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socketRef.current.on('user-joined', async (data: any) => {
      if (peerConnection && data.userId !== userId) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socketRef.current.emit('offer', {
          sessionId,
          offer,
          userId
        });
      }
    });

    socketRef.current.on('user-left', (data: any) => {
      if (data.userId !== userId) {
        setIsConnected(false);
        setRemoteStream(null);
        if (remoteVideoRef) {
          remoteVideoRef.srcObject = null;
        }
      }
    });
  };

  const updateConnectionQuality = (pc: RTCPeerConnection) => {
    const stats = pc.getStats();
    stats.then((report) => {
      let totalLatency = 0;
      let packetLoss = 0;
      let bitrate = 0;
      
      report.forEach((stat) => {
        if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
          totalLatency += stat.currentRoundTripTime || 0;
        }
        if (stat.type === 'inbound-rtp') {
          packetLoss += stat.packetsLost || 0;
          bitrate += stat.bitrate || 0;
        }
      });

      // Determine connection quality
      if (totalLatency < 100 && packetLoss < 0.01) {
        setConnectionQuality('good');
      } else if (totalLatency < 300 && packetLoss < 0.05) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('poor');
      }
    });
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing and switch back to camera
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        
        const newStream = await getMediaStream(false);
        setLocalStream(newStream);
        
        if (localVideoRef) {
          localVideoRef.srcObject = newStream;
        }

        // Update peer connection
        if (peerConnection) {
          const sender = peerConnection.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender) {
            const videoTrack = newStream.getVideoTracks()[0];
            sender.replaceTrack(videoTrack);
          }
        }

        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        
        const newStream = await getMediaStream(true);
        setLocalStream(newStream);
        
        if (localVideoRef) {
          localVideoRef.srcObject = newStream;
        }

        // Update peer connection
        if (peerConnection) {
          const sender = peerConnection.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          if (sender) {
            const videoTrack = newStream.getVideoTracks()[0];
            sender.replaceTrack(videoTrack);
          }
        }

        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          setIsRecording(false);
          
          // Create download link
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `session-${sessionId}-${Date.now()}.webm`;
          a.click();
          
          recordedChunksRef.current = [];
        }
      } else {
        // Start recording
        const stream = new MediaStream();
        
        // Add local video track
        if (localStream && localStream.getVideoTracks().length > 0) {
          stream.addTrack(localStream.getVideoTracks()[0]);
        }
        
        // Add local audio track
        if (localStream && localStream.getAudioTracks().length > 0) {
          stream.addTrack(localStream.getAudioTracks()[0]);
        }
        
        // Add remote video track
        if (remoteStream && remoteStream.getVideoTracks().length > 0) {
          stream.addTrack(remoteStream.getVideoTracks()[0]);
        }
        
        // Add remote audio track
        if (remoteStream && remoteStream.getAudioTracks().length > 0) {
          stream.addTrack(remoteStream.getAudioTracks()[0]);
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000
        });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      toast.error('Failed to toggle recording');
    }
  };

  const changeVideoDevice = async (deviceId: string) => {
    try {
      setSelectedVideoDevice(deviceId);
      
      if (localStream) {
        localStream.getVideoTracks().forEach(track => track.stop());
      }
      
      const newStream = await getMediaStream(false);
      setLocalStream(newStream);
      
      if (localVideoRef) {
        localVideoRef.srcObject = newStream;
      }

      // Update peer connection
      if (peerConnection) {
        const sender = peerConnection.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        if (sender) {
          const videoTrack = newStream.getVideoTracks()[0];
          sender.replaceTrack(videoTrack);
        }
      }
    } catch (error) {
      console.error('Error changing video device:', error);
      toast.error('Failed to change video device');
    }
  };

  const changeAudioDevice = async (deviceId: string) => {
    try {
      setSelectedAudioDevice(deviceId);
      
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.stop());
      }
      
      const newStream = await getMediaStream(false);
      setLocalStream(newStream);
      
      if (localVideoRef) {
        localVideoRef.srcObject = newStream;
      }

      // Update peer connection
      if (peerConnection) {
        const sender = peerConnection.getSenders().find(s => 
          s.track?.kind === 'audio'
        );
        if (sender) {
          const audioTrack = newStream.getAudioTracks()[0];
          sender.replaceTrack(audioTrack);
        }
      }
    } catch (error) {
      console.error('Error changing audio device:', error);
      toast.error('Failed to change audio device');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const endCall = () => {
    cleanupCall();
    onEndCall();
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnection) {
      peerConnection.close();
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setIsConnected(false);
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'good': return 'bg-green-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`h-screen bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionQualityColor()}`}></div>
              <span className="text-sm">
                {connectionQuality === 'good' ? 'Good' : connectionQuality === 'fair' ? 'Fair' : 'Poor'} Connection
              </span>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
            <span className="text-sm">Session: {sessionId}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">{userName} ({userRole})</span>
            <span className="text-gray-400">↔</span>
            <span className="text-sm">{otherUserName}</span>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video */}
          <div className="absolute inset-0">
            <video
              ref={setRemoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-white text-center">
                  <div className="text-2xl mb-2">Waiting for {otherUserName} to join...</div>
                  <div className="text-sm opacity-75">Session ID: {sessionId}</div>
                </div>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={setLocalVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            </div>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
              <Circle className="w-4 h-4" />
              <span className="text-sm">Recording</span>
            </div>
          )}

          {/* Screen Share Indicator */}
          {isScreenSharing && (
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-full">
              <Monitor className="w-4 h-4" />
              <span className="text-sm">Screen Sharing</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 text-white p-4">
          <div className="flex items-center justify-center space-x-4">
            {/* Audio Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant={isAudioEnabled ? 'default' : 'destructive'}
                size="sm"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              
              <Select value={selectedAudioDevice} onValueChange={changeAudioDevice}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Audio ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Video Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant={isVideoEnabled ? 'default' : 'destructive'}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              
              <Select value={selectedVideoDevice} onValueChange={changeVideoDevice}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Video ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Screen Share */}
            <Button
              variant={isScreenSharing ? 'default' : 'outline'}
              size="sm"
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </Button>

            {/* Recording */}
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="sm"
              onClick={toggleRecording}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </Button>

            {/* Additional Features */}
            <Button
              variant={showWhiteboard ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowWhiteboard(!showWhiteboard)}
            >
              <FileText className="w-4 h-4" />
            </Button>

            <Button
              variant={showChat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="sm"
              onClick={endCall}
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-700 p-4 border-t border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Quality</label>
                <Select value={videoQuality} onValueChange={setVideoQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p HD</SelectItem>
                    <SelectItem value="1080p">1080p Full HD</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Frame Rate: {frameRate[0]} FPS</label>
                <Slider
                  value={frameRate}
                  onValueChange={setFrameRate}
                  max={60}
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Audio Bitrate: {audioBitrate[0]} kbps</label>
                <Slider
                  value={audioBitrate}
                  onValueChange={setAudioBitrate}
                  max={256}
                  min={64}
                  step={32}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Side Panels */}
        {showChat && (
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 p-4">
            <div className="text-white mb-4">
              <h3 className="text-lg font-semibold">Chat</h3>
            </div>
            {/* Chat component would go here */}
          </div>
        )}

        {showWhiteboard && (
          <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-gray-300">
            {/* Whiteboard component would go here */}
          </div>
        )}
      </div>
    </div>
  );
}