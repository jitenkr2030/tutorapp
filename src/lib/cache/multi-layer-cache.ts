import { CacheManager, CacheConfig } from './cache-manager'
import { RedisCache, RedisCacheConfig } from './redis-cache'

export interface MultiLayerCacheConfig {
  memory: Partial<CacheConfig>
  redis: Partial<RedisCacheConfig>
  enableRedis: boolean
  writeThrough: boolean
  writeBackDelay: number
  fallbackToMemory: boolean
}

export interface MultiLayerCacheStats {
  memory: any
  redis: any
  totalHits: number
  totalMisses: number
  totalRequests: number
  overallHitRate: number
  cacheLayerHits: {
    memory: number
    redis: number
    database: number
  }
}

export class MultiLayerCache {
  private memoryCache: CacheManager
  private redisCache: RedisCache | null
  private config: MultiLayerCacheConfig
  private stats: MultiLayerCacheStats
  private writeBackQueue: Map<string, { value: any; ttl: number; timestamp: number }> = new Map()
  private writeBackTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<MultiLayerCacheConfig> = {}) {
    this.config = {
      memory: config.memory || {},
      redis: config.redis || {},
      enableRedis: config.enableRedis !== false,
      writeThrough: config.writeThrough !== false,
      writeBackDelay: config.writeBackDelay || 5000,
      fallbackToMemory: config.fallbackToMemory !== false,
    }

    this.memoryCache = new CacheManager(this.config.memory)
    this.redisCache = this.config.enableRedis ? this.createRedisCache() : null

    this.stats = {
      memory: this.memoryCache.getStats(),
      redis: this.config.enableRedis ? { connected: false } : null,
      totalHits: 0,
      totalMisses: 0,
      totalRequests: 0,
      overallHitRate: 0,
      cacheLayerHits: {
        memory: 0,
        redis: 0,
        database: 0,
      },
    }

    this.startWriteBackTimer()
  }

  private createRedisCache(): RedisCache {
    // This would be implemented with the RedisCache class
    // For now, we'll return a mock implementation
    return null as any
  }

  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++

    // Try memory cache first (L1)
    const memoryResult = await this.memoryCache.get<T>(key)
    if (memoryResult !== null) {
      this.stats.totalHits++
      this.stats.cacheLayerHits.memory++
      this.updateOverallHitRate()
      return memoryResult
    }

    // Try Redis cache (L2) if enabled
    if (this.redisCache && this.config.enableRedis) {
      try {
        const redisResult = await this.redisCache.get<T>(key)
        if (redisResult !== null) {
          // Write back to memory cache
          await this.memoryCache.set(key, redisResult)
          
          this.stats.totalHits++
          this.stats.cacheLayerHits.redis++
          this.updateOverallHitRate()
          return redisResult
        }
      } catch (error) {
        console.error('Redis cache get error:', error)
        if (this.config.fallbackToMemory) {
          // Continue to database fetch
        } else {
          throw error
        }
      }
    }

    // Cache miss - would typically fetch from database
    this.stats.totalMisses++
    this.stats.cacheLayerHits.database++
    this.updateOverallHitRate()
    return null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Always set in memory cache (L1)
    await this.memoryCache.set(key, value, ttl)

    if (this.config.writeThrough && this.redisCache && this.config.enableRedis) {
      try {
        // Write through to Redis (L2)
        await this.redisCache.set(key, value, ttl)
      } catch (error) {
        console.error('Redis cache set error:', error)
        
        // Fallback to write-back if Redis is unavailable
        if (this.config.fallbackToMemory) {
          this.queueWriteBack(key, value, ttl)
        }
      }
    } else if (!this.config.writeThrough && this.redisCache && this.config.enableRedis) {
      // Write-back mode
      this.queueWriteBack(key, value, ttl)
    }
  }

  async delete(key: string): Promise<boolean> {
    // Delete from memory cache
    const memoryDeleted = await this.memoryCache.delete(key)

    // Delete from Redis cache if enabled
    let redisDeleted = false
    if (this.redisCache && this.config.enableRedis) {
      try {
        redisDeleted = await this.redisCache.delete(key)
      } catch (error) {
        console.error('Redis cache delete error:', error)
      }
    }

    // Remove from write-back queue
    this.writeBackQueue.delete(key)

    return memoryDeleted || redisDeleted
  }

  async clear(): Promise<void> {
    // Clear memory cache
    await this.memoryCache.clear()

    // Clear Redis cache if enabled
    if (this.redisCache && this.config.enableRedis) {
      try {
        await this.redisCache.clear()
      } catch (error) {
        console.error('Redis cache clear error:', error)
      }
    }

    // Clear write-back queue
    this.writeBackQueue.clear()
  }

  async has(key: string): Promise<boolean> {
    // Check memory cache first
    const memoryHas = await this.memoryCache.has(key)
    if (memoryHas) {
      return true
    }

    // Check Redis cache if enabled
    if (this.redisCache && this.config.enableRedis) {
      try {
        return await this.redisCache.has(key)
      } catch (error) {
        console.error('Redis cache has error:', error)
        return false
      }
    }

    return false
  }

  async keys(): Promise<string[]> {
    const memoryKeys = await this.memoryCache.keys()
    
    if (this.redisCache && this.config.enableRedis) {
      try {
        const redisKeys = await this.redisCache.keys()
        // Return unique keys from both layers
        return Array.from(new Set([...memoryKeys, ...redisKeys]))
      } catch (error) {
        console.error('Redis cache keys error:', error)
        return memoryKeys
      }
    }

    return memoryKeys
  }

  async getStats(): Promise<MultiLayerCacheStats> {
    // Update memory cache stats
    this.stats.memory = this.memoryCache.getStats()

    // Update Redis cache stats if enabled
    if (this.redisCache && this.config.enableRedis) {
      try {
        this.stats.redis = await this.redisCache.getStats()
      } catch (error) {
        console.error('Redis cache stats error:', error)
        this.stats.redis = { connected: false, lastError: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    return { ...this.stats }
  }

  private queueWriteBack(key: string, value: any, ttl?: number): void {
    this.writeBackQueue.set(key, {
      value,
      ttl: ttl || this.config.memory?.defaultTtl || 3600000,
      timestamp: Date.now(),
    })
  }

  private startWriteBackTimer(): void {
    this.writeBackTimer = setInterval(() => {
      this.processWriteBackQueue()
    }, this.config.writeBackDelay)
  }

  private async processWriteBackQueue(): Promise<void> {
    if (!this.redisCache || !this.config.enableRedis || this.writeBackQueue.size === 0) {
      return
    }

    const itemsToProcess = Array.from(this.writeBackQueue.entries())
    this.writeBackQueue.clear()

    for (const [key, item] of itemsToProcess) {
      try {
        await this.redisCache.set(key, item.value, item.ttl)
      } catch (error) {
        console.error('Write-back to Redis failed:', error)
        // Re-queue the item for next attempt
        this.writeBackQueue.set(key, item)
      }
    }
  }

  private updateOverallHitRate(): void {
    this.stats.overallHitRate = this.stats.totalRequests > 0 
      ? (this.stats.totalHits / this.stats.totalRequests) * 100 
      : 0
  }

  async close(): Promise<void> {
    // Process remaining write-back queue
    await this.processWriteBackQueue()

    // Stop write-back timer
    if (this.writeBackTimer) {
      clearInterval(this.writeBackTimer)
      this.writeBackTimer = null
    }

    // Close Redis connection
    if (this.redisCache) {
      try {
        await this.redisCache.close()
      } catch (error) {
        console.error('Error closing Redis cache:', error)
      }
    }

    // Destroy memory cache
    this.memoryCache.destroy()
  }
}

// Factory function to create multi-layer cache
export function createMultiLayerCache(config?: Partial<MultiLayerCacheConfig>): MultiLayerCache {
  return new MultiLayerCache(config)
}

// Global multi-layer cache instance
export const multiLayerCache = createMultiLayerCache()