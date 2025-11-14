import { createClient } from 'redis'

export interface RedisCacheConfig {
  url: string
  password?: string
  keyPrefix: string
  defaultTtl: number
  connectTimeout: number
  commandTimeout: number
  retryAttempts: number
  retryDelay: number
}

export interface RedisCacheStats {
  connected: boolean
  memoryUsage: number
  keyCount: number
  hitRate: number
  operationsPerSecond: number
  lastError?: string
}

export class RedisCache {
  private client: any
  private config: RedisCacheConfig
  private stats: RedisCacheStats
  private connectionPromise: Promise<void> | null = null

  constructor(config: RedisCacheConfig) {
    this.config = config
    this.stats = {
      connected: false,
      memoryUsage: 0,
      keyCount: 0,
      hitRate: 0,
      operationsPerSecond: 0,
    }

    this.initialize()
  }

  private async initialize(): Promise<void> {
    try {
      this.client = createClient({
        url: this.config.url,
        password: this.config.password,
        socket: {
          connectTimeout: this.config.connectTimeout,
          commandTimeout: this.config.commandTimeout,
        },
        retry_strategy: (times: number) => {
          if (times > this.config.retryAttempts) {
            return null
          }
          return this.config.retryDelay
        },
      })

      this.client.on('connect', () => {
        this.stats.connected = true
        console.log('Redis cache connected')
      })

      this.client.on('error', (error: Error) => {
        this.stats.connected = false
        this.stats.lastError = error.message
        console.error('Redis cache error:', error)
      })

      this.client.on('reconnecting', () => {
        console.log('Redis cache reconnecting...')
      })

      await this.client.connect()
      await this.updateStats()
    } catch (error) {
      this.stats.connected = false
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to initialize Redis cache:', error)
    }
  }

  async ensureConnected(): Promise<void> {
    if (!this.connectionPromise) {
      this.connectionPromise = this.initialize()
    }
    await this.connectionPromise
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return null
    }

    try {
      const fullKey = this.config.keyPrefix + key
      const value = await this.client.get(fullKey)
      
      if (value === null) {
        return null
      }

      return JSON.parse(value) as T
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return
    }

    try {
      const fullKey = this.config.keyPrefix + key
      const serializedValue = JSON.stringify(value)
      const expiration = ttl || this.config.defaultTtl
      
      await this.client.setEx(fullKey, Math.floor(expiration / 1000), serializedValue)
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  async delete(key: string): Promise<boolean> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return false
    }

    try {
      const fullKey = this.config.keyPrefix + key
      const result = await this.client.del(fullKey)
      return result > 0
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  async clear(): Promise<void> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return
    }

    try {
      const keys = await this.client.keys(this.config.keyPrefix + '*')
      if (keys.length > 0) {
        await this.client.del(keys)
      }
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return false
    }

    try {
      const fullKey = this.config.keyPrefix + key
      const exists = await this.client.exists(fullKey)
      return exists > 0
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  async keys(pattern: string = '*'): Promise<string[]> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return []
    }

    try {
      const fullPattern = this.config.keyPrefix + pattern
      const keys = await this.client.keys(fullPattern)
      return keys.map(key => key.replace(this.config.keyPrefix, ''))
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
      return []
    }
  }

  async ttl(key: string): Promise<number> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return -1
    }

    try {
      const fullKey = this.config.keyPrefix + key
      return await this.client.ttl(fullKey)
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
      return -1
    }
  }

  async increment(key: string, delta: number = 1): Promise<number> {
    await this.ensureConnected()
    
    if (!this.stats.connected) {
      return 0
    }

    try {
      const fullKey = this.config.keyPrefix + key
      return await this.client.incrBy(fullKey, delta)
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
      return 0
    }
  }

  async getStats(): Promise<RedisCacheStats> {
    await this.updateStats()
    return { ...this.stats }
  }

  private async updateStats(): Promise<void> {
    if (!this.stats.connected) {
      return
    }

    try {
      // Get memory usage
      const info = await this.client.info('memory')
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/)
      if (memoryMatch) {
        this.stats.memoryUsage = this.parseMemorySize(memoryMatch[1])
      }

      // Get key count
      const keyCount = await this.client.keys(this.config.keyPrefix + '*')
      this.stats.keyCount = keyCount.length

      // Get hit rate (approximate)
      const statsInfo = await this.client.info('stats')
      const keyspaceHits = parseInt(statsInfo.match(/keyspace_hits:(\d+)/)?.[1] || '0')
      const keyspaceMisses = parseInt(statsInfo.match(/keyspace_misses:(\d+)/)?.[1] || '0')
      const total = keyspaceHits + keyspaceMisses
      this.stats.hitRate = total > 0 ? (keyspaceHits / total) * 100 : 0

      // Get operations per second
      const instantaneousOps = parseInt(statsInfo.match(/instantaneous_ops_per_sec:(\d+)/)?.[1] || '0')
      this.stats.operationsPerSecond = instantaneousOps
    } catch (error) {
      this.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  private parseMemorySize(sizeStr: string): number {
    const units = { B: 1, K: 1024, M: 1024 * 1024, G: 1024 * 1024 * 1024 }
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([BKMG])$/)
    
    if (match) {
      const value = parseFloat(match[1])
      const unit = match[2] as keyof typeof units
      return value * units[unit]
    }
    
    return 0
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.stats.connected = false
    }
  }
}

// Factory function to create Redis cache
export function createRedisCache(config: Partial<RedisCacheConfig> = {}): RedisCache {
  const defaultConfig: RedisCacheConfig = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    keyPrefix: 'tutoring_app:',
    defaultTtl: 3600000, // 1 hour
    connectTimeout: 10000,
    commandTimeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  }

  return new RedisCache({ ...defaultConfig, ...config })
}