import { NextRequest, NextResponse } from 'next/server'
import { socialLogin, socialLoginUtils } from '@/lib/auth/social-login'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider')
    const action = searchParams.get('action')

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'auth-url':
        return await handleAuthUrl(provider)
      case 'providers':
        return await handleGetProviders()
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Social login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'callback':
        return await handleCallback(data)
      case 'unlink':
        return await handleUnlink(data)
      case 'linked-accounts':
        return await handleLinkedAccounts(data)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Social login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleAuthUrl(provider: string): Promise<NextResponse> {
  try {
    const state = socialLoginUtils.generateSecureState()
    const authUrl = socialLogin.generateAuthUrl(provider, state)
    
    if (!authUrl) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    // Store state in session or database (simplified for demo)
    // In production, you would store this in a secure session

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        state,
      },
    })
  } catch (error) {
    console.error('Auth URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}

async function handleGetProviders(): Promise<NextResponse> {
  try {
    const providers = socialLogin.getAvailableProviders()
    
    return NextResponse.json({
      success: true,
      data: providers,
    })
  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: 'Failed to get providers' },
      { status: 500 }
    )
  }
}

async function handleCallback(data: any): Promise<NextResponse> {
  try {
    const { provider, code, state } = data

    if (!provider || !code) {
      return NextResponse.json(
        { error: 'Provider and code are required' },
        { status: 400 }
      )
    }

    // Validate state (simplified - in production, compare with stored state)
    if (!state) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      )
    }

    // Exchange code for access token
    const accessToken = await socialLogin.exchangeCodeForToken(provider, code)
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to exchange code for token' },
        { status: 400 }
      )
    }

    // Get user profile
    const userProfile = await socialLogin.getUserProfile(provider, accessToken)
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 400 }
      )
    }

    // Authenticate user
    const authResult = await socialLogin.authenticateUser(userProfile)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: authResult.user,
        isNewUser: authResult.isNewUser,
        requires2FA: authResult.requires2FA,
      },
    })
  } catch (error) {
    console.error('Social login callback error:', error)
    return NextResponse.json(
      { error: 'Failed to complete social login' },
      { status: 500 }
    )
  }
}

async function handleUnlink(data: any): Promise<NextResponse> {
  try {
    const { userId, provider } = data

    if (!userId || !provider) {
      return NextResponse.json(
        { error: 'User ID and provider are required' },
        { status: 400 }
      )
    }

    const result = await socialLogin.unlinkSocialAccount(userId, provider)
    
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
    console.error('Unlink social account error:', error)
    return NextResponse.json(
      { error: 'Failed to unlink social account' },
      { status: 500 }
    )
  }
}

async function handleLinkedAccounts(data: any): Promise<NextResponse> {
  try {
    const { userId } = data

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const accounts = await socialLogin.getLinkedSocialAccounts(userId)
    
    return NextResponse.json({
      success: true,
      data: accounts,
    })
  } catch (error) {
    console.error('Get linked accounts error:', error)
    return NextResponse.json(
      { error: 'Failed to get linked accounts' },
      { status: 500 }
    )
  }
}