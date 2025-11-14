import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/currencies - Fetch all currencies
export async function GET() {
  try {
    // In a real implementation, you would fetch exchange rates from a service like:
    // - ExchangeRate-API
    // - Fixer.io
    // - Open Exchange Rates
    // - CurrencyLayer
    
    // For demo purposes, we'll use mock data
    const mockCurrencies = [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        flag: '🇺🇸',
        exchangeRate: 1.0,
        lastUpdated: new Date().toISOString(),
        isDefault: true,
        isActive: true,
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        flag: '🇪🇺',
        exchangeRate: 0.85,
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        flag: '🇬🇧',
        exchangeRate: 0.73,
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        flag: '🇨🇦',
        exchangeRate: 1.25,
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        flag: '🇦🇺',
        exchangeRate: 1.35,
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        flag: '🇯🇵',
        exchangeRate: 110.0,
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        flag: '🇨🇳',
        exchangeRate: 6.45,
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        flag: '🇮🇳',
        exchangeRate: 74.5,
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
    ];

    return NextResponse.json({
      currencies: mockCurrencies,
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}

// POST /api/currencies/update-rates - Update exchange rates
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, you would:
    // 1. Fetch current exchange rates from an API service
    // 2. Update the database with new rates
    // 3. Log the update for auditing

    // For demo purposes, we'll simulate the update
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    // Mock updated rates (in real implementation, these would come from the API)
    const updatedCurrencies = [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        flag: '🇺🇸',
        exchangeRate: 1.0,
        lastUpdated: new Date().toISOString(),
        isDefault: true,
        isActive: true,
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        flag: '🇪🇺',
        exchangeRate: 0.8523, // Slightly updated rate
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        flag: '🇬🇧',
        exchangeRate: 0.7312, // Slightly updated rate
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        flag: '🇨🇦',
        exchangeRate: 1.2487, // Slightly updated rate
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        flag: '🇦🇺',
        exchangeRate: 1.3521, // Slightly updated rate
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        flag: '🇯🇵',
        exchangeRate: 109.87, // Slightly updated rate
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        flag: '🇨🇳',
        exchangeRate: 6.4321, // Slightly updated rate
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        flag: '🇮🇳',
        exchangeRate: 74.23, // Slightly updated rate
        lastUpdated: new Date().toISOString(),
        isDefault: false,
        isActive: true,
      },
    ];

    return NextResponse.json({
      message: 'Exchange rates updated successfully',
      currencies: updatedCurrencies,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rates' },
      { status: 500 }
    );
  }
}