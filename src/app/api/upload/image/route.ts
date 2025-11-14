import { NextRequest, NextResponse } from 'next/server'
import { imageOptimizer, imageUtils } from '@/lib/image/image-optimizer'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { withApiOptimization, apiOptimizers } from '@/lib/api/api-optimizer'
import { withRateLimit, rateLimitMiddleware } from '@/lib/rate-limit/rate-limit-middleware'

// Configure rate limiting for image uploads
const uploadRateLimit = withRateLimit(
  async (req: NextRequest) => {
    return handleImageUpload(req)
  },
  {
    windowMs: 3600000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
    keyGenerator: (req) => {
      // Use IP + user ID if available
      const ip = req.headers.get('x-forwarded-for') || 'unknown'
      const userId = req.headers.get('user-id') || 'anonymous'
      return `${ip}:${userId}`
    },
  }
)

// Configure API optimization for image uploads
const optimizedUploadHandler = withApiOptimization(
  uploadRateLimit,
  {
    enableCompression: false, // Don't compress image uploads
    maxBodySize: 104857600, // 100MB
    timeout: 300000, // 5 minutes
    enableCors: true,
    corsOptions: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  }
)

async function handleImageUpload(req: NextRequest): Promise<NextResponse> {
  try {
    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Get optimization options from form data
    const optimize = formData.get('optimize') === 'true'
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined
    const quality = formData.get('quality') ? parseInt(formData.get('quality') as string) : 80
    const format = formData.get('format') as 'jpeg' | 'png' | 'webp' | 'avif' || 'webp'
    const preset = formData.get('preset') as string

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const originalName = file.name.replace(/\.[^/.]+$/, '')
    const extension = path.extname(file.name)
    
    let filename = `${originalName}-${timestamp}-${randomId}${extension}`
    
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = path.join(uploadDir, filename)
    
    // Save original file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const result: any = {
      original: {
        filename,
        path: `/uploads/images/${filename}`,
        size: file.size,
        type: file.type,
        url: `/uploads/images/${filename}`,
      }
    }

    // Optimize image if requested
    if (optimize) {
      const optimizationOptions: any = {
        quality,
        format,
      }

      if (width) optimizationOptions.width = width
      if (height) optimizationOptions.height = height

      // Apply preset if provided
      if (preset && imageUtils.presets[preset as keyof typeof imageUtils.presets]) {
        Object.assign(optimizationOptions, imageUtils.presets[preset as keyof typeof imageUtils.presets])
      }

      // Optimize the image
      const optimizedResult = await imageOptimizer.optimizeBuffer(buffer, optimizationOptions)

      if (optimizedResult.success) {
        // Save optimized image
        const optimizedFilename = `${originalName}-${timestamp}-${randomId}-optimized.${format}`
        const optimizedPath = path.join(uploadDir, optimizedFilename)
        await writeFile(optimizedPath, Buffer.from(optimizedResult.optimizedSize!))

        result.optimized = {
          filename: optimizedFilename,
          path: `/uploads/images/${optimizedFilename}`,
          size: optimizedResult.optimizedSize,
          type: `image/${format}`,
          url: `/uploads/images/${optimizedFilename}`,
          savings: optimizedResult.savings,
          metadata: optimizedResult.metadata,
        }

        // Generate responsive images if requested
        const generateResponsive = formData.get('responsive') === 'true'
        if (generateResponsive) {
          const responsiveResults = await imageOptimizer.generateResponsiveImages(
            filePath,
            path.join(uploadDir, 'responsive'),
            [
              { width: 640, suffix: 'small' },
              { width: 1024, suffix: 'medium' },
              { width: 1920, suffix: 'large' },
            ]
          )

          result.responsive = responsiveResults
            .filter(r => r.success)
            .map(r => ({
              filename: path.basename(r.outputPath!),
              path: `/uploads/images/responsive/${path.basename(r.outputPath!)}`,
              size: r.optimizedSize,
              url: `/uploads/images/responsive/${path.basename(r.outputPath!)}`,
              metadata: r.metadata,
            }))
        }

        // Generate placeholder
        const placeholder = await imageOptimizer.createPlaceholder(filePath)
        if (placeholder) {
          result.placeholder = placeholder
        }
      }
    }

    // Save file record to database (if user is authenticated)
    const userId = req.headers.get('user-id')
    if (userId) {
      try {
        await db.file.create({
          data: {
            userId,
            filename,
            originalName: file.name,
            path: `/uploads/images/${filename}`,
            size: file.size,
            mimeType: file.type,
            optimizedPath: result.optimized?.path,
            optimizedSize: result.optimized?.size,
            metadata: JSON.stringify(result),
          },
        })
      } catch (error) {
        console.error('Failed to save file record to database:', error)
        // Don't fail the upload if database save fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return optimizedUploadHandler(req)
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 })
}