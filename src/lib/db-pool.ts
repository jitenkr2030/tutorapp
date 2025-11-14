import { PrismaClient } from '@prisma/client'

export interface PoolConfig {
  minConnections: number
  maxConnections: number
  connectionTimeoutMs: number
  idleTimeoutMs: number
  maxLifetimeMs: number
}

export interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
  averageWaitTimeMs: number
}

export class DatabaseConnectionPool {
  private prisma: PrismaClient
  private config: PoolConfig
  private stats: PoolStats
  private connectionQueue: Array<{ resolve: (value: string) => void; reject: (reason?: any) => void; timestamp: number }> = []
  private activeConnections: Set<string> = new Set()
  private idleConnections: Set<string> = new Set()
  private connectionIdCounter = 0

  constructor(prisma: PrismaClient, config: Partial<PoolConfig> = {}) {
    this.prisma = prisma
    this.config = {
      minConnections: config.minConnections || 2,
      maxConnections: config.maxConnections || 10,
      connectionTimeoutMs: config.connectionTimeoutMs || 30000,
      idleTimeoutMs: config.idleTimeoutMs || 300000,
      maxLifetimeMs: config.maxLifetimeMs || 3600000,
    }
    
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      averageWaitTimeMs: 0,
    }

    this.initialize()
  }

  private async initialize(): Promise<void> {
    // Initialize minimum connections
    const initPromises = []
    for (let i = 0; i < this.config.minConnections; i++) {
      initPromises.push(this.createConnection())
    }
    
    await Promise.all(initPromises)
    
    // Start connection cleanup timer
    setInterval(() => this.cleanupIdleConnections(), 60000) // Every minute
    
    console.log(`Database connection pool initialized with ${this.config.minConnections} connections`)
  }

  async getConnection(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now()
      
      // Check for available idle connection
      if (this.idleConnections.size > 0) {
        const connectionId = this.idleConnections.values().next().value
        this.idleConnections.delete(connectionId)
        this.activeConnections.add(connectionId)
        this.updateStats()
        resolve(connectionId)
        return
      }
      
      // Check if we can create a new connection
      if (this.stats.totalConnections < this.config.maxConnections) {
        this.createConnection()
          .then(connectionId => {
            this.activeConnections.add(connectionId)
            this.updateStats()
            resolve(connectionId)
          })
          .catch(reject)
        return
      }
      
      // Add to queue
      this.connectionQueue.push({ resolve, reject, timestamp })
      this.stats.waitingRequests = this.connectionQueue.length
      this.updateStats()
      
      // Set timeout
      setTimeout(() => {
        const index = this.connectionQueue.findIndex(req => req.timestamp === timestamp)
        if (index !== -1) {
          this.connectionQueue.splice(index, 1)
          this.stats.waitingRequests = this.connectionQueue.length
          this.updateStats()
          reject(new Error('Connection timeout'))
        }
      }, this.config.connectionTimeoutMs)
    })
  }

  async releaseConnection(connectionId: string): Promise<void> {
    if (this.activeConnections.has(connectionId)) {
      this.activeConnections.delete(connectionId)
      this.idleConnections.add(connectionId)
      this.updateStats()
      
      // Process waiting requests
      if (this.connectionQueue.length > 0) {
        const request = this.connectionQueue.shift()
        this.stats.waitingRequests = this.connectionQueue.length
        
        if (request) {
          this.idleConnections.delete(connectionId)
          this.activeConnections.add(connectionId)
          
          const waitTime = Date.now() - request.timestamp
          this.updateAverageWaitTime(waitTime)
          
          request.resolve(connectionId)
        }
      }
    }
  }

  private async createConnection(): Promise<string> {
    const connectionId = `conn_${++this.connectionIdCounter}_${Date.now()}`
    
    try {
      // Test the connection
      await this.prisma.$queryRaw`SELECT 1`
      
      this.stats.totalConnections++
      this.idleConnections.add(connectionId)
      this.updateStats()
      
      return connectionId
    } catch (error) {
      console.error('Failed to create database connection:', error)
      throw error
    }
  }

  private cleanupIdleConnections(): void {
    const now = Date.now()
    const connectionsToRemove: string[] = []
    
    for (const connectionId of this.idleConnections) {
      // Remove connections that have been idle for too long
      // In a real implementation, we would track when each connection became idle
      connectionsToRemove.push(connectionId)
      
      if (connectionsToRemove.length >= 2 && this.stats.totalConnections > this.config.minConnections) {
        break
      }
    }
    
    for (const connectionId of connectionsToRemove) {
      this.idleConnections.delete(connectionId)
      this.stats.totalConnections--
      this.updateStats()
    }
  }

  private updateStats(): void {
    this.stats.activeConnections = this.activeConnections.size
    this.stats.idleConnections = this.idleConnections.size
  }

  private updateAverageWaitTime(waitTime: number): void {
    // Simple moving average
    this.stats.averageWaitTimeMs = 
      (this.stats.averageWaitTimeMs * 0.9) + (waitTime * 0.1)
  }

  getStats(): PoolStats {
    return { ...this.stats }
  }

  async close(): Promise<void> {
    // Clear connection queue
    for (const request of this.connectionQueue) {
      request.reject(new Error('Pool is closing'))
    }
    this.connectionQueue.length = 0
    
    // Close all connections
    this.activeConnections.clear()
    this.idleConnections.clear()
    this.stats.totalConnections = 0
    this.updateStats()
    
    // Disconnect from database
    await this.prisma.$disconnect()
    
    console.log('Database connection pool closed')
  }
}

// Connection pool wrapper for Prisma operations
export class PooledPrismaClient {
  private pool: DatabaseConnectionPool
  private prisma: PrismaClient

  constructor(prisma: PrismaClient, pool: DatabaseConnectionPool) {
    this.prisma = prisma
    this.pool = pool
  }

  async withConnection<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    const connectionId = await this.pool.getConnection()
    
    try {
      const result = await operation(this.prisma)
      return result
    } finally {
      await this.pool.releaseConnection(connectionId)
    }
  }

  getPoolStats(): PoolStats {
    return this.pool.getStats()
  }

  async close(): Promise<void> {
    await this.pool.close()
  }
}

// Factory function to create pooled Prisma client
export function createPooledPrismaClient(
  prisma: PrismaClient,
  config?: Partial<PoolConfig>
): PooledPrismaClient {
  const pool = new DatabaseConnectionPool(prisma, config)
  return new PooledPrismaClient(prisma, pool)
}