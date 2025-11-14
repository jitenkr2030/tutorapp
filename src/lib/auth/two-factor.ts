import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { db } from '@/lib/db'

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorVerification {
  success: boolean
  message?: string
  backupCodeUsed?: boolean
}

export class TwoFactorAuth {
  private appName = 'Tutoring Platform'

  constructor() {
    // Configure OTP authenticator
    authenticator.options = {
      window: 2, // Allow 2 steps before/after current time
      step: 30, // 30 second intervals
    }
  }

  async generateSecret(userId: string): Promise<string> {
    // Generate a unique secret for the user
    const secret = authenticator.generateSecret()
    
    // Store the secret temporarily (not yet enabled)
    await db.user.update({
      where: { id: userId },
      data: {
        // Store in a secure way - in production, this should be encrypted
        twoFactorSecret: secret,
        twoFactorEnabled: false,
      },
    })

    return secret
  }

  async generateSetupQR(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    // Generate secret if not exists
    let secret = await this.getUserSecret(userId)
    if (!secret) {
      secret = await this.generateSecret(userId)
    }

    // Generate QR code
    const otpauth = authenticator.keyuri(userEmail, this.appName, secret)
    const qrCode = await QRCode.toDataURL(otpauth)

    // Generate backup codes
    const backupCodes = this.generateBackupCodes()

    // Store backup codes (hashed in production)
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: backupCodes,
      },
    })

    return {
      secret,
      qrCode,
      backupCodes,
    }
  }

  async verifyAndEnable2FA(userId: string, token: string): Promise<TwoFactorVerification> {
    const secret = await this.getUserSecret(userId)
    if (!secret) {
      return {
        success: false,
        message: '2FA setup not initiated',
      }
    }

    const isValid = authenticator.verify({
      token,
      secret,
    })

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid verification code',
      }
    }

    // Enable 2FA for the user
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date(),
      },
    })

    return {
      success: true,
      message: '2FA enabled successfully',
    }
  }

  async verifyToken(userId: string, token: string): Promise<TwoFactorVerification> {
    // First try 2FA token
    const secret = await this.getUserSecret(userId)
    if (secret) {
      const isValid = authenticator.verify({
        token,
        secret,
      })

      if (isValid) {
        return {
          success: true,
          message: '2FA verification successful',
        }
      }
    }

    // If 2FA token fails, try backup codes
    const backupCodeUsed = await this.verifyBackupCode(userId, token)
    if (backupCodeUsed) {
      return {
        success: true,
        message: 'Backup code used successfully',
        backupCodeUsed: true,
      }
    }

    return {
      success: false,
      message: 'Invalid verification code or backup code',
    }
  }

  async disable2FA(userId: string, password: string): Promise<TwoFactorVerification> {
    // Verify user's password before disabling 2FA
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.password) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    // In production, verify password hash
    const bcrypt = await import('bcryptjs')
    const isPasswordValid = await bcrypt.default.compare(password, user.password)
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password',
      }
    }

    // Disable 2FA
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        twoFactorVerifiedAt: null,
      },
    })

    return {
      success: true,
      message: '2FA disabled successfully',
    }
  }

  async regenerateBackupCodes(userId: string, password: string): Promise<{ success: boolean; backupCodes?: string[]; message?: string }> {
    // Verify user's password
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.password) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    const bcrypt = await import('bcryptjs')
    const isPasswordValid = await bcrypt.default.compare(password, user.password)
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password',
      }
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes()

    // Store new backup codes
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: backupCodes,
      },
    })

    return {
      success: true,
      backupCodes,
      message: 'Backup codes regenerated successfully',
    }
  }

  async is2FAEnabled(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    })

    return user?.twoFactorEnabled || false
  }

  async get2FAStatus(userId: string): Promise<{
    enabled: boolean
    verifiedAt?: Date
    hasBackupCodes: boolean
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
        twoFactorBackupCodes: true,
      },
    })

    if (!user) {
      return {
        enabled: false,
        hasBackupCodes: false,
      }
    }

    return {
      enabled: user.twoFactorEnabled,
      verifiedAt: user.twoFactorVerifiedAt || undefined,
      hasBackupCodes: (user.twoFactorBackupCodes as string[])?.length > 0,
    }
  }

  private async getUserSecret(userId: string): Promise<string | null> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    })

    return user?.twoFactorSecret || null
  }

  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { twoFactorBackupCodes: true },
    })

    if (!user || !user.twoFactorBackupCodes) {
      return false
    }

    const backupCodes = user.twoFactorBackupCodes as string[]
    const codeIndex = backupCodes.indexOf(code)

    if (codeIndex === -1) {
      return false
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1)
    
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: backupCodes,
      },
    })

    return true
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  // Rate limiting for 2FA attempts
  async checkRateLimit(userId: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
    const key = `2fa_attempts:${userId}`
    
    // This would typically use Redis for distributed rate limiting
    // For now, we'll use a simple in-memory approach
    const maxAttempts = 5
    const windowMs = 15 * 60 * 1000 // 15 minutes

    // In production, implement proper rate limiting with Redis
    return {
      allowed: true,
      remainingAttempts: maxAttempts,
    }
  }

  async recordFailedAttempt(userId: string): Promise<void> {
    const key = `2fa_attempts:${userId}`
    
    // In production, increment counter in Redis with expiration
    console.log(`Recording failed 2FA attempt for user: ${userId}`)
  }

  async resetAttempts(userId: string): Promise<void> {
    const key = `2fa_attempts:${userId}`
    
    // In production, delete counter from Redis
    console.log(`Resetting 2FA attempts for user: ${userId}`)
  }
}

// Factory function
export function createTwoFactorAuth(): TwoFactorAuth {
  return new TwoFactorAuth()
}

// Global instance
export const twoFactorAuth = createTwoFactorAuth()

// Utility functions
export const twoFactorUtils = {
  // Format backup codes for display
  formatBackupCodes: (codes: string[]): string[] => {
    return codes.map(code => code.match(/.{1,4}/g)?.join('-') || code)
  },

  // Generate recovery key for emergency access
  generateRecoveryKey: (): string => {
    const parts = []
    for (let i = 0; i < 8; i++) {
      parts.push(Math.random().toString(36).substring(2, 6).toUpperCase())
    }
    return parts.join('-')
  },

  // Validate TOTP token format
  isValidTokenFormat: (token: string): boolean => {
    return /^\d{6}$/.test(token)
  },

  // Get time remaining for current token
  getTimeRemaining: (): number => {
    const step = 30 // 30 second intervals
    const now = Math.floor(Date.now() / 1000)
    return step - (now % step)
  },

  // Security recommendations
  securityTips: [
    'Store backup codes in a secure location',
    'Enable 2FA on all your important accounts',
    'Use a different 2FA method for each account',
    'Regularly check your 2FA settings',
    'Never share your 2FA codes with anyone',
    'Use an authenticator app instead of SMS when possible',
  ],
}