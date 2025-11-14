import { NextRequest, NextResponse } from 'next/server'
import { multiLayerCache } from './multi-layer-cache'

export interface CacheMiddlewareConfig {
  ttl?: number
  keyPrefix?: string
  varyBy?: string[]
  skipCache?: (req: NextRequest) => boolean
  cacheKeyGenerator?: (req: NextRequest) => string
  cacheControl?: string
  etag?: boolean
  staleWhileRevalidate?: number
}

export class CacheMiddleware {
  private config: Required<CacheMiddlewareConfig>

  constructor(config: CacheMiddlewareConfig = {}) {
    this.config = {
      ttl: config.ttl || 300000, // 5 minutes
      keyPrefix: config.keyPrefix || 'api:',
      varyBy: config.varyBy || [],
      skipCache: config.skipCache || (() => false),
      cacheKeyGenerator: config.cacheKeyGenerator || this.defaultCacheKeyGenerator,
      cacheControl: config.cacheControl || 'public, max-age=300',
      etag: config.etag !== false,
      staleWhileRevalidate: config.staleWhileRevalidate || 0,
    }
  }

  async middleware(req: NextRequest): Promise<NextResponse | null> {
    // Skip cache if configured
    if (this.config.skipCache(req)) {
      return null
    }

    // Generate cache key
    const cacheKey = this.config.cacheKeyGenerator(req)

    // Try to get cached response
    const cachedResponse = await multiLayerCache.get<CachedResponse>(cacheKey)
    
    if (cachedResponse) {
      // Check if cached response is still valid
      if (this.isValidResponse(cachedResponse)) {
        // Return cached response with appropriate headers
        const response = new NextResponse(cachedResponse.body, {
          status: cachedResponse.status,
          headers: cachedResponse.headers,
        })

        // Add cache headers
        response.headers.set('X-Cache', 'HIT')
        response.headers.set('Cache-Control', this.config.cacheControl)
        
        if (this.config.etag) {
          response.headers.set('ETag', cachedResponse.etag)
        }

        return response
      } else {
        // Stale response - trigger background revalidation
        this.triggerBackgroundRevalidation(cacheKey, req)
      }
    }

    return null
  }

  async cacheResponse(req: NextRequest, response: NextResponse): Promise<void> {
    if (this.config.skipCache(req)) {
      return
    }

    // Don't cache non-successful responses
    if (response.status >= 400) {
      return
    }

    // Generate cache key
    const cacheKey = this.config.cacheKeyGenerator(req)

    // Create cached response object
    const cachedResponse: CachedResponse = {
      body: await response.text(),
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      etag: this.generateETag(response),
      cachedAt: Date.now(),
      ttl: this.config.ttl,
    }

    // Cache the response
    await multiLayerCache.set(cacheKey, cachedResponse, this.config.ttl)

    // Add cache header to response
    response.headers.set('X-Cache', 'MISS')
  }

  private defaultCacheKeyGenerator(req: NextRequest): string {
    const url = new URL(req.url)
    let key = `${this.config.keyPrefix}${url.pathname}`

    // Add query parameters
    if (url.search) {
      key += url.search
    }

    // Add vary headers
    for (const header of this.config.varyBy) {
      const value = req.headers.get(header)
      if (value) {
        key += `:${header}=${value}`
      }
    }

    // Add method for non-GET requests
    if (req.method !== 'GET') {
      key += `:${req.method}`
    }

    return key
  }

  private isValidResponse(cachedResponse: CachedResponse): boolean {
    const now = Date.now()
    const age = now - cachedResponse.cachedAt
    
    // Check if response is expired
    if (age > cachedResponse.ttl) {
      return false
    }

    // Check if stale-while-revalidate applies
    if (this.config.staleWhileRevalidate > 0) {
      return age <= (cachedResponse.ttl + this.config.staleWhileRevalidate)
    }

    return true
  }

  private generateETag(response: NextResponse): string {
    const body = response.body?.toString() || ''
    const hash = Buffer.from(body).toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32)
    
    return `"${hash}"`
  }

  private async triggerBackgroundRevalidation(cacheKey: string, req: NextRequest): Promise<void> {
    // This would trigger a background fetch to update the cache
    // In a real implementation, you might use a message queue or background job
    try {
      const fetchUrl = req.url
      await fetch(fetchUrl, {
        headers: req.headers,
        method: req.method,
        body: req.body,
      })
    } catch (error) {
      console.error('Background revalidation failed:', error)
    }
  }
}

interface CachedResponse {
  body: string
  status: number
  headers: Record<string, string>
  etag: string
  cachedAt: number
  ttl: number
}

// Factory function to create cache middleware
export function createCacheMiddleware(config?: CacheMiddlewareConfig): CacheMiddleware {
  return new CacheMiddleware(config)
}

// Higher-order function to wrap API route handlers with caching
export function withCache(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  config?: CacheMiddlewareConfig
) {
  const cacheMiddleware = createCacheMiddleware(config)

  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Try to get cached response
    const cachedResponse = await cacheMiddleware.middleware(req)
    if (cachedResponse) {
      return cachedResponse
    }

    // Execute handler
    const response = await handler(req, context)

    // Cache the response
    await cacheMiddleware.cacheResponse(req, response)

    return response
  }
}

// Cache utility functions for common API patterns
export const apiCacheUtils = {
  // Cache configuration for different API types
  configs: {
    // User data - cache for 5 minutes
    userData: {
      ttl: 300000,
      varyBy: ['authorization'],
      cacheControl: 'private, max-age=300',
    },
    
    // Public data - cache for 1 hour
    publicData: {
      ttl: 3600000,
      cacheControl: 'public, max-age=3600',
    },
    
    // Analytics data - cache for 15 minutes
    analytics: {
      ttl: 900000,
      varyBy: ['authorization'],
      cacheControl: 'private, max-age=900',
    },
    
    // Search results - cache for 10 minutes
    search: {
      ttl: 600000,
      cacheControl: 'public, max-age=600',
    },
  },

  // Create cache key for user-specific data
  userCacheKey: (endpoint: string, userId?: string) => {
    return userId ? `user:${userId}:${endpoint}` : `public:${endpoint}`
  },

  // Skip cache for specific conditions
  skipCacheFor: {
    // Skip cache for POST/PUT/DELETE requests
    nonGetRequests: (req: NextRequest) => !['GET', 'HEAD'].includes(req.method),
    
    // Skip cache for authenticated users with specific headers
    noCacheHeader: (req: NextRequest) => req.headers.get('cache-control') === 'no-cache',
    
    // Skip cache for specific endpoints
    sensitiveEndpoints: (req: NextRequest) => {
      const sensitivePaths = ['/api/auth', '/api/payments', '/api/admin']
      return sensitivePaths.some(path => req.nextUrl.pathname.startsWith(path))
    },
  },
}