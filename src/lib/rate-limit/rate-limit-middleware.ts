import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter, RateLimitConfig, keyGenerators } from './rate-limiter'

export interface RateLimitMiddlewareConfig extends RateLimitConfig {
  enabled?: boolean
  paths?: string[]
  methods?: string[]
  trustProxy?: boolean
  skipForRoutes?: Array<{
    path: string
    method?: string
  }>
}

export class RateLimitMiddleware {
  private config: Required<RateLimitMiddlewareConfig>
  private limiter: RateLimiter

  constructor(config: RateLimitMiddlewareConfig = {}) {
    this.config = {
      enabled: config.enabled !== false,
      windowMs: config.windowMs || 60000,
      maxRequests: config.maxRequests || 100,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      skip: config.skip || (() => false),
      handler: config.handler || this.defaultHandler,
      onLimitReached: config.onLimitReached,
      standardHeaders: config.standardHeaders !== false,
      legacyHeaders: config.legacyHeaders !== false,
      store: config.store,
      paths: config.paths || [],
      methods: config.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      trustProxy: config.trustProxy !== false,
      skipForRoutes: config.skipForRoutes || [],
    }

    this.limiter = new RateLimiter(this.config)
  }

  async middleware(request: NextRequest): Promise<NextResponse | null> {
    // Check if rate limiting is enabled
    if (!this.config.enabled) {
      return null
    }

    // Check if the path should be rate limited
    if (this.config.paths.length > 0) {
      const pathname = request.nextUrl.pathname
      const shouldLimit = this.config.paths.some(path => {
        if (path.endsWith('*')) {
          return pathname.startsWith(path.slice(0, -1))
        }
        return pathname === path
      })

      if (!shouldLimit) {
        return null
      }
    }

    // Check if the method should be rate limited
    if (!this.config.methods.includes(request.method)) {
      return null
    }

    // Check if this route should be skipped
    const shouldSkip = this.config.skipForRoutes.some(route => {
      const pathMatch = route.path === request.nextUrl.pathname || 
                       (route.path.endsWith('*') && request.nextUrl.pathname.startsWith(route.path.slice(0, -1)))
      const methodMatch = !route.method || route.method === request.method
      return pathMatch && methodMatch
    })

    if (shouldSkip) {
      return null
    }

    // Convert NextRequest to a format compatible with the rate limiter
    const req = this.convertNextRequest(request)

    // Check rate limit
    const result = await this.limiter.checkLimit(req)

    if (result.shouldSkip) {
      return null
    }

    if (!result.success) {
      // Rate limit exceeded
      return this.createRateLimitResponse(result.limitInfo)
    }

    // Add rate limit headers to the response
    const response = NextResponse.next()
    this.addRateLimitHeaders(response, result.limitInfo)

    return null // Allow request to proceed
  }

  private convertNextRequest(request: NextRequest): any {
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    return {
      headers,
      method: request.method,
      url: request.url,
      nextUrl: request.nextUrl,
      // Add other properties as needed
    }
  }

  private defaultKeyGenerator(req: any): string {
    // Get client IP
    let ip: string
    
    if (this.config.trustProxy) {
      ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['cf-connecting-ip'] // Cloudflare
    } else {
      ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.headers['cf-connecting-ip'] ||
           'unknown'
    }

    // Create key based on IP and endpoint
    const pathname = req.nextUrl?.pathname || req.url || 'unknown'
    return `${ip}:${pathname}`
  }

  private defaultHandler(req: any, res: any, options: any): void {
    const status = 429 // Too Many Requests
    const message = 'Too many requests, please try again later.'
    const retryAfter = Math.ceil(options.limitInfo.windowMs / 1000)

    return new NextResponse(
      JSON.stringify({
        error: {
          message,
          status,
          retryAfter,
        },
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    )
  }

  private createRateLimitResponse(limitInfo: any): NextResponse {
    const status = 429
    const message = 'Too many requests, please try again later.'
    const retryAfter = Math.ceil(limitInfo.windowMs / 1000)

    const response = new NextResponse(
      JSON.stringify({
        error: {
          message,
          status,
          retryAfter,
        },
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    )

    // Add rate limit headers
    this.addRateLimitHeaders(response, limitInfo)

    return response
  }

  private addRateLimitHeaders(response: NextResponse, limitInfo: any): void {
    if (this.config.standardHeaders) {
      response.headers.set('RateLimit-Limit', limitInfo.maxRequests.toString())
      response.headers.set('RateLimit-Remaining', limitInfo.remainingHits.toString())
      response.headers.set('RateLimit-Reset', Math.ceil(limitInfo.resetTime.getTime() / 1000).toString())
    }

    if (this.config.legacyHeaders) {
      response.headers.set('X-RateLimit-Limit', limitInfo.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', limitInfo.remainingHits.toString())
      response.headers.set('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime.getTime() / 1000).toString())
    }
  }
}

// Factory functions for common rate limiting scenarios
export const createRateLimitMiddleware = (config?: RateLimitMiddlewareConfig) => 
  new RateLimitMiddleware(config)

// Pre-configured middleware instances
export const rateLimitMiddleware = {
  // General API rate limiting
  api: createRateLimitMiddleware({
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    paths: ['/api/*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  }),

  // Strict rate limiting for sensitive endpoints
  strict: createRateLimitMiddleware({
    windowMs: 60000, // 1 minute
    maxRequests: 10,
    paths: ['/api/auth/*', '/api/payments/*', '/api/admin/*'],
    methods: ['POST', 'PUT', 'DELETE'],
  }),

  // Authentication rate limiting
  auth: createRateLimitMiddleware({
    windowMs: 900000, // 15 minutes
    maxRequests: 5,
    paths: ['/api/auth/signin', '/api/auth/register', '/api/auth/forgot-password'],
    methods: ['POST'],
    skipSuccessfulRequests: true,
  }),

  // File upload rate limiting
  upload: createRateLimitMiddleware({
    windowMs: 3600000, // 1 hour
    maxRequests: 50,
    paths: ['/api/upload/*'],
    methods: ['POST'],
  }),

  // Search rate limiting
  search: createRateLimitMiddleware({
    windowMs: 60000, // 1 minute
    maxRequests: 30,
    paths: ['/api/search/*'],
    methods: ['GET'],
  }),

  // Public API rate limiting (for external API consumers)
  public: createRateLimitMiddleware({
    windowMs: 60000, // 1 minute
    maxRequests: 60,
    paths: ['/api/public/*'],
    methods: ['GET'],
  }),
}

// Higher-order function to wrap API route handlers with rate limiting
export function withRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  config?: RateLimitMiddlewareConfig
) {
  const middleware = createRateLimitMiddleware(config)

  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = await middleware.middleware(req)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Execute handler
    return handler(req, context)
  }
}

// Utility function to apply rate limiting to multiple routes
export function applyRateLimiting(
  routes: Array<{
    path: string
    config: RateLimitMiddlewareConfig
  }>
): Array<{ path: string; middleware: RateLimitMiddleware }> {
  return routes.map(route => ({
    path: route.path,
    middleware: createRateLimitMiddleware(route.config),
  }))
}