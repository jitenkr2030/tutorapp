'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mic, Video, Upload, Download, Play, Pause, Volume2, Settings } from 'lucide-react'

interface AudioProcessingOptions {
  noiseReduction: boolean
  echoCancellation: boolean
  volumeNormalization: boolean
  speechEnhancement: boolean
  backgroundMusicRemoval: boolean
  language: string
}

interface VideoProcessingOptions {
  resolutionEnhancement: boolean
  brightnessCorrection: boolean
  contrastEnhancement: boolean
  stabilization: boolean
  backgroundBlur: boolean
  quality: 'low' | 'medium' | 'high' | 'ultra'
}

interface MediaQualityMetrics {
  audio: {
    clarity: number
    volume: number
    noiseLevel: number
    speechIntelligibility: number
  }
  video: {
    resolution: string
    frameRate: number
    bitrate: number
    stability: number
    brightness: number
    contrast: number
  }
  overall: {
    score: number
    recommendations: string[]
  }
}

export default function MediaProcessingPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string>('')
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>('')
  const [transcription, setTranscription] = useState<string>('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [qualityMetrics, setQualityMetrics] = useState<MediaQualityMetrics | null>(null)
  
  const [audioOptions, setAudioOptions] = useState<AudioProcessingOptions>({
    noiseReduction: true,
    echoCancellation: true,
    volumeNormalization: true,
    speechEnhancement: true,
    backgroundMusicRemoval: false,
    language: 'en'
  })

  const [videoOptions, setVideoOptions] = useState<VideoProcessingOptions>({
    resolutionEnhancement: true,
    brightnessCorrection: true,
    contrastEnhancement: true,
    stabilization: true,
    backgroundBlur: false,
    quality: 'high'
  })

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
      setAudioUrl(URL.createObjectURL(file))
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
    }
  }

  const processAudio = async () => {
    if (!audioFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulate processing progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Mock processed audio URL
      setProcessedAudioUrl(audioUrl)
      
      // Mock transcription
      setTranscription("Hello and welcome to today's tutoring session. Today we'll be covering advanced mathematics concepts. Let's start with the basics of algebra.")
      
      // Mock analysis
      setAnalysis({
        sentiment: { overall: 'positive', score: 0.75 },
        topics: ['Mathematics', 'Education'],
        keyPhrases: ['advanced mathematics', 'tutoring session', 'basics of algebra'],
        actionItems: ['Review algebra basics', 'Prepare advanced examples']
      })

      // Mock quality metrics
      setQualityMetrics({
        audio: {
          clarity: 0.85,
          volume: 0.72,
          noiseLevel: 0.15,
          speechIntelligibility: 0.90
        },
        video: {
          resolution: '1920x1080',
          frameRate: 30,
          bitrate: 1000,
          stability: 0.88,
          brightness: 0.65,
          contrast: 0.70
        },
        overall: {
          score: 0.82,
          recommendations: [
            'Consider using a better microphone for improved clarity',
            'Adjust lighting conditions for better video quality'
          ]
        }
      })
    } catch (error) {
      console.error('Error processing audio:', error)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const processVideo = async () => {
    if (!videoFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulate processing progress
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Mock processed video URL
      setProcessedVideoUrl(videoUrl)
      
      // Mock quality metrics
      setQualityMetrics({
        audio: {
          clarity: 0.80,
          volume: 0.68,
          noiseLevel: 0.20,
          speechIntelligibility: 0.85
        },
        video: {
          resolution: '1920x1080',
          frameRate: 30,
          bitrate: 1500,
          stability: 0.92,
          brightness: 0.75,
          contrast: 0.80
        },
        overall: {
          score: 0.85,
          recommendations: [
            'Video quality is good, consider enabling background blur for privacy',
            'Audio could benefit from noise reduction'
          ]
        }
      })
    } catch (error) {
      console.error('Error processing video:', error)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const downloadProcessedMedia = (type: 'audio' | 'video') => {
    const url = type === 'audio' ? processedAudioUrl : processedVideoUrl
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.download = `processed-${type}.${type === 'audio' ? 'mp3' : 'mp4'}`
      a.click()
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Advanced Media Processing</h1>
        <p className="text-muted-foreground">
          Enhance your audio and video content with AI-powered processing tools
        </p>
      </div>

      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Audio Processing
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Processing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audio Upload & Processing</CardTitle>
              <CardDescription>
                Upload audio files for enhancement, noise reduction, and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload">
                  <Button variant="outline" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Audio
                  </Button>
                </label>
                {audioFile && (
                  <Badge variant="secondary">{audioFile.name}</Badge>
                )}
              </div>

              {audioUrl && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <audio ref={audioRef} src={audioUrl} controls className="flex-1" />
                    <Button onClick={processAudio} disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : 'Process Audio'}
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Processing audio... {progress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Audio Processing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={audioOptions.noiseReduction}
                    onChange={(e) => setAudioOptions({...audioOptions, noiseReduction: e.target.checked})}
                  />
                  <span>Noise Reduction</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={audioOptions.echoCancellation}
                    onChange={(e) => setAudioOptions({...audioOptions, echoCancellation: e.target.checked})}
                  />
                  <span>Echo Cancellation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={audioOptions.volumeNormalization}
                    onChange={(e) => setAudioOptions({...audioOptions, volumeNormalization: e.target.checked})}
                  />
                  <span>Volume Normalization</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={audioOptions.speechEnhancement}
                    onChange={(e) => setAudioOptions({...audioOptions, speechEnhancement: e.target.checked})}
                  />
                  <span>Speech Enhancement</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {processedAudioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Audio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <audio src={processedAudioUrl} controls className="flex-1" />
                  <Button onClick={() => downloadProcessedMedia('audio')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Upload & Processing</CardTitle>
              <CardDescription>
                Upload video files for enhancement, stabilization, and quality improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button variant="outline" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </label>
                {videoFile && (
                  <Badge variant="secondary">{videoFile.name}</Badge>
                )}
              </div>

              {videoUrl && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <video ref={videoRef} src={videoUrl} controls className="flex-1 max-h-64" />
                    <Button onClick={processVideo} disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : 'Process Video'}
                    </Button>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Processing video... {progress}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Video Processing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={videoOptions.resolutionEnhancement}
                    onChange={(e) => setVideoOptions({...videoOptions, resolutionEnhancement: e.target.checked})}
                  />
                  <span>Resolution Enhancement</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={videoOptions.brightnessCorrection}
                    onChange={(e) => setVideoOptions({...videoOptions, brightnessCorrection: e.target.checked})}
                  />
                  <span>Brightness Correction</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={videoOptions.contrastEnhancement}
                    onChange={(e) => setVideoOptions({...videoOptions, contrastEnhancement: e.target.checked})}
                  />
                  <span>Contrast Enhancement</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={videoOptions.stabilization}
                    onChange={(e) => setVideoOptions({...videoOptions, stabilization: e.target.checked})}
                  />
                  <span>Stabilization</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={videoOptions.backgroundBlur}
                    onChange={(e) => setVideoOptions({...videoOptions, backgroundBlur: e.target.checked})}
                  />
                  <span>Background Blur</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {processedVideoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <video src={processedVideoUrl} controls className="flex-1 max-h-64" />
                  <Button onClick={() => downloadProcessedMedia('video')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{transcription}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Content Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Sentiment</h4>
                <Badge variant={analysis.sentiment.overall === 'positive' ? 'default' : 'secondary'}>
                  {analysis.sentiment.overall} ({Math.round(analysis.sentiment.score * 100)}%)
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Topics</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.topics.map((topic: string, index: number) => (
                    <Badge key={index} variant="outline">{topic}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Phrases</h4>
              <div className="flex flex-wrap gap-1">
                {analysis.keyPhrases.map((phrase: string, index: number) => (
                  <Badge key={index} variant="secondary">{phrase}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Action Items</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {analysis.actionItems.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {qualityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Audio Quality</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Clarity</span>
                    <span>{Math.round(qualityMetrics.audio.clarity * 100)}%</span>
                  </div>
                  <Progress value={qualityMetrics.audio.clarity * 100} />
                  <div className="flex justify-between text-sm">
                    <span>Volume</span>
                    <span>{Math.round(qualityMetrics.audio.volume * 100)}%</span>
                  </div>
                  <Progress value={qualityMetrics.audio.volume * 100} />
                  <div className="flex justify-between text-sm">
                    <span>Speech Intelligibility</span>
                    <span>{Math.round(qualityMetrics.audio.speechIntelligibility * 100)}%</span>
                  </div>
                  <Progress value={qualityMetrics.audio.speechIntelligibility * 100} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Video Quality</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Stability</span>
                    <span>{Math.round(qualityMetrics.video.stability * 100)}%</span>
                  </div>
                  <Progress value={qualityMetrics.video.stability * 100} />
                  <div className="flex justify-between text-sm">
                    <span>Brightness</span>
                    <span>{Math.round(qualityMetrics.video.brightness * 100)}%</span>
                  </div>
                  <Progress value={qualityMetrics.video.brightness * 100} />
                  <div className="flex justify-between text-sm">
                    <span>Contrast</span>
                    <span>{Math.round(qualityMetrics.video.contrast * 100)}%</span>
                  </div>
                  <Progress value={qualityMetrics.video.contrast * 100} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Overall Score</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Quality</span>
                    <span>{Math.round(qualityMetrics.overall.score * 100)}%</span>
                  </div>
                  <Progress value={qualityMetrics.overall.score * 100} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {qualityMetrics.overall.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}