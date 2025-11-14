import { db } from './db'
import { promises as fs } from 'fs'
import path from 'path'

export interface BackupConfig {
  backupDir: string
  maxBackups: number
  compression: boolean
}

export class DatabaseBackup {
  private config: BackupConfig

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      backupDir: config.backupDir || './backups',
      maxBackups: config.maxBackups || 10,
      compression: config.compression !== false,
    }
  }

  async createBackup(): Promise<string> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.config.backupDir, { recursive: true })

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFileName = `backup-${timestamp}.sql`
      const backupPath = path.join(this.config.backupDir, backupFileName)

      // For SQLite, we can use the built-in backup functionality
      if (process.env.DATABASE_URL?.includes('sqlite')) {
        const sourceDb = process.env.DATABASE_URL?.replace('file:', '')
        if (sourceDb) {
          await fs.copyFile(sourceDb, backupPath)
        }
      } else {
        // For other databases, we would implement appropriate backup logic
        // This is a simplified version for demonstration
        const tables = await this.getTables()
        const backupData = await this.exportTables(tables)
        await fs.writeFile(backupPath, backupData)
      }

      // Clean up old backups
      await this.cleanupOldBackups()

      return backupPath
    } catch (error) {
      console.error('Backup creation failed:', error)
      throw new Error('Failed to create database backup')
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    try {
      if (!await fs.access(backupPath).catch(() => false)) {
        throw new Error('Backup file not found')
      }

      // For SQLite
      if (process.env.DATABASE_URL?.includes('sqlite')) {
        const targetDb = process.env.DATABASE_URL?.replace('file:', '')
        if (targetDb) {
          await fs.copyFile(backupPath, targetDb)
        }
      } else {
        // For other databases, implement appropriate restore logic
        throw new Error('Restore not implemented for this database type')
      }
    } catch (error) {
      console.error('Backup restoration failed:', error)
      throw new Error('Failed to restore database backup')
    }
  }

  async listBackups(): Promise<Array<{ filename: string; path: string; size: number; created: Date }>> {
    try {
      const files = await fs.readdir(this.config.backupDir)
      const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      
      const backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filePath = path.join(this.config.backupDir, filename)
          const stats = await fs.stat(filePath)
          return {
            filename,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
          }
        })
      )

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime())
    } catch (error) {
      console.error('Failed to list backups:', error)
      return []
    }
  }

  private async getTables(): Promise<string[]> {
    // This would be database-specific
    // For SQLite, we can query sqlite_master
    try {
      const result = await db.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ` as Array<{ name: string }>
      
      return result.map(row => row.name)
    } catch (error) {
      console.error('Failed to get tables:', error)
      return []
    }
  }

  private async exportTables(tables: string[]): Promise<string> {
    // This would generate SQL export for each table
    // Simplified version for demonstration
    let exportSQL = '-- Database Backup\n'
    exportSQL += `-- Generated at: ${new Date().toISOString()}\n\n`

    for (const table of tables) {
      exportSQL += `-- Table: ${table}\n`
      // In a real implementation, we would export table structure and data
      exportSQL += `-- Export logic would go here\n\n`
    }

    return exportSQL
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups()
      
      if (backups.length > this.config.maxBackups) {
        const toDelete = backups.slice(this.config.maxBackups)
        
        await Promise.all(
          toDelete.map(async (backup) => {
            await fs.unlink(backup.path)
          })
        )
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error)
    }
  }
}

// Export singleton instance
export const dbBackup = new DatabaseBackup()

// Backup scheduler
export class BackupScheduler {
  private intervalId: NodeJS.Timeout | null = null
  private backupService: DatabaseBackup

  constructor(backupService: DatabaseBackup) {
    this.backupService = backupService
  }

  start(intervalMs: number = 24 * 60 * 60 * 1000): void {
    if (this.intervalId) {
      this.stop()
    }

    // Create initial backup
    this.createScheduledBackup()

    // Schedule regular backups
    this.intervalId = setInterval(() => {
      this.createScheduledBackup()
    }, intervalMs)

    console.log(`Backup scheduler started with ${intervalMs}ms interval`)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('Backup scheduler stopped')
    }
  }

  private async createScheduledBackup(): Promise<void> {
    try {
      const backupPath = await this.backupService.createBackup()
      console.log(`Scheduled backup created: ${backupPath}`)
    } catch (error) {
      console.error('Scheduled backup failed:', error)
    }
  }
}

// Export scheduler instance
export const backupScheduler = new BackupScheduler(dbBackup)