export interface CacheConfig {
  defaultTtl: number // Time to live in milliseconds
  maxSize: number // Maximum number of items in memory cache
  checkPeriod: number // Cleanup interval in milliseconds
}

export interface CacheItem<T = any> {
  value: T
  expiresAt: number
  createdAt: number
  accessCount: number
  lastAccessed: number
}

export interface CacheStats {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  itemCount: number
  memoryUsage: number
  expiredItems: number
}

export class CacheManager {
  private cache = new Map<string, CacheItem>()
  private config: CacheConfig
  private stats: CacheStats
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTtl: config.defaultTtl || 3600000, // 1 hour
      maxSize: config.maxSize || 1000,
      checkPeriod: config.checkPeriod || 300000, // 5 minutes
    }

    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      itemCount: 0,
      memoryUsage: 0,
      expiredItems: 0,
    }

    this.startCleanupTimer()
  }

  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++
    
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.expiredItems++
      this.updateHitRate()
      this.updateStats()
      return null
    }

    // Update access statistics
    item.accessCount++
    item.lastAccessed = Date.now()
    
    this.stats.hits++
    this.updateHitRate()
    
    return item.value
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.config.defaultTtl)
    
    const item: CacheItem<T> = {
      value,
      expiresAt,
      createdAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evictItems()
    }

    this.cache.set(key, item)
    this.updateStats()
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)
    this.updateStats()
    return deleted
  }

  async clear(): Promise<void> {
    this.cache.clear()
    this.updateStats()
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.updateStats()
      return false
    }

    return true
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  async values<T>(): Promise<T[]> {
    return Array.from(this.cache.values()).map(item => item.value)
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private evictItems(): void {
    // Evict expired items first
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() > item.expiresAt) {
        this.cache.delete(key)
        this.stats.expiredItems++
      }
    }

    // If still over limit, use LRU (Least Recently Used) eviction
    if (this.cache.size >= this.config.maxSize) {
      const items = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      
      const toRemove = items.slice(0, Math.floor(this.config.maxSize * 0.2)) // Remove 20%
      
      for (const [key] of toRemove) {
        this.cache.delete(key)
      }
    }
  }

  private updateStats(): void {
    this.stats.itemCount = this.cache.size
    this.stats.memoryUsage = this.calculateMemoryUsage()
  }

  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0
  }

  private calculateMemoryUsage(): number {
    // Estimate memory usage (rough approximation)
    let totalSize = 0
    
    for (const [key, item] of this.cache.entries()) {
      totalSize += key.length * 2 // UTF-16 encoding
      totalSize += JSON.stringify(item.value).length * 2
      totalSize += 64 // Overhead for cache item metadata
    }
    
    return totalSize
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredItems()
    }, this.config.checkPeriod)
  }

  private cleanupExpiredItems(): void {
    let expiredCount = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() > item.expiresAt) {
        this.cache.delete(key)
        expiredCount++
      }
    }

    if (expiredCount > 0) {
      this.stats.expiredItems += expiredCount
      this.updateStats()
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    
    this.cache.clear()
    this.updateStats()
  }
}

// Global cache instance
export const cacheManager = new CacheManager()

// Cache decorator for functions
export function cache<T extends (...args: any[]) => Promise<any>>(
  keyPrefix: string,
  ttl?: number,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!

    descriptor.value = async function (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
      // Generate cache key
      let cacheKey = keyPrefix
      if (keyGenerator) {
        cacheKey += `:${keyGenerator(...args)}`
      } else {
        cacheKey += `:${JSON.stringify(args)}`
      }

      // Try to get from cache
      const cached = await cacheManager.get<Awaited<ReturnType<T>>>(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      await cacheManager.set(cacheKey, result, ttl)

      return result
    }

    return descriptor
  }
}

// Cache utility functions
export const cacheUtils = {
  // Generate cache keys for common patterns
  userKey: (userId: string) => `user:${userId}`,
  sessionKey: (sessionId: string) => `session:${sessionId}`,
  tutorKey: (tutorId: string) => `tutor:${tutorId}`,
  studentKey: (studentId: string) => `student:${studentId}`,
  
  // Generate cache keys for API responses
  apiKey: (endpoint: string, params?: Record<string, any>) => {
    const paramString = params ? `:${JSON.stringify(params)}` : ''
    return `api:${endpoint}${paramString}`
  },
  
  // Generate cache keys for database queries
  queryKey: (table: string, where?: Record<string, any>) => {
    const whereString = where ? `:${JSON.stringify(where)}` : ''
    return `query:${table}${whereString}`
  },
  
  // Generate cache keys for analytics
  analyticsKey: (type: string, period: string, userId?: string) => {
    const userPart = userId ? `:${userId}` : ''
    return `analytics:${type}:${period}${userPart}`
  },
}