import { NextRequest, NextResponse } from 'next/server'
import { advancedMediaProcessor } from '@/lib/media/advanced-media-processor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const options = JSON.parse(formData.get('options') as string)

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    // Create video element from file
    const videoUrl = URL.createObjectURL(videoFile)
    const videoElement = document.createElement('video')
    videoElement.src = videoUrl
    videoElement.muted = true
    videoElement.playsInline = true

    // Wait for video to load
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = resolve
    })

    // Process video
    const processedVideo = await advancedMediaProcessor.processVideo(videoElement, options)

    // Assess quality
    const qualityMetrics = await advancedMediaProcessor.assessMediaQuality(undefined, videoElement)

    // Clean up
    URL.revokeObjectURL(videoUrl)

    return NextResponse.json({
      success: true,
      processedVideo: await processedVideo.arrayBuffer(),
      qualityMetrics
    })

  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    )
  }
}