import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

interface UserPreferences {
  preferredCurrency: string;
  showConvertedPrices: boolean;
  autoConvert: boolean;
}

// GET /api/user/currency-preferences - Fetch user currency preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, you would fetch from the database
    // For demo purposes, we'll return default preferences
    const defaultPreferences: UserPreferences = {
      preferredCurrency: 'USD',
      showConvertedPrices: true,
      autoConvert: true,
    };

    return NextResponse.json({
      preferences: defaultPreferences,
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/user/currency-preferences - Update user currency preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { preferredCurrency, showConvertedPrices, autoConvert } = body;

    // Validate input
    if (!preferredCurrency || typeof preferredCurrency !== 'string') {
      return NextResponse.json(
        { error: 'Invalid preferred currency' },
        { status: 400 }
      );
    }

    if (typeof showConvertedPrices !== 'boolean' || typeof autoConvert !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid preference values' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Update the user's preferences in the database
    // 2. Log the preference change
    // 3. Potentially update other related data

    // For demo purposes, we'll just return success
    const updatedPreferences: UserPreferences = {
      preferredCurrency,
      showConvertedPrices,
      autoConvert,
    };

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}