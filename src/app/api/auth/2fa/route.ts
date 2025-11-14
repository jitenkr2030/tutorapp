import { NextRequest, NextResponse } from 'next/server'
import { twoFactorAuth } from '@/lib/auth/two-factor'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { action, ...data } = await req.json()
    const userId = session.user.id

    switch (action) {
      case 'setup':
        return await handleSetup(userId, data)
      case 'verify':
        return await handleVerify(userId, data)
      case 'disable':
        return await handleDisable(userId, data)
      case 'regenerate-backup-codes':
        return await handleRegenerateBackupCodes(userId, data)
      case 'status':
        return await handleStatus(userId)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('2FA API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSetup(userId: string, data: any): Promise<NextResponse> {
  try {
    const { email } = data
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const setup = await twoFactorAuth.generateSetupQR(userId, email)
    
    return NextResponse.json({
      success: true,
      data: setup,
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
}

async function handleVerify(userId: string, data: any): Promise<NextResponse> {
  try {
    const { token } = data
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Check rate limiting
    const rateLimit = await twoFactorAuth.checkRateLimit(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const result = await twoFactorAuth.verifyAndEnable2FA(userId, token)
    
    if (!result.success) {
      await twoFactorAuth.recordFailedAttempt(userId)
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    await twoFactorAuth.resetAttempts(userId)
    
    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    )
  }
}

async function handleDisable(userId: string, data: any): Promise<NextResponse> {
  try {
    const { password } = data
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const result = await twoFactorAuth.disable2FA(userId, password)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}

async function handleRegenerateBackupCodes(userId: string, data: any): Promise<NextResponse> {
  try {
    const { password } = data
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const result = await twoFactorAuth.regenerateBackupCodes(userId, password)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        backupCodes: result.backupCodes,
      },
      message: result.message,
    })
  } catch (error) {
    console.error('2FA backup codes regeneration error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate backup codes' },
      { status: 500 }
    )
  }
}

async function handleStatus(userId: string): Promise<NextResponse> {
  try {
    const status = await twoFactorAuth.get2FAStatus(userId)
    
    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('2FA status error:', error)
    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    )
  }
}