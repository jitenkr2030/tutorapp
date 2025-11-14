'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, Video, Upload, Download, Settings, Waveform, Monitor } from 'lucide-react'

interface MediaProcessorProps {
  onProcessed?: (result: any) => void
  showAdvancedOptions?: boolean
}

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

export function MediaProcessor({ onProcessed, showAdvancedOptions = true }: MediaProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string>('')
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>('')
  const [results, setResults] = useState<any>(null)
  
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
      setResults(null)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
      setResults(null)
    }
  }

  const processAudio = async () => {
    if (!audioFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('options', JSON.stringify(audioOptions))

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/media-processing/audio', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        setResults(result)
        
        // Create blob from base64
        const byteCharacters = atob(result.processedAudio)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'audio/wav' })
        setProcessedAudioUrl(URL.createObjectURL(blob))

        if (onProcessed) {
          onProcessed(result)
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const processVideo = async () => {
    if (!videoFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('options', JSON.stringify(videoOptions))

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 300)

      const response = await fetch('/api/media-processing/video', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        setResults(result)
        
        // Create blob from array buffer
        const blob = new Blob([result.processedVideo], { type: 'video/webm' })
        setProcessedVideoUrl(URL.createObjectURL(blob))

        if (onProcessed) {
          onProcessed(result)
        }
      }
    } catch (error) {
      console.error('Error processing video:', error)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const downloadProcessedMedia = (type: 'audio' | 'video') => {
    const url = type === 'audio' ? processedAudioUrl : processedVideoUrl
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.download = `processed-${type}.${type === 'audio' ? 'wav' : 'webm'}`
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Waveform className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Audio Processing
              </CardTitle>
              <CardDescription>
                Upload and enhance audio files with advanced processing
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

          {showAdvancedOptions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Audio Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(audioOptions).map(([key, value]) => (
                    key !== 'language' && (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => setAudioOptions({...audioOptions, [key]: e.target.checked})}
                        />
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video Processing
              </CardTitle>
              <CardDescription>
                Upload and enhance video files with advanced processing
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
                    <video ref={videoRef} src={videoUrl} controls className="flex-1 max-h-48" />
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

          {showAdvancedOptions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Video Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(videoOptions).map(([key, value]) => (
                    key !== 'quality' && (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => setVideoOptions({...videoOptions, [key]: e.target.checked})}
                        />
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    )
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <select
                    value={videoOptions.quality}
                    onChange={(e) => setVideoOptions({...videoOptions, quality: e.target.value as any})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {processedVideoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <video src={processedVideoUrl} controls className="flex-1 max-h-48" />
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

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.transcription && (
              <div>
                <h4 className="font-semibold mb-2">Transcription</h4>
                <p className="text-sm bg-muted p-3 rounded">{results.transcription.text}</p>
              </div>
            )}

            {results.analysis && (
              <div>
                <h4 className="font-semibold mb-2">Content Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Sentiment:</span>{' '}
                    <Badge variant={results.analysis.sentiment.overall === 'positive' ? 'default' : 'secondary'}>
                      {results.analysis.sentiment.overall}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Topics:</span>{' '}
                    {results.analysis.topics?.map((topic: string, i: number) => (
                      <Badge key={i} variant="outline" className="ml-1">{topic}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {results.qualityMetrics && (
              <div>
                <h4 className="font-semibold mb-2">Quality Assessment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Score</span>
                    <span>{Math.round(results.qualityMetrics.overall.score * 100)}%</span>
                  </div>
                  <Progress value={results.qualityMetrics.overall.score * 100} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}