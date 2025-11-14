"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Tag,
  Highlight,
  Download,
  Share,
  Clock,
  MessageSquare,
  Bookmark,
  Edit3
} from "lucide-react";
import { toast } from "sonner";

interface VideoAnnotation {
  id: string;
  timestamp: number; // seconds
  type: 'note' | 'highlight' | 'bookmark';
  content: string;
  author: string;
  createdAt: Date;
}

interface RecordingSegment {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  description?: string;
  tags: string[];
}

interface EnhancedRecordingProps {
  sessionId: string;
  userId: string;
  userName: string;
  isTutor: boolean;
  onEndCall: () => void;
}

export default function EnhancedRecording({ 
  sessionId, 
  userId, 
  userName, 
  isTutor, 
  onEndCall 
}: EnhancedRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showRecordingControls, setShowRecordingControls] = useState(false);
  const [recordingQuality, setRecordingQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [annotations, setAnnotations] = useState<VideoAnnotation[]>([]);
  const [segments, setSegments] = useState<RecordingSegment[]>([]);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [showSegmentDialog, setShowSegmentDialog] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({ type: 'note' as 'note' | 'highlight' | 'bookmark', content: '' });
  const [newSegment, setNewSegment] = useState({ title: '', description: '', tags: '' });
  const [recordingStats, setRecordingStats] = useState({
    fileSize: 0,
    duration: 0,
    frameRate: 30,
    resolution: '1280x720'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const playbackTimerRef = useRef<NodeJS.Timeout>();

  // Recording quality presets
  const qualityPresets = {
    high: { width: 1920, height: 1080, frameRate: 60, bitrate: 8000000 },
    medium: { width: 1280, height: 720, frameRate: 30, bitrate: 4000000 },
    low: { width: 854, height: 480, frameRate: 15, bitrate: 2000000 }
  };

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentPlaybackTime(videoRef.current?.currentTime || 0);
      }, 100);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying]);

  const startRecording = async (stream: MediaStream) => {
    try {
      const preset = qualityPresets[recordingQuality];
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: preset.bitrate
      };

      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
          updateRecordingStats();
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setShowRecordingControls(true);
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setRecordedChunks([]);
      
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      toast.success("Recording stopped");
    }
  };

  const updateRecordingStats = () => {
    const totalSize = recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    setRecordingStats(prev => ({
      ...prev,
      fileSize: totalSize,
      duration: recordingTime
    }));
  };

  const addAnnotation = () => {
    if (!newAnnotation.content.trim()) return;

    const annotation: VideoAnnotation = {
      id: `annotation-${Date.now()}`,
      timestamp: currentPlaybackTime,
      type: newAnnotation.type,
      content: newAnnotation.content,
      author: userName,
      createdAt: new Date()
    };

    setAnnotations(prev => [...prev, annotation]);
    setNewAnnotation({ type: 'note', content: '' });
    setShowAnnotationDialog(false);
    
    toast.success("Annotation added");
  };

  const addSegment = () => {
    if (!newSegment.title.trim()) return;

    const segment: RecordingSegment = {
      id: `segment-${Date.now()}`,
      startTime: currentPlaybackTime,
      endTime: currentPlaybackTime + 30, // Default 30 seconds
      title: newSegment.title,
      description: newSegment.description,
      tags: newSegment.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setSegments(prev => [...prev, segment]);
    setNewSegment({ title: '', description: '', tags: '' });
    setShowSegmentDialog(false);
    
    toast.success("Segment created");
  };

  const jumpToAnnotation = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentPlaybackTime(timestamp);
    }
  };

  const playSegment = (segment: RecordingSegment) => {
    if (videoRef.current) {
      videoRef.current.currentTime = segment.startTime;
      videoRef.current.play();
      setIsPlaying(true);
      
      // Stop at segment end
      const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.currentTime >= segment.endTime) {
          videoRef.current.pause();
          setIsPlaying(false);
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
      
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    }
  };

  const exportAnnotations = () => {
    const data = {
      sessionId,
      annotations,
      segments,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${sessionId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Annotations exported");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Enhanced Recording Controls
          </CardTitle>
          <CardDescription>
            Advanced recording features with annotations, segments, and highlights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="font-medium">
                {isRecording ? 'Recording' : 'Not Recording'}
              </span>
              {isRecording && (
                <Badge variant="destructive">
                  <Recording className="h-3 w-3 mr-1" />
                  {formatTime(recordingTime)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Quality:</span>
              <Select
                value={recordingQuality}
                onValueChange={(value: any) => setRecordingQuality(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recording Stats */}
          {isRecording && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Duration</div>
                <div className="text-blue-600">{formatTime(recordingStats.duration)}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">File Size</div>
                <div className="text-green-600">{formatFileSize(recordingStats.fileSize)}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">Resolution</div>
                <div className="text-purple-600">{recordingStats.resolution}</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800">Frame Rate</div>
                <div className="text-orange-600">{recordingStats.frameRate} fps</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={() => startRecording(/* pass stream */)} className="flex-1">
                <Recording className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex-1">
                <RecordingOff className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
            
            <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!recordedVideoUrl}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Annotation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Annotation</DialogTitle>
                  <DialogDescription>
                    Add a note, highlight, or bookmark at the current timestamp
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newAnnotation.type} 
                      onValueChange={(value: any) => setNewAnnotation(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="highlight">Highlight</SelectItem>
                        <SelectItem value="bookmark">Bookmark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={newAnnotation.content}
                      onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your annotation..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addAnnotation} disabled={!newAnnotation.content.trim()}>
                      Add Annotation
                    </Button>
                    <Button variant="outline" onClick={() => setShowAnnotationDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSegmentDialog} onOpenChange={setShowSegmentDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!recordedVideoUrl}>
                  <Scissors className="h-4 w-4 mr-2" />
                  Create Segment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Segment</DialogTitle>
                  <DialogDescription>
                    Create a segment from the current position for easy navigation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newSegment.title}
                      onChange={(e) => setNewSegment(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Segment title..."
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newSegment.description}
                      onChange={(e) => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Segment description..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={newSegment.tags}
                      onChange={(e) => setNewSegment(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="important, review, homework..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addSegment} disabled={!newSegment.title.trim()}>
                      Create Segment
                    </Button>
                    <Button variant="outline" onClick={() => setShowSegmentDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Video Player with Enhanced Controls */}
      {recordedVideoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Recording Preview</CardTitle>
            <CardDescription>
              Review your recording with enhanced playback controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={recordedVideoUrl}
                className="w-full max-h-96 object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentPlaybackTime(videoRef.current.currentTime);
                  }
                }}
              />
              
              {/* Playback Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-2 text-white">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => videoRef.current?.play()}
                    disabled={isPlaying}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => videoRef.current?.pause()}
                    disabled={!isPlaying}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 text-sm">
                    {formatTime(currentPlaybackTime)}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Annotations and Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Annotations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Annotations ({annotations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 overflow-y-auto">
                  {annotations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No annotations yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {annotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => jumpToAnnotation(annotation.timestamp)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {annotation.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatTime(annotation.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm">{annotation.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                by {annotation.author}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Segments */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Segments ({segments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-64 overflow-y-auto">
                  {segments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No segments created
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => playSegment(segment)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{segment.title}</h4>
                              {segment.description && (
                                <p className="text-xs text-gray-600 mb-2">{segment.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{formatTime(segment.startTime)} - {formatTime(segment.endTime)}</span>
                                <span>•</span>
                                <span>{formatTime(segment.endTime - segment.startTime)}</span>
                              </div>
                              {segment.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {segment.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportAnnotations}>
                <Download className="h-4 w-4 mr-2" />
                Export Annotations
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share Recording
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Select component for the recording quality
function Select({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}

function SelectItem({ children, value }: { children: React.ReactNode; value: string }) {
  return <option value={value}>{children}</option>;
}

function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}