import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp' | 'avif'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: string
  background?: string
  progressive?: boolean
  withoutEnlargement?: boolean
  withoutReduction?: boolean
}

export interface ImageMetadata {
  format: string
  width: number
  height: number
  size: number
  density?: number
  hasAlpha?: boolean
  hasProfile?: boolean
}

export interface OptimizationResult {
  success: boolean
  outputPath?: string
  originalSize?: number
  optimizedSize?: number
  savings?: number
  metadata?: ImageMetadata
  error?: string
}

export class ImageOptimizer {
  private defaultOptions: ImageOptimizationOptions = {
    quality: 80,
    format: 'webp',
    fit: 'cover',
    progressive: true,
    withoutEnlargement: true,
  }

  private supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'svg', 'tiff']

  constructor() {
    // Check if sharp is available
    if (!sharp) {
      console.warn('Sharp is not available. Image optimization will be disabled.')
    }
  }

  async optimizeImage(
    inputPath: string,
    outputPath: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult> {
    try {
      if (!sharp) {
        return {
          success: false,
          error: 'Sharp is not available for image optimization',
        }
      }

      // Get original file stats
      const originalStats = await fs.stat(inputPath)
      const originalSize = originalStats.size

      // Merge options with defaults
      const mergedOptions = { ...this.defaultOptions, ...options }

      // Create sharp instance
      let pipeline = sharp(inputPath)

      // Get metadata
      const metadata = await pipeline.metadata()

      // Apply transformations
      if (mergedOptions.width || mergedOptions.height) {
        pipeline = pipeline.resize(
          mergedOptions.width,
          mergedOptions.height,
          {
            fit: mergedOptions.fit,
            position: mergedOptions.position,
            withoutEnlargement: mergedOptions.withoutEnlargement,
            withoutReduction: mergedOptions.withoutReduction,
          }
        )
      }

      // Apply format-specific optimizations
      switch (mergedOptions.format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: mergedOptions.quality,
            progressive: mergedOptions.progressive,
          })
          break
        case 'png':
          pipeline = pipeline.png({
            quality: mergedOptions.quality,
            progressive: mergedOptions.progressive,
          })
          break
        case 'webp':
          pipeline = pipeline.webp({
            quality: mergedOptions.quality,
          })
          break
        case 'avif':
          pipeline = pipeline.avif({
            quality: mergedOptions.quality,
          })
          break
      }

      // Set background if specified
      if (mergedOptions.background) {
        pipeline = pipeline.background(mergedOptions.background)
      }

      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true })

      // Process the image
      await pipeline.toFile(outputPath)

      // Get optimized file stats
      const optimizedStats = await fs.stat(outputPath)
      const optimizedSize = optimizedStats.size

      // Calculate savings
      const savings = ((originalSize - optimizedSize) / originalSize) * 100

      return {
        success: true,
        outputPath,
        originalSize,
        optimizedSize,
        savings,
        metadata: {
          format: mergedOptions.format!,
          width: metadata.width || 0,
          height: metadata.height || 0,
          size: optimizedSize,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          hasProfile: metadata.hasProfile,
        },
      }
    } catch (error) {
      console.error('Image optimization failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async optimizeBuffer(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult> {
    try {
      if (!sharp) {
        return {
          success: false,
          error: 'Sharp is not available for image optimization',
        }
      }

      const originalSize = buffer.length
      const mergedOptions = { ...this.defaultOptions, ...options }

      // Create sharp instance from buffer
      let pipeline = sharp(buffer)

      // Get metadata
      const metadata = await pipeline.metadata()

      // Apply transformations (same as above)
      if (mergedOptions.width || mergedOptions.height) {
        pipeline = pipeline.resize(
          mergedOptions.width,
          mergedOptions.height,
          {
            fit: mergedOptions.fit,
            position: mergedOptions.position,
            withoutEnlargement: mergedOptions.withoutEnlargement,
            withoutReduction: mergedOptions.withoutReduction,
          }
        )
      }

      // Apply format-specific optimizations
      switch (mergedOptions.format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: mergedOptions.quality,
            progressive: mergedOptions.progressive,
          })
          break
        case 'png':
          pipeline = pipeline.png({
            quality: mergedOptions.quality,
            progressive: mergedOptions.progressive,
          })
          break
        case 'webp':
          pipeline = pipeline.webp({
            quality: mergedOptions.quality,
          })
          break
        case 'avif':
          pipeline = pipeline.avif({
            quality: mergedOptions.quality,
          })
          break
      }

      if (mergedOptions.background) {
        pipeline = pipeline.background(mergedOptions.background)
      }

      // Get optimized buffer
      const optimizedBuffer = await pipeline.toBuffer()
      const optimizedSize = optimizedBuffer.length

      const savings = ((originalSize - optimizedSize) / originalSize) * 100

      return {
        success: true,
        originalSize,
        optimizedSize,
        savings,
        metadata: {
          format: mergedOptions.format!,
          width: metadata.width || 0,
          height: metadata.height || 0,
          size: optimizedSize,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          hasProfile: metadata.hasProfile,
        },
      }
    } catch (error) {
      console.error('Buffer optimization failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async generateResponsiveImages(
    inputPath: string,
    outputDir: string,
    sizes: Array<{ width: number; height?: number; suffix?: string }> = [
      { width: 640, suffix: 'small' },
      { width: 1024, suffix: 'medium' },
      { width: 1920, suffix: 'large' },
    ]
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []

    try {
      if (!sharp) {
        return [{
          success: false,
          error: 'Sharp is not available for image optimization',
        }]
      }

      // Get base filename without extension
      const baseName = path.basename(inputPath, path.extname(inputPath))

      // Generate images for each size
      for (const size of sizes) {
        const suffix = size.suffix || `${size.width}w`
        const outputPath = path.join(outputDir, `${baseName}-${suffix}.webp`)

        const result = await this.optimizeImage(inputPath, outputPath, {
          width: size.width,
          height: size.height,
          format: 'webp',
          quality: 80,
        })

        results.push(result)
      }

      return results
    } catch (error) {
      console.error('Responsive image generation failed:', error)
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }]
    }
  }

  async getImageMetadata(inputPath: string): Promise<ImageMetadata | null> {
    try {
      if (!sharp) {
        return null
      }

      const metadata = await sharp(inputPath).metadata()
      
      return {
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: (await fs.stat(inputPath)).size,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        hasProfile: metadata.hasProfile,
      }
    } catch (error) {
      console.error('Failed to get image metadata:', error)
      return null
    }
  }

  async createPlaceholder(
    inputPath: string,
    width: number = 20,
    height: number = 20
  ): Promise<string | null> {
    try {
      if (!sharp) {
        return null
      }

      const placeholder = await sharp(inputPath)
        .resize(width, height, { fit: 'inside' })
        .blur()
        .toBuffer()

      return `data:image/jpeg;base64,${placeholder.toString('base64')}`
    } catch (error) {
      console.error('Failed to create placeholder:', error)
      return null
    }
  }

  async batchOptimize(
    inputDir: string,
    outputDir: string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []

    try {
      // Get all image files
      const files = await fs.readdir(inputDir)
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase().slice(1)
        return this.supportedFormats.includes(ext)
      })

      // Process each image
      for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file)
        const outputPath = path.join(outputDir, file.replace(/\.[^/.]+$/, '.webp'))

        const result = await this.optimizeImage(inputPath, outputPath, options)
        results.push(result)
      }

      return results
    } catch (error) {
      console.error('Batch optimization failed:', error)
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }]
    }
  }

  isSupportedFormat(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase().slice(1)
    return this.supportedFormats.includes(ext)
  }

  getSupportedFormats(): string[] {
    return [...this.supportedFormats]
  }
}

// Factory function to create image optimizer
export function createImageOptimizer(): ImageOptimizer {
  return new ImageOptimizer()
}

// Global instance
export const imageOptimizer = createImageOptimizer()

// Utility functions for common image operations
export const imageUtils = {
  // Generate srcset attribute for responsive images
  generateSrcset: (baseUrl: string, widths: number[]): string => {
    return widths
      .map(width => `${baseUrl.replace('{width}', width.toString())} ${width}w`)
      .join(', ')
  },

  // Generate sizes attribute for responsive images
  generateSizes: (breakpoints: Array<{ maxWidth: number; size: string }>): string => {
    return breakpoints
      .map(bp => `(max-width: ${bp.maxWidth}px) ${bp.size}`)
      .join(', ')
  },

  // Calculate aspect ratio
  calculateAspectRatio: (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => {
      return b === 0 ? a : gcd(b, a % b)
    }
    
    const divisor = gcd(width, height)
    return `${width / divisor}:${height / divisor}`
  },

  // Generate image CDN URL
  generateCdnUrl: (
    baseUrl: string,
    path: string,
    options: ImageOptimizationOptions = {}
  ): string => {
    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('f', options.format)
    if (options.fit) params.set('fit', options.fit)

    return `${baseUrl}/${path}?${params.toString()}`
  },

  // Predefined optimization presets
  presets: {
    avatar: {
      width: 150,
      height: 150,
      format: 'webp' as const,
      quality: 80,
      fit: 'cover' as const,
    },
    thumbnail: {
      width: 300,
      height: 200,
      format: 'webp' as const,
      quality: 75,
      fit: 'cover' as const,
    },
    hero: {
      width: 1920,
      height: 1080,
      format: 'webp' as const,
      quality: 85,
      fit: 'cover' as const,
    },
    gallery: {
      width: 800,
      height: 600,
      format: 'webp' as const,
      quality: 80,
      fit: 'cover' as const,
    },
    document: {
      width: 1200,
      format: 'webp' as const,
      quality: 90,
      fit: 'inside' as const,
    },
  },
}