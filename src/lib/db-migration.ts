import { db } from './db'
import { promises as fs } from 'fs'
import path from 'path'

export interface Migration {
  id: string
  name: string
  up: string
  down: string
  createdAt: Date
  appliedAt?: Date
}

export interface MigrationConfig {
  migrationsDir: string
  tableName?: string
}

export class DatabaseMigration {
  private config: MigrationConfig
  private tableName: string

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      migrationsDir: config.migrationsDir || './migrations',
      tableName: config.tableName || '_migrations',
    }
    this.tableName = this.config.tableName!
  }

  async initialize(): Promise<void> {
    try {
      // Create migrations directory if it doesn't exist
      await fs.mkdir(this.config.migrationsDir, { recursive: true })

      // Create migrations table if it doesn't exist
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at DATETIME NOT NULL
        )
      `
    } catch (error) {
      console.error('Failed to initialize migration system:', error)
      throw new Error('Migration initialization failed')
    }
  }

  async createMigration(name: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const migrationId = `${timestamp}_${name}`
      const fileName = `${migrationId}.sql`
      const filePath = path.join(this.config.migrationsDir, fileName)

      const template = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

-- UP migration
-- Write your SQL here to apply the migration


-- DOWN migration
-- Write your SQL here to rollback the migration

`

      await fs.writeFile(filePath, template)
      console.log(`Migration created: ${filePath}`)
      return filePath
    } catch (error) {
      console.error('Failed to create migration:', error)
      throw new Error('Migration creation failed')
    }
  }

  async getPendingMigrations(): Promise<Migration[]> {
    try {
      const allMigrations = await this.loadAllMigrations()
      const appliedMigrations = await this.getAppliedMigrations()
      
      const appliedIds = new Set(appliedMigrations.map(m => m.id))
      
      return allMigrations.filter(migration => !appliedIds.has(migration.id))
    } catch (error) {
      console.error('Failed to get pending migrations:', error)
      throw new Error('Failed to get pending migrations')
    }
  }

  async getAppliedMigrations(): Promise<Array<{ id: string; name: string; appliedAt: Date }>> {
    try {
      const result = await db.$queryRaw`
        SELECT id, name, applied_at as appliedAt 
        FROM ${this.tableName} 
        ORDER BY applied_at ASC
      ` as Array<{ id: string; name: string; appliedAt: Date }>

      return result
    } catch (error) {
      console.error('Failed to get applied migrations:', error)
      return []
    }
  }

  async migrateUp(target?: string): Promise<void> {
    try {
      const pendingMigrations = await this.getPendingMigrations()
      
      if (pendingMigrations.length === 0) {
        console.log('No pending migrations')
        return
      }

      const migrationsToApply = target 
        ? pendingMigrations.filter(m => m.id <= target)
        : pendingMigrations

      for (const migration of migrationsToApply) {
        console.log(`Applying migration: ${migration.name}`)
        
        await db.$transaction(async (tx) => {
          // Execute UP migration
          if (migration.up.trim()) {
            await tx.$executeRawUnsafe(migration.up)
          }
          
          // Record migration as applied
          await tx.$executeRaw`
            INSERT INTO ${this.tableName} (id, name, applied_at)
            VALUES (${migration.id}, ${migration.name}, ${new Date()})
          `
        })

        console.log(`Migration applied: ${migration.name}`)
      }
    } catch (error) {
      console.error('Migration failed:', error)
      throw new Error('Migration failed')
    }
  }

  async migrateDown(target?: string): Promise<void> {
    try {
      const appliedMigrations = await this.getAppliedMigrations()
      
      if (appliedMigrations.length === 0) {
        console.log('No migrations to rollback')
        return
      }

      const allMigrations = await this.loadAllMigrations()
      const migrationsToRollback = target
        ? appliedMigrations.filter(m => m.id >= target)
        : [appliedMigrations[appliedMigrations.length - 1]]

      for (const appliedMigration of migrationsToRollback.reverse()) {
        const migration = allMigrations.find(m => m.id === appliedMigration.id)
        
        if (!migration) {
          console.warn(`Migration file not found for: ${appliedMigration.id}`)
          continue
        }

        console.log(`Rolling back migration: ${migration.name}`)
        
        await db.$transaction(async (tx) => {
          // Execute DOWN migration
          if (migration.down.trim()) {
            await tx.$executeRawUnsafe(migration.down)
          }
          
          // Remove migration record
          await tx.$executeRaw`
            DELETE FROM ${this.tableName} 
            WHERE id = ${appliedMigration.id}
          `
        })

        console.log(`Migration rolled back: ${migration.name}`)
      }
    } catch (error) {
      console.error('Migration rollback failed:', error)
      throw new Error('Migration rollback failed')
    }
  }

  async getStatus(): Promise<{
    pending: number
    applied: number
    total: number
    lastApplied?: Date
  }> {
    try {
      const pendingMigrations = await this.getPendingMigrations()
      const appliedMigrations = await this.getAppliedMigrations()
      
      return {
        pending: pendingMigrations.length,
        applied: appliedMigrations.length,
        total: pendingMigrations.length + appliedMigrations.length,
        lastApplied: appliedMigrations.length > 0 
          ? appliedMigrations[appliedMigrations.length - 1].appliedAt 
          : undefined,
      }
    } catch (error) {
      console.error('Failed to get migration status:', error)
      throw new Error('Failed to get migration status')
    }
  }

  private async loadAllMigrations(): Promise<Migration[]> {
    try {
      const files = await fs.readdir(this.config.migrationsDir)
      const migrationFiles = files.filter(file => file.endsWith('.sql'))
      
      const migrations = await Promise.all(
        migrationFiles.map(async (filename) => {
          const filePath = path.join(this.config.migrationsDir, filename)
          const content = await fs.readFile(filePath, 'utf-8')
          
          return this.parseMigrationFile(filename, content)
        })
      )

      return migrations.sort((a, b) => a.id.localeCompare(b.id))
    } catch (error) {
      console.error('Failed to load migrations:', error)
      return []
    }
  }

  private parseMigrationFile(filename: string, content: string): Migration {
    const id = filename.replace('.sql', '')
    const name = id.split('_').slice(1).join('_')
    
    // Split content into UP and DOWN sections
    const sections = content.split('-- DOWN migration')
    const up = sections[0].replace('-- UP migration', '').trim()
    const down = sections[1]?.trim() || ''

    return {
      id,
      name,
      up,
      down,
      createdAt: new Date(id.split('_')[0].replace(/-/g, ':')),
    }
  }
}

// Export singleton instance
export const dbMigration = new DatabaseMigration()