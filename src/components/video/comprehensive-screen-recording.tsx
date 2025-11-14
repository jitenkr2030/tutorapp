"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Camera,
  CameraOff,
  Settings,
  Maximize,
  Minimize,
  Recording,
  RecordingOff,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Download,
  Share,
  Clock,
  Volume2,
  VolumeX,
  Edit3,
  Trash2,
  Save,
  Filter,
  Crop,
  RotateCcw,
  Layers,
  Subtitles,
  Music,
  Image,
  FileText,
  HardDrive,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";

interface ScreenRecordingProps {
  sessionId: string;
  userId: string;
  userName: string;
  isTutor: boolean;
}

interface RecordingSegment {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  description?: string;
  thumbnail?: string;
}

interface AudioTrack {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  enabled: boolean;
}

interface VideoFilter {
  id: string;
  name: string;
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'grayscale';
  value: number;
  enabled: boolean;
}

interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov' | 'gif';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  includeAudio: boolean;
  includeWebcam: boolean;
}

export default function ComprehensiveScreenRecording({ 
  sessionId, 
  userId, 
  userName, 
  isTutor 
}: ScreenRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  // Recording settings
  const [recordingMode, setRecordingMode] = useState<'screen' | 'screen+webcam' | 'webcam-only'>('screen');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true);
  const [recordingQuality, setRecordingQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [selectedRegion, setSelectedRegion] = useState<boolean>(false);
  
  // Editing features
  const [segments, setSegments] = useState<RecordingSegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<RecordingSegment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Audio tracks
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    { id: 'mic', name: 'Microphone', volume: 100, muted: false, enabled: true },
    { id: 'system', name: 'System Audio', volume: 80, muted: false, enabled: true }
  ]);
  
  // Video filters
  const [filters, setFilters] = useState<VideoFilter[]>([
    { id: 'brightness', name: 'Brightness', type: 'brightness', value: 100, enabled: false },
    { id: 'contrast', name: 'Contrast', type: 'contrast', value: 100, enabled: false },
    { id: 'saturation', name: 'Saturation', type: 'saturation', value: 100, enabled: false }
  ]);
  
  // Export settings
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    frameRate: 30,
    includeAudio: true,
    includeWebcam: false
  });
  
  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTrimDialog, setShowTrimDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const playbackTimerRef = useRef<NodeJS.Timeout>();

  // Recording quality presets
  const qualityPresets = {
    high: { width: 1920, height: 1080, frameRate: 60, bitrate: 8000000 },
    medium: { width: 1280, height: 720, frameRate: 30, bitrate: 4000000 },
    low: { width: 854, height: 480, frameRate: 15, bitrate: 2000000 }
  };

  useEffect(() => {
    if (isRecording && !isPaused) {
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
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      playbackTimerRef.current = setInterval(() => {
        setPlaybackTime(videoRef.current?.currentTime || 0);
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

  const startScreenRecording = async () => {
    try {
      let stream: MediaStream;
      
      if (recordingMode === 'webcam-only') {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: includeAudio 
        });
      } else {
        // Screen recording
        const screenConstraints: MediaStreamConstraints = {
          video: selectedRegion ? {
            cursor: "always"
          } : true,
          audio: includeSystemAudio
        };
        
        stream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
        
        // Add webcam if needed
        if (recordingMode === 'screen+webcam') {
          const webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: includeAudio 
          });
          setWebcamStream(webcamStream);
          
          // Add webcam tracks to main stream
          webcamStream.getTracks().forEach(track => {
            stream.addTrack(track);
          });
        }
      }
      
      setScreenStream(stream);
      
      const preset = qualityPresets[recordingQuality];
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: preset.bitrate
      };

      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        setIsPaused(false);
        
        // Create initial segment
        const segment: RecordingSegment = {
          id: `segment-${Date.now()}`,
          startTime: 0,
          endTime: recordingTime,
          title: `Recording ${new Date().toLocaleString()}`,
          description: 'Full recording'
        };
        setSegments([segment]);
        setTrimEnd(recordingTime);
        
        toast.success("Recording completed");
      };

      recorder.start(1000);
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

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
      toast.success("Recording paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
      toast.success("Recording resumed");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      
      // Stop all tracks
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      
      setScreenStream(null);
      setWebcamStream(null);
    }
  };

  const createSegment = () => {
    if (!recordedVideoUrl) return;
    
    const segment: RecordingSegment = {
      id: `segment-${Date.now()}`,
      startTime: trimStart,
      endTime: trimEnd,
      title: `Segment ${segments.length + 1}`,
      description: `From ${formatTime(trimStart)} to ${formatTime(trimEnd)}`
    };
    
    setSegments(prev => [...prev, segment]);
    setShowTrimDialog(false);
    toast.success("Segment created");
  };

  const deleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    toast.success("Segment deleted");
  };

  const exportVideo = async () => {
    if (!recordedVideoUrl) return;
    
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would:
      // 1. Apply all edits and filters
      // 2. Combine segments
      // 3. Export in the selected format
      
      const link = document.createElement('a');
      link.download = `screen-recording-${sessionId}-${Date.now()}.${exportSettings.format}`;
      link.href = recordedVideoUrl;
      link.click();
      
      toast.success("Video exported successfully");
      setShowExportDialog(false);
    } catch (error) {
      toast.error("Failed to export video");
    } finally {
      setIsExporting(false);
    }
  };

  const updateFilter = (filterId: string, value: number) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === filterId ? { ...filter, value } : filter
      )
    );
  };

  const toggleFilter = (filterId: string) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === filterId ? { ...filter, enabled: !filter.enabled } : filter
      )
    );
  };

  const updateAudioTrack = (trackId: string, updates: Partial<AudioTrack>) => {
    setAudioTracks(prev => 
      prev.map(track => 
        track.id === trackId ? { ...track, ...updates } : track
      )
    );
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

  const getRecordingStats = () => {
    const totalSize = recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    return {
      duration: recordingTime,
      fileSize: totalSize,
      frameRate: qualityPresets[recordingQuality].frameRate,
      resolution: `${qualityPresets[recordingQuality].width}x${qualityPresets[recordingQuality].height}`
    };
  };

  const stats = getRecordingStats();

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Comprehensive Screen Recording
          </CardTitle>
          <CardDescription>
            Professional screen recording with advanced editing and export features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <span className="font-medium">
                {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Not Recording'}
              </span>
              {isRecording && (
                <Badge variant={isPaused ? "secondary" : "destructive"}>
                  <Recording className="h-3 w-3 mr-1" />
                  {formatTime(recordingTime)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mode:</span>
              <Select value={recordingMode} onValueChange={(value: any) => setRecordingMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Screen Only</SelectItem>
                  <SelectItem value="screen+webcam">Screen + Webcam</SelectItem>
                  <SelectItem value="webcam-only">Webcam Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recording Stats */}
          {isRecording && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Duration</div>
                <div className="text-blue-600">{formatTime(stats.duration)}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">File Size</div>
                <div className="text-green-600">{formatFileSize(stats.fileSize)}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">Resolution</div>
                <div className="text-purple-600">{stats.resolution}</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-800">Frame Rate</div>
                <div className="text-orange-600">{stats.frameRate} fps</div>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startScreenRecording} className="flex-1">
                <Recording className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={resumeRecording} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} variant="outline" className="flex-1">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button onClick={stopRecording} variant="destructive" className="flex-1">
                  <RecordingOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              </>
            )}
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isRecording}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Recording Settings</DialogTitle>
                  <DialogDescription>
                    Configure recording quality and options
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Quality</Label>
                    <Select value={recordingQuality} onValueChange={(value: any) => setRecordingQuality(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (1080p 60fps)</SelectItem>
                        <SelectItem value="medium">Medium (720p 30fps)</SelectItem>
                        <SelectItem value="low">Low (480p 15fps)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-audio"
                      checked={includeAudio}
                      onChange={(e) => setIncludeAudio(e.target.checked)}
                      disabled={isRecording}
                    />
                    <Label htmlFor="include-audio">Include Microphone Audio</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-system-audio"
                      checked={includeSystemAudio}
                      onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                      disabled={isRecording}
                    />
                    <Label htmlFor="include-system-audio">Include System Audio</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="selected-region"
                      checked={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.checked)}
                      disabled={isRecording}
                    />
                    <Label htmlFor="selected-region">Record Selected Region</Label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recording Preview and Editing */}
      {recordedVideoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recording Preview & Editor</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" onClick={() => setShowTrimDialog(true)}>
                  <Scissors className="h-4 w-4 mr-2" />
                  Trim
                </Button>
                <Button onClick={() => setShowExportDialog(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={recordedVideoUrl}
                className="w-full max-h-96"
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setPlaybackTime(videoRef.current?.currentTime || 0)}
              />
              
              {/* Webcam Overlay */}
              {webcamStream && (
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  muted
                  className="absolute bottom-4 right-4 w-48 h-36 border-2 border-white rounded-lg shadow-lg"
                />
              )}
              
              {/* Playback Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => videoRef.current?.play()}
                    disabled={isPlaying}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => videoRef.current?.pause()}
                    disabled={!isPlaying}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[playbackTime]}
                      max={videoRef.current?.duration || 100}
                      step={1}
                      onValueChange={(value) => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = value[0];
                        }
                      }}
                    />
                  </div>
                  
                  <span className="text-white text-sm">
                    {formatTime(playbackTime)} / {formatTime(videoRef.current?.duration || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filters.map((filter) => (
                      <div key={filter.id} className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filter.enabled}
                            onChange={() => toggleFilter(filter.id)}
                          />
                          <Label>{filter.name}</Label>
                        </div>
                        <Slider
                          value={[filter.value]}
                          min={0}
                          max={200}
                          step={1}
                          onValueChange={(value) => updateFilter(filter.id, value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-600 w-12">{filter.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Segments List */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Recording Segments</h3>
              <div className="space-y-2">
                {segments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{segment.title}</div>
                      <div className="text-sm text-gray-600">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = segment.startTime;
                        }
                      }}>
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteSegment(segment.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trim Dialog */}
      <Dialog open={showTrimDialog} onOpenChange={setShowTrimDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trim Recording</DialogTitle>
            <DialogDescription>
              Select the portion of the recording to keep
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Start Time</Label>
              <Input
                type="text"
                value={formatTime(trimStart)}
                onChange={(e) => {
                  const parts = e.target.value.split(':').map(Number);
                  const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                  setTrimStart(Math.max(0, Math.min(seconds, trimEnd)));
                }}
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="text"
                value={formatTime(trimEnd)}
                onChange={(e) => {
                  const parts = e.target.value.split(':').map(Number);
                  const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                  setTrimEnd(Math.max(trimStart, Math.min(seconds, recordingTime)));
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createSegment} className="flex-1">
                Create Segment
              </Button>
              <Button variant="outline" onClick={() => setShowTrimDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Video</DialogTitle>
            <DialogDescription>
              Choose export settings for your recording
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <Select 
                value={exportSettings.format} 
                onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Quality</Label>
              <Select 
                value={exportSettings.quality} 
                onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, quality: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="ultra">Ultra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Resolution</Label>
              <Select 
                value={exportSettings.resolution} 
                onValueChange={(value: any) => setExportSettings(prev => ({ ...prev, resolution: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="4k">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="export-audio"
                checked={exportSettings.includeAudio}
                onChange={(e) => setExportSettings(prev => ({ ...prev, includeAudio: e.target.checked }))}
              />
              <Label htmlFor="export-audio">Include Audio</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="export-webcam"
                checked={exportSettings.includeWebcam}
                onChange={(e) => setExportSettings(prev => ({ ...prev, includeWebcam: e.target.checked }))}
              />
              <Label htmlFor="export-webcam">Include Webcam Overlay</Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={exportVideo} className="flex-1" disabled={isExporting}>
                {isExporting ? 'Exporting...' : 'Export Video'}
              </Button>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}