import { db } from '@/lib/db'

export interface SocialProvider {
  id: string
  name: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
}

export interface SocialUserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  provider: string
  verified?: boolean
  raw?: any
}

export interface SocialAuthResult {
  success: boolean
  user?: any
  isNewUser?: boolean
  error?: string
  requires2FA?: boolean
}

export class SocialLogin {
  private providers: Map<string, SocialProvider> = new Map()

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // Google OAuth
    this.providers.set('google', {
      id: 'google',
      name: 'Google',
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      scope: ['email', 'profile'],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    })

    // Facebook OAuth
    this.providers.set('facebook', {
      id: 'facebook',
      name: 'Facebook',
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      redirectUri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook`,
      scope: ['email', 'public_profile'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/v18.0/me?fields=id,name,email,picture',
    })

    // GitHub OAuth
    this.providers.set('github', {
      id: 'github',
      name: 'GitHub',
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: process.env.GITHUB_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
      scope: ['user:email', 'read:user'],
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
    })

    // Microsoft OAuth
    this.providers.set('microsoft', {
      id: 'microsoft',
      name: 'Microsoft',
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/microsoft`,
      scope: ['User.Read'],
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    })

    // Apple Sign In
    this.providers.set('apple', {
      id: 'apple',
      name: 'Apple',
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
      redirectUri: process.env.APPLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/callback/apple`,
      scope: ['name', 'email'],
      authUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
      userInfoUrl: '', // Apple doesn't have a user info endpoint
    })
  }

  getProvider(providerId: string): SocialProvider | null {
    return this.providers.get(providerId) || null
  }

  getAvailableProviders(): Array<{ id: string; name: string; enabled: boolean }> {
    return Array.from(this.providers.values()).map(provider => ({
      id: provider.id,
      name: provider.name,
      enabled: !!provider.clientId && !!provider.clientSecret,
    }))
  }

  generateAuthUrl(providerId: string, state?: string): string | null {
    const provider = this.providers.get(providerId)
    if (!provider) {
      return null
    }

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      response_type: 'code',
      scope: provider.scope.join(' '),
      state: state || this.generateState(),
    })

    // Add provider-specific parameters
    if (providerId === 'google') {
      params.set('access_type', 'offline')
      params.set('prompt', 'consent')
    }

    if (providerId === 'facebook') {
      params.set('display', 'popup')
    }

    if (providerId === 'apple') {
      params.set('response_mode', 'form_post')
    }

    return `${provider.authUrl}?${params.toString()}`
  }

  async exchangeCodeForToken(providerId: string, code: string): Promise<string | null> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      return null
    }

    try {
      const response = await fetch(provider.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
          code,
          redirect_uri: provider.redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      const data = await response.json()
      return data.access_token || null
    } catch (error) {
      console.error(`Token exchange failed for ${providerId}:`, error)
      return null
    }
  }

  async getUserProfile(providerId: string, accessToken: string): Promise<SocialUserProfile | null> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      return null
    }

    try {
      let response: Response
      let userData: any

      switch (providerId) {
        case 'google':
          response = await fetch(provider.userInfoUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          userData = await response.json()
          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.picture,
            provider: providerId,
            verified: userData.verified_email,
            raw: userData,
          }

        case 'facebook':
          response = await fetch(provider.userInfoUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          userData = await response.json()
          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.picture?.data?.url,
            provider: providerId,
            verified: userData.verified,
            raw: userData,
          }

        case 'github':
          // Get user info
          response = await fetch(provider.userInfoUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          })
          userData = await response.json()
          
          // Get user email (may require separate request)
          let email = userData.email
          if (!email) {
            const emailResponse = await fetch('https://api.github.com/user/emails', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
              },
            })
            const emails = await emailResponse.json()
            email = emails.find((e: any) => e.primary)?.email || emails[0]?.email
          }

          return {
            id: userData.id.toString(),
            email: email || '',
            name: userData.name || userData.login,
            avatar: userData.avatar_url,
            provider: providerId,
            verified: true, // GitHub accounts are verified by default
            raw: userData,
          }

        case 'microsoft':
          response = await fetch(provider.userInfoUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          })
          userData = await response.json()
          return {
            id: userData.id,
            email: userData.mail || userData.userPrincipalName,
            name: userData.displayName,
            avatar: null, // Microsoft doesn't provide avatar in basic user info
            provider: providerId,
            verified: true,
            raw: userData,
          }

        case 'apple':
          // Apple Sign In requires special handling
          // The user info is returned in the ID token, not a separate endpoint
          // This is a simplified implementation
          return {
            id: '', // Would be extracted from ID token
            email: '', // Would be extracted from ID token
            name: '', // Would be extracted from ID token
            provider: providerId,
            verified: true,
            raw: {},
          }

        default:
          return null
      }
    } catch (error) {
      console.error(`User profile fetch failed for ${providerId}:`, error)
      return null
    }
  }

  async authenticateUser(profile: SocialUserProfile): Promise<SocialAuthResult> {
    try {
      // Check if user exists by email
      let user = await db.user.findUnique({
        where: { email: profile.email },
        include: {
          accounts: true,
          studentProfile: true,
          tutorProfile: true,
          parentProfile: true,
        },
      })

      let isNewUser = false

      if (!user) {
        // Create new user
        user = await db.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar,
            role: 'STUDENT', // Default role, can be changed later
            emailVerified: profile.verified || false,
            accounts: {
              create: {
                provider: profile.provider,
                providerAccountId: profile.id,
                type: 'oauth',
              },
            },
          },
          include: {
            accounts: true,
            studentProfile: true,
            tutorProfile: true,
            parentProfile: true,
          },
        })
        isNewUser = true
      } else {
        // Check if social account already exists
        const existingAccount = user.accounts.find(
          account => account.provider === profile.provider && account.providerAccountId === profile.id
        )

        if (!existingAccount) {
          // Link social account to existing user
          await db.account.create({
            data: {
              userId: user.id,
              provider: profile.provider,
              providerAccountId: profile.id,
              type: 'oauth',
            },
          })
        }

        // Update user info if needed
        await db.user.update({
          where: { id: user.id },
          data: {
            name: profile.name || user.name,
            avatar: profile.avatar || user.avatar,
            emailVerified: profile.verified || user.emailVerified,
          },
        })
      }

      return {
        success: true,
        user,
        isNewUser,
        requires2FA: user.twoFactorEnabled || false,
      }
    } catch (error) {
      console.error('Social authentication failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }
    }
  }

  async unlinkSocialAccount(userId: string, providerId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const account = await db.account.findFirst({
        where: {
          userId,
          provider: providerId,
        },
      })

      if (!account) {
        return {
          success: false,
          message: 'Social account not found',
        }
      }

      // Check if user has other login methods
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true,
        },
      })

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        }
      }

      // Don't allow unlinking if it's the only login method and no password
      const hasPassword = !!user.password
      const hasOtherSocialAccounts = user.accounts.filter(a => a.provider !== providerId).length > 0

      if (!hasPassword && !hasOtherSocialAccounts) {
        return {
          success: false,
          message: 'Cannot unlink the only login method. Please set a password first.',
        }
      }

      // Delete the social account
      await db.account.delete({
        where: { id: account.id },
      })

      return {
        success: true,
        message: 'Social account unlinked successfully',
      }
    } catch (error) {
      console.error('Failed to unlink social account:', error)
      return {
        success: false,
        message: 'Failed to unlink social account',
      }
    }
  }

  async getLinkedSocialAccounts(userId: string): Promise<Array<{ provider: string; providerName: string; linkedAt: Date }>> {
    try {
      const accounts = await db.account.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      return accounts.map(account => ({
        provider: account.provider,
        providerName: this.providers.get(account.provider)?.name || account.provider,
        linkedAt: account.createdAt,
      }))
    } catch (error) {
      console.error('Failed to get linked social accounts:', error)
      return []
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Validate state parameter to prevent CSRF
  validateState(state: string, storedState: string): boolean {
    return state === storedState
  }
}

// Factory function
export function createSocialLogin(): SocialLogin {
  return new SocialLogin()
}

// Global instance
export const socialLogin = createSocialLogin()

// Utility functions
export const socialLoginUtils = {
  // Get provider-specific configuration
  getProviderConfig: (providerId: string) => {
    const configs = {
      google: {
        icon: 'google',
        color: '#4285F4',
        buttonText: 'Continue with Google',
      },
      facebook: {
        icon: 'facebook',
        color: '#1877F2',
        buttonText: 'Continue with Facebook',
      },
      github: {
        icon: 'github',
        color: '#333',
        buttonText: 'Continue with GitHub',
      },
      microsoft: {
        icon: 'microsoft',
        color: '#00A4EF',
        buttonText: 'Continue with Microsoft',
      },
      apple: {
        icon: 'apple',
        color: '#000',
        buttonText: 'Continue with Apple',
      },
    }
    return configs[providerId as keyof typeof configs] || null
  },

  // Generate secure random state
  generateSecureState: (): string => {
    const array = new Uint32Array(2)
    crypto.getRandomValues(array)
    return Array.from(array, dec => dec.toString(16)).join('')
  },

  // Validate OAuth response
  validateOAuthResponse: (response: any): { valid: boolean; error?: string } => {
    if (!response.code) {
      return { valid: false, error: 'Authorization code is required' }
    }

    if (response.error) {
      return { valid: false, error: response.error_description || response.error }
    }

    return { valid: true }
  },

  // Security recommendations
  securityTips: [
    'Always use HTTPS for OAuth flows',
    'Validate state parameter to prevent CSRF',
    'Store client secrets securely',
    'Use PKCE for mobile apps',
    'Limit OAuth scopes to minimum required',
    'Regularly review connected applications',
  ],
}