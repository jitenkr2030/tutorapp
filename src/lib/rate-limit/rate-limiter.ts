export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: any) => string // Custom key generator
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  skip?: (req: any) => boolean // Skip rate limiting for certain requests
  handler?: (req: any, res: any, options: any) => void // Custom handler when limit is exceeded
  onLimitReached?: (req: any, res: any, options: any) => void // Callback when limit is reached
  standardHeaders?: boolean // Return rate limit info in headers
  legacyHeaders?: boolean // Return rate limit info in legacy headers
  store?: RateLimitStore // Custom store implementation
}

export interface RateLimitInfo {
  totalHits: number
  remainingHits: number
  resetTime: Date
  windowMs: number
  maxRequests: number
}

export interface RateLimitStore {
  increment(key: string): Promise<RateLimitInfo>
  reset(key: string): Promise<void>
  decrement(key: string): Promise<void>
}

export interface RateLimitResult {
  success: boolean
  limitInfo: RateLimitInfo
  shouldSkip: boolean
}

// Memory-based store for rate limiting
export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { hits: number; resetTime: number; windowMs: number }>()
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor() {
    this.startCleanupTimer()
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const now = Date.now()
    let record = this.store.get(key)

    if (!record || now > record.resetTime) {
      // Create new record
      record = {
        hits: 1,
        resetTime: now + 60000, // Default 1 minute window
        windowMs: 60000,
      }
      this.store.set(key, record)
    } else {
      // Increment existing record
      record.hits++
    }

    return {
      totalHits: record.hits,
      remainingHits: Math.max(0, Math.ceil(record.windowMs / 1000) - record.hits),
      resetTime: new Date(record.resetTime),
      windowMs: record.windowMs,
      maxRequests: Math.ceil(record.windowMs / 1000), // Default: 1 request per second
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }

  async decrement(key: string): Promise<void> {
    const record = this.store.get(key)
    if (record && record.hits > 0) {
      record.hits--
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetTime) {
          this.store.delete(key)
        }
      }
    }, 60000) // Clean up every minute
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.store.clear()
  }
}

// Redis-based store for rate limiting (distributed)
export class RedisRateLimitStore implements RateLimitStore {
  private redis: any // Redis client
  private prefix: string

  constructor(redis: any, prefix: string = 'rate_limit:') {
    this.redis = redis
    this.prefix = prefix
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const fullKey = this.prefix + key
    const now = Date.now()
    const windowMs = 60000 // Default 1 minute
    const resetTime = now + windowMs
    const maxRequests = Math.ceil(windowMs / 1000) // Default: 1 request per second

    try {
      // Use Redis INCR with expiration
      const multi = this.redis.multi()
      multi.incr(fullKey)
      multi.pexpire(fullKey, windowMs)
      multi.pttl(fullKey)

      const results = await multi.exec()
      const hits = results[0][1]
      const ttl = results[2][1]

      return {
        totalHits: hits,
        remainingHits: Math.max(0, maxRequests - hits),
        resetTime: new Date(now + ttl),
        windowMs,
        maxRequests,
      }
    } catch (error) {
      console.error('Redis rate limit error:', error)
      // Fallback to memory store
      const memoryStore = new MemoryRateLimitStore()
      return memoryStore.increment(key)
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.redis.del(this.prefix + key)
    } catch (error) {
      console.error('Redis reset error:', error)
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await this.redis.decr(this.prefix + key)
    } catch (error) {
      console.error('Redis decrement error:', error)
    }
  }
}

export class RateLimiter {
  private config: Required<RateLimitConfig>
  private store: RateLimitStore

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      skip: config.skip || (() => false),
      handler: config.handler || this.defaultHandler,
      onLimitReached: config.onLimitReached,
      standardHeaders: config.standardHeaders !== false,
      legacyHeaders: config.legacyHeaders !== false,
      store: config.store || new MemoryRateLimitStore(),
    }

    this.store = this.config.store
  }

  async checkLimit(req: any, res?: any): Promise<RateLimitResult> {
    // Check if we should skip rate limiting
    if (this.config.skip(req)) {
      return {
        success: true,
        limitInfo: this.getEmptyLimitInfo(),
        shouldSkip: true,
      }
    }

    // Generate key for this request
    const key = this.config.keyGenerator(req)

    // Get current rate limit info
    const limitInfo = await this.store.increment(key)

    // Check if limit is exceeded
    const success = limitInfo.totalHits <= this.config.maxRequests

    // Call limit reached callback if needed
    if (!success && this.config.onLimitReached) {
      this.config.onLimitReached(req, res, { ...this.config, limitInfo })
    }

    return {
      success,
      limitInfo,
      shouldSkip: false,
    }
  }

  async middleware(req: any, res: any, next: () => void): Promise<void> {
    const result = await this.checkLimit(req, res)

    if (result.shouldSkip) {
      return next()
    }

    if (!result.success) {
      // Rate limit exceeded
      this.config.handler(req, res, { ...this.config, limitInfo: result.limitInfo })
      return
    }

    // Add rate limit headers
    this.addRateLimitHeaders(res, result.limitInfo)

    // Skip successful/failed requests if configured
    if (this.config.skipSuccessfulRequests || this.config.skipFailedRequests) {
      const originalEnd = res.end
      res.end = function(chunk?: any, encoding?: any) {
        const statusCode = res.statusCode
        const isSuccess = statusCode >= 200 && statusCode < 300

        if ((this.config.skipSuccessfulRequests && isSuccess) ||
            (this.config.skipFailedRequests && !isSuccess)) {
          // Decrement counter since we're not counting this request
          this.store.decrement(result.limitInfo.key)
        }

        originalEnd.call(res, chunk, encoding)
      }.bind(this)
    }

    next()
  }

  private defaultKeyGenerator(req: any): string {
    // Use IP address as default key
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress
    return ip || 'unknown'
  }

  private defaultHandler(req: any, res: any, options: any): void {
    const status = 429 // Too Many Requests
    const message = 'Too many requests, please try again later.'

    res.status(status).json({
      error: {
        message,
        status,
        retryAfter: Math.ceil(options.limitInfo.windowMs / 1000),
      },
    })
  }

  private addRateLimitHeaders(res: any, limitInfo: RateLimitInfo): void {
    if (this.config.standardHeaders) {
      res.setHeader('RateLimit-Limit', limitInfo.maxRequests.toString())
      res.setHeader('RateLimit-Remaining', limitInfo.remainingHits.toString())
      res.setHeader('RateLimit-Reset', Math.ceil(limitInfo.resetTime.getTime() / 1000).toString())
    }

    if (this.config.legacyHeaders) {
      res.setHeader('X-RateLimit-Limit', limitInfo.maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', limitInfo.remainingHits.toString())
      res.setHeader('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime.getTime() / 1000).toString())
    }
  }

  private getEmptyLimitInfo(): RateLimitInfo {
    return {
      totalHits: 0,
      remainingHits: 0,
      resetTime: new Date(),
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests,
    }
  }
}

// Factory functions for common rate limiting scenarios
export const rateLimiters = {
  // General API rate limiter
  createApiLimiter: (options?: Partial<RateLimitConfig>) => new RateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: true,
    ...options,
  }),

  // Strict rate limiter for sensitive endpoints
  createStrictLimiter: (options?: Partial<RateLimitConfig>) => new RateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    standardHeaders: true,
    legacyHeaders: true,
    ...options,
  }),

  // Auth rate limiter (prevent brute force attacks)
  createAuthLimiter: (options?: Partial<RateLimitConfig>) => new RateLimiter({
    windowMs: 900000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful auth attempts
    standardHeaders: true,
    legacyHeaders: true,
    ...options,
  }),

  // File upload rate limiter
  createUploadLimiter: (options?: Partial<RateLimitConfig>) => new RateLimiter({
    windowMs: 3600000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
    standardHeaders: true,
    legacyHeaders: true,
    ...options,
  }),

  // Search rate limiter
  createSearchLimiter: (options?: Partial<RateLimitConfig>) => new RateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    standardHeaders: true,
    legacyHeaders: true,
    ...options,
  }),
}

// Key generators for different scenarios
export const keyGenerators = {
  // IP-based key generator
  byIP: (req: any) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress
    return ip || 'unknown'
  },

  // User-based key generator (requires authentication)
  byUser: (req: any) => {
    const userId = req.user?.id || req.headers['user-id']
    return userId ? `user:${userId}` : keyGenerators.byIP(req)
  },

  // Endpoint-based key generator
  byEndpoint: (req: any) => {
    const ip = keyGenerators.byIP(req)
    const endpoint = req.url || req.path || 'unknown'
    return `${ip}:${endpoint}`
  },

  // Combined key generator (IP + User + Endpoint)
  combined: (req: any) => {
    const ip = keyGenerators.byIP(req)
    const userId = req.user?.id || 'anonymous'
    const endpoint = req.url || req.path || 'unknown'
    return `${ip}:${userId}:${endpoint}`
  },
}