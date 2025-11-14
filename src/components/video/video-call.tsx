'use client';

import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  Maximize,
  Minimize,
  Recording,
  RecordingOff,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import DigitalWhiteboard from '@/components/whiteboard/digital-whiteboard';
import { toast } from 'sonner';

interface VideoCallProps {
  sessionId: string;
  userId: string;
  userName: string;
  tutorName: string;
  studentName: string;
  isTutor: boolean;
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
  tutorName, 
  studentName, 
  isTutor, 
  onEndCall 
}: VideoCallProps) {
  const [localVideoRef, setLocalVideoRef] = useState<HTMLVideoElement | null>(null);
  const [remoteVideoRef, setRemoteVideoRef] = useState<HTMLVideoElement | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [videoDevices, setVideoDevices] = useState<VideoTrack[]>([]);
  const [audioDevices, setAudioDevices] = useState<VideoTrack[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<VideoTrack[]>([]);
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const socketRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout>();
  const recordingTimerRef = useRef<NodeJS.Timeout>();

  // Video quality presets
  const qualityPresets = {
    low: { width: 640, height: 480, frameRate: 15 },
    medium: { width: 1280, height: 720, frameRate: 30 },
    high: { width: 1920, height: 1080, frameRate: 60 }
  };

  useEffect(() => {
    initializeCall();
    return () => cleanupCall();
  }, []);

  useEffect(() => {
    if (isConnected) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isConnected]);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        setRecordingTime(0);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const initializeCall = async () => {
    try {
      // Initialize socket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
      
      socketRef.current.on('connect', () => {
        console.log('Connected to signaling server');
        socketRef.current.emit('join-session', { sessionId, userId, userName });
      });

      // WebRTC signaling
      socketRef.current.on('offer', async ({ offer, from }) => {
        if (!peerConnection) {
          await createPeerConnection();
        }
        await peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection?.createAnswer();
        await peerConnection?.setLocalDescription(answer);
        socketRef.current.emit('answer', { answer, to: from });
      });

      socketRef.current.on('answer', async ({ answer }) => {
        await peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socketRef.current.on('ice-candidate', async ({ candidate }) => {
        await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socketRef.current.on('user-joined', async ({ userId: joinedUserId }) => {
        if (joinedUserId !== userId) {
          await createPeerConnection();
          const offer = await peerConnection?.createOffer();
          await peerConnection?.setLocalDescription(offer);
          socketRef.current.emit('offer', { offer, to: joinedUserId });
        }
      });

      socketRef.current.on('user-left', () => {
        setIsConnected(false);
        if (remoteVideoRef) {
          remoteVideoRef.srcObject = null;
        }
      });

      // Get media devices
      await getDevices();
      
      // Get initial media stream
      await getMediaStream();

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize video call');
    }
  };

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

      setVideoDevices(videoInputs.map(device => ({
        kind: device.kind,
        id: device.deviceId,
        label: device.label || `Camera ${videoInputs.indexOf(device) + 1}`,
        deviceId: device.deviceId
      })));

      setAudioDevices(audioInputs.map(device => ({
        kind: device.kind,
        id: device.deviceId,
        label: device.label || `Microphone ${audioInputs.indexOf(device) + 1}`,
        deviceId: device.deviceId
      })));

      setAudioOutputDevices(audioOutputs.map(device => ({
        kind: device.kind,
        id: device.deviceId,
        label: device.label || `Speaker ${audioOutputs.indexOf(device) + 1}`,
        deviceId: device.deviceId
      })));

      // Set default devices
      if (videoInputs.length > 0) {
        setSelectedCamera(videoInputs[0].deviceId);
      }
      if (audioInputs.length > 0) {
        setSelectedMicrophone(audioInputs[0].deviceId);
      }
      if (audioOutputs.length > 0) {
        setSelectedSpeaker(audioOutputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const getMediaStream = async (screenShare = false) => {
    try {
      const constraints = {
        video: screenShare ? 
          { 
            cursor: 'always',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } : 
          {
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
            width: qualityPresets[videoQuality].width,
            height: qualityPresets[videoQuality].height,
            frameRate: qualityPresets[videoQuality].frameRate
          },
        audio: screenShare ? false : {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = screenShare ? 
        await navigator.mediaDevices.getDisplayMedia(constraints) :
        await navigator.mediaDevices.getUserMedia(constraints);

      if (localVideoRef) {
        localVideoRef.srcObject = stream;
      }

      setLocalStream(stream);
      
      // Add tracks to peer connection
      if (peerConnection) {
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
      }

      // Setup recording if enabled
      if (isRecording && !screenShare) {
        setupRecording(stream);
      }

      return stream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      toast.error('Failed to access camera/microphone');
      return null;
    }
  };

  const createPeerConnection = async () => {
    try {
      const configuration = {
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
      };

      const pc = new RTCPeerConnection(configuration);
      setPeerConnection(pc);

      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle remote tracks
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
          socketRef.current.emit('ice-candidate', {
            candidate: event.candidate,
            to: sessionId
          });
        }
      };

      // Monitor connection quality
      pc.onconnectionstatechange = () => {
        updateConnectionQuality(pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        updateConnectionQuality(pc.iceConnectionState);
      };

      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  };

  const updateConnectionQuality = (state: string) => {
    switch (state) {
      case 'connected':
      case 'completed':
        setConnectionQuality('excellent');
        break;
      case 'checking':
      case 'disconnected':
        setConnectionQuality('good');
        break;
      case 'failed':
      case 'closed':
        setConnectionQuality('poor');
        break;
    }
  };

  const toggleVideo = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
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
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        const newStream = await getMediaStream(true);
        setLocalStream(newStream);
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        setIsRecording(false);
        
        // Save recording
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `session-${sessionId}-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        }
        setRecordedChunks([]);
      }
    } else {
      // Start recording
      if (localStream) {
        setupRecording(localStream);
        setIsRecording(true);
      }
    }
  };

  const setupRecording = (stream: MediaStream) => {
    try {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error setting up recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const changeVideoDevice = async (deviceId: string) => {
    setSelectedCamera(deviceId);
    if (localStream && !isScreenSharing) {
      localStream.getTracks().forEach(track => track.stop());
      const newStream = await getMediaStream(false);
      setLocalStream(newStream);
    }
  };

  const changeAudioDevice = async (deviceId: string) => {
    setSelectedMicrophone(deviceId);
    if (localStream && !isScreenSharing) {
      localStream.getTracks().forEach(track => track.stop());
      const newStream = await getMediaStream(false);
      setLocalStream(newStream);
    }
  };

  const changeVideoQuality = async (quality: 'low' | 'medium' | 'high') => {
    setVideoQuality(quality);
    if (localStream && !isScreenSharing) {
      localStream.getTracks().forEach(track => track.stop());
      const newStream = await getMediaStream(false);
      setLocalStream(newStream);
    }
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
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const endCall = () => {
    cleanupCall();
    onEndCall();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">
            {isTutor ? `Session with ${studentName}` : `Session with ${tutorName}`}
          </h1>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
          <div className="flex items-center space-x-1">
            {getConnectionQualityIcon()}
            <span className="text-white text-sm capitalize">{connectionQuality}</span>
          </div>
          <div className="text-white text-sm">
            Duration: {formatTime(callDuration)}
          </div>
          {isRecording && (
            <div className="flex items-center space-x-1 text-red-500">
              <Recording className="h-4 w-4 animate-pulse" />
              <span className="text-sm">REC {formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWhiteboard(!showWhiteboard)}
          >
            <Monitor className="h-4 w-4" />
            Whiteboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Remote Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={setRemoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Waiting for participant to join...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={setLocalVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="outline">You</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Settings</h3>
            
            {/* Video Settings */}
            <div className="mb-6">
              <h4 className="text-white text-sm font-medium mb-2">Video</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-xs">Camera</label>
                  <Select value={selectedCamera} onValueChange={changeVideoDevice}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoDevices.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-gray-300 text-xs">Quality</label>
                  <Select value={videoQuality} onValueChange={changeVideoQuality}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (640x480)</SelectItem>
                      <SelectItem value="medium">Medium (1280x720)</SelectItem>
                      <SelectItem value="high">High (1920x1080)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Audio Settings */}
            <div className="mb-6">
              <h4 className="text-white text-sm font-medium mb-2">Audio</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-xs">Microphone</label>
                  <Select value={selectedMicrophone} onValueChange={changeAudioDevice}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-gray-300 text-xs">Speaker</label>
                  <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audioOutputDevices.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Whiteboard Panel */}
        {showWhiteboard && (
          <div className="w-96 bg-white p-4">
            <DigitalWhiteboard
              sessionId={sessionId}
              userId={userId}
              userName={userName}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={toggleRecording}
          >
            {isRecording ? <RecordingOff className="h-5 w-5" /> : <Recording className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}