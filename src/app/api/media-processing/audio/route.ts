import { NextRequest, NextResponse } from 'next/server'
import { advancedMediaProcessor } from '@/lib/media/advanced-media-processor'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const options = JSON.parse(formData.get('options') as string)

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer()

    // Process audio
    const processedAudio = await advancedMediaProcessor.processAudio(arrayBuffer, options)

    // Transcribe audio
    const transcription = await advancedMediaProcessor.transcribeAudio(arrayBuffer, options.language)

    // Analyze content
    const analysis = await advancedMediaProcessor.analyzeContent(transcription)

    // Assess quality
    const qualityMetrics = await advancedMediaProcessor.assessMediaQuality(arrayBuffer)

    return NextResponse.json({
      success: true,
      processedAudio: processedAudio.toString('base64'),
      transcription,
      analysis,
      qualityMetrics
    })

  } catch (error) {
    console.error('Error processing audio:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}