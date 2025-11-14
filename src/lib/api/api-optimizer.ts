import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, z } from 'zod'

export interface ApiOptimizerConfig {
  enableCompression?: boolean
  enableValidation?: boolean
  enableCaching?: boolean
  enableRateLimit?: boolean
  enableLogging?: boolean
  enableCors?: boolean
  corsOptions?: {
    origin?: string | string[]
    methods?: string[]
    allowedHeaders?: string[]
    exposedHeaders?: string[]
    credentials?: boolean
    maxAge?: number
  }
  compressionThreshold?: number // Minimum size in bytes to compress
  validationSchema?: ZodSchema
  rateLimitConfig?: any // Rate limit configuration
  cacheConfig?: any // Cache configuration
  timeout?: number // Request timeout in milliseconds
  maxBodySize?: number // Maximum request body size in bytes
}

export interface ApiMetrics {
  requestCount: number
  responseTime: number[]
  errorCount: number
  averageResponseTime: number
  lastRequestTime: Date
}

export class ApiOptimizer {
  private config: Required<ApiOptimizerConfig>
  private metrics: ApiMetrics

  constructor(config: ApiOptimizerConfig = {}) {
    this.config = {
      enableCompression: config.enableCompression !== false,
      enableValidation: config.enableValidation !== false,
      enableCaching: config.enableCaching !== false,
      enableRateLimit: config.enableRateLimit !== false,
      enableLogging: config.enableLogging !== false,
      enableCors: config.enableCors !== false,
      corsOptions: config.corsOptions || {},
      compressionThreshold: config.compressionThreshold || 1024, // 1KB
      validationSchema: config.validationSchema,
      rateLimitConfig: config.rateLimitConfig,
      cacheConfig: config.cacheConfig,
      timeout: config.timeout || 30000, // 30 seconds
      maxBodySize: config.maxBodySize || 10485760, // 10MB
    }

    this.metrics = {
      requestCount: 0,
      responseTime: [],
      errorCount: 0,
      averageResponseTime: 0,
      lastRequestTime: new Date(),
    }
  }

  async optimizeRequest(
    request: NextRequest,
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
    context?: any
  ): Promise<NextResponse> {
    const startTime = Date.now()
    
    try {
      // Log request start
      if (this.config.enableLogging) {
        this.logRequest(request)
      }

      // Check request size
      await this.validateRequestSize(request)

      // Apply CORS headers
      if (this.config.enableCors) {
        const corsResponse = this.handleCors(request)
        if (corsResponse) {
          return corsResponse
        }
      }

      // Validate request body if schema is provided
      if (this.config.enableValidation && this.config.validationSchema) {
        const validationResult = await this.validateRequestBody(request, this.config.validationSchema)
        if (!validationResult.success) {
          return validationResult.response!
        }
      }

      // Execute handler with timeout
      const response = await this.executeWithTimeout(
        () => handler(request, context),
        this.config.timeout
      )

      // Apply compression
      if (this.config.enableCompression) {
        this.applyCompression(response)
      }

      // Apply CORS headers to response
      if (this.config.enableCors) {
        this.applyCorsHeaders(response)
      }

      // Add performance headers
      this.addPerformanceHeaders(response, startTime)

      // Update metrics
      this.updateMetrics(Date.now() - startTime, response.status)

      // Log request completion
      if (this.config.enableLogging) {
        this.logResponse(request, response, Date.now() - startTime)
      }

      return response

    } catch (error) {
      // Handle errors
      const errorResponse = this.handleError(error)
      
      // Update error metrics
      this.updateMetrics(Date.now() - startTime, errorResponse.status, true)

      // Log error
      if (this.config.enableLogging) {
        this.logError(request, error, Date.now() - startTime)
      }

      return errorResponse
    }
  }

  private async validateRequestSize(request: NextRequest): Promise<void> {
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      if (size > this.config.maxBodySize) {
        throw new Error('Request body too large')
      }
    }
  }

  private async validateRequestBody(
    request: NextRequest,
    schema: ZodSchema
  ): Promise<{ success: boolean; response?: NextResponse }> {
    try {
      const body = await request.json()
      const result = schema.safeParse(body)
      
      if (!result.success) {
        return {
          success: false,
          response: new NextResponse(
            JSON.stringify({
              error: {
                message: 'Validation failed',
                details: result.error.errors,
              },
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          ),
        }
      }
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        response: new NextResponse(
          JSON.stringify({
            error: {
              message: 'Invalid JSON in request body',
            },
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        ),
      }
    }
  }

  private handleCors(request: NextRequest): NextResponse | null {
    const origin = request.headers.get('origin')
    const method = request.method

    // Handle preflight requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      this.applyCorsHeaders(response)
      return response
    }

    return null
  }

  private applyCorsHeaders(response: NextResponse): void {
    const options = this.config.corsOptions
    
    if (options.origin) {
      if (Array.isArray(options.origin)) {
        const origin = response.headers.get('origin')
        if (origin && options.origin.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin)
        }
      } else {
        response.headers.set('Access-Control-Allow-Origin', options.origin)
      }
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*')
    }

    if (options.methods) {
      response.headers.set('Access-Control-Allow-Methods', options.methods.join(', '))
    } else {
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    }

    if (options.allowedHeaders) {
      response.headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '))
    } else {
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }

    if (options.exposedHeaders) {
      response.headers.set('Access-Control-Expose-Headers', options.exposedHeaders.join(', '))
    }

    if (options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    if (options.maxAge) {
      response.headers.set('Access-Control-Max-Age', options.maxAge.toString())
    }
  }

  private applyCompression(response: NextResponse): void {
    // This would typically be handled by the server (nginx, express compression middleware, etc.)
    // For Next.js, we can set the header to indicate compression is accepted
    response.headers.set('Accept-Encoding', 'gzip, deflate, br')
  }

  private addPerformanceHeaders(response: NextResponse, startTime: number): void {
    const responseTime = Date.now() - startTime
    response.headers.set('X-Response-Time', responseTime.toString())
    response.headers.set('X-Request-ID', this.generateRequestId())
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'))
      }, timeoutMs)

      fn()
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  private handleError(error: any): NextResponse {
    console.error('API Error:', error)

    if (error instanceof Error) {
      if (error.message === 'Request body too large') {
        return new NextResponse(
          JSON.stringify({
            error: {
              message: 'Request body too large',
              code: 'PAYLOAD_TOO_LARGE',
            },
          }),
          {
            status: 413,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      if (error.message === 'Request timeout') {
        return new NextResponse(
          JSON.stringify({
            error: {
              message: 'Request timeout',
              code: 'REQUEST_TIMEOUT',
            },
          }),
          {
            status: 504,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Generic error response
    return new NextResponse(
      JSON.stringify({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  private updateMetrics(responseTime: number, statusCode: number, isError = false): void {
    this.metrics.requestCount++
    this.metrics.responseTime.push(responseTime)
    this.metrics.lastRequestTime = new Date()

    if (isError || statusCode >= 400) {
      this.metrics.errorCount++
    }

    // Calculate average response time (keep last 100 requests)
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime = this.metrics.responseTime.slice(-100)
    }

    this.metrics.averageResponseTime = 
      this.metrics.responseTime.reduce((sum, time) => sum + time, 0) / this.metrics.responseTime.length
  }

  private logRequest(request: NextRequest): void {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`)
  }

  private logResponse(request: NextRequest, response: NextResponse, responseTime: number): void {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} - ${response.status} (${responseTime}ms)`)
  }

  private logError(request: NextRequest, error: any, responseTime: number): void {
    console.error(`[${new Date().toISOString()}] ${request.method} ${request.url} - Error: ${error.message} (${responseTime}ms)`)
  }

  getMetrics(): ApiMetrics {
    return { ...this.metrics }
  }

  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      responseTime: [],
      errorCount: 0,
      averageResponseTime: 0,
      lastRequestTime: new Date(),
    }
  }
}

// Factory function to create API optimizer
export function createApiOptimizer(config?: ApiOptimizerConfig): ApiOptimizer {
  return new ApiOptimizer(config)
}

// Higher-order function to wrap API route handlers with optimization
export function withApiOptimization(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  config?: ApiOptimizerConfig
) {
  const optimizer = createApiOptimizer(config)

  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    return optimizer.optimizeRequest(req, handler, context)
  }
}

// Pre-configured optimizers for common scenarios
export const apiOptimizers = {
  // General API optimizer
  general: createApiOptimizer({
    enableCompression: true,
    enableValidation: true,
    enableCors: true,
    corsOptions: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
  }),

  // Public API optimizer (more permissive CORS, caching)
  public: createApiOptimizer({
    enableCompression: true,
    enableCaching: true,
    enableCors: true,
    corsOptions: {
      origin: '*',
      methods: ['GET', 'OPTIONS'],
    },
    cacheConfig: {
      ttl: 300000, // 5 minutes
    },
  }),

  // Auth API optimizer (strict validation, rate limiting)
  auth: createApiOptimizer({
    enableValidation: true,
    enableRateLimit: true,
    enableCors: true,
    corsOptions: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    rateLimitConfig: {
      windowMs: 900000, // 15 minutes
      maxRequests: 5,
    },
  }),

  // File upload optimizer (large body size, longer timeout)
  upload: createApiOptimizer({
    enableCompression: false, // Don't compress uploads
    maxBodySize: 104857600, // 100MB
    timeout: 300000, // 5 minutes
    enableCors: true,
    corsOptions: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  }),
}

// Common validation schemas
export const validationSchemas = {
  // User registration schema
  userRegistration: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.enum(['STUDENT', 'PARENT', 'TUTOR']),
  }),

  // User login schema
  userLogin: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),

  // Session booking schema
  sessionBooking: z.object({
    tutorId: z.string(),
    scheduledAt: z.string().datetime(),
    duration: z.number().min(15).max(240),
    type: z.enum(['ONLINE', 'IN_PERSON']),
    subject: z.string().min(1),
  }),

  // Payment schema
  payment: z.object({
    amount: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']),
    paymentMethod: z.string().min(1),
  }),
}