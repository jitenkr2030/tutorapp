"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, CurrencyPreferences, ConvertedAmount } from '@/lib/currency/utils';

interface CurrencyContextType {
  currencies: Currency[];
  userPreferences: CurrencyPreferences;
  loading: boolean;
  error: string | null;
  selectedCurrency: string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency?: string) => ConvertedAmount | null;
  formatCurrency: (amount: number, currency?: string) => string;
  updatePreferences: (preferences: Partial<CurrencyPreferences>) => void;
  refreshExchangeRates: () => Promise<void>;
  setSelectedCurrency: (currency: string) => void;
  getLocalizedPrice: (price: number, priceCurrency: string) => {
    originalPrice: number;
    originalCurrency: string;
    localizedPrice: number;
    localizedCurrency: string;
    shouldShowConverted: boolean;
  };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [userPreferences, setUserPreferences] = useState<CurrencyPreferences>({
    preferredCurrency: 'USD',
    showConvertedPrices: true,
    autoConvert: true,
  });
  const [selectedCurrency, setSelectedCurrencyState] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrencies();
    fetchUserPreferences();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('/api/currencies');
      if (!response.ok) {
        throw new Error('Failed to fetch currencies');
      }
      const data = await response.json();
      setCurrencies(data.currencies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch currencies');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/currency-preferences');
      if (response.ok) {
        const data = await response.json();
        setUserPreferences(data.preferences);
        setSelectedCurrencyState(data.preferences.preferredCurrency);
      }
    } catch (err) {
      console.error('Error fetching user preferences:', err);
    }
  };

  const updatePreferences = async (preferences: Partial<CurrencyPreferences>) => {
    try {
      const response = await fetch('/api/user/currency-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      setUserPreferences(prev => ({ ...prev, ...preferences }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const refreshExchangeRates = async () => {
    try {
      const response = await fetch('/api/currencies/update-rates', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to refresh exchange rates');
      }
      const data = await response.json();
      setCurrencies(data.currencies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh rates');
    }
  };

  const setSelectedCurrency = (currency: string) => {
    setSelectedCurrencyState(currency);
    if (userPreferences.preferredCurrency !== currency) {
      updatePreferences({ preferredCurrency: currency });
    }
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency?: string): ConvertedAmount | null => {
    const targetCurrency = toCurrency || userPreferences.preferredCurrency;
    
    if (fromCurrency === targetCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency,
        exchangeRate: 1,
        timestamp: new Date().toISOString(),
      };
    }

    const fromRate = currencies.find(c => c.code === fromCurrency)?.exchangeRate || 1;
    const toRate = currencies.find(c => c.code === targetCurrency)?.exchangeRate || 1;
    
    const baseAmount = amount / fromRate;
    const convertedAmount = baseAmount * toRate;
    
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      targetCurrency,
      exchangeRate: toRate / fromRate,
      timestamp: new Date().toISOString(),
    };
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const targetCurrency = currency || userPreferences.preferredCurrency;
    const currencyInfo = currencies.find(c => c.code === targetCurrency);
    const symbol = currencyInfo?.symbol || '$';
    
    switch (targetCurrency) {
      case 'JPY':
      case 'CNY':
        return `${symbol}${Math.round(amount).toLocaleString()}`;
      default:
        return `${symbol}${amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
    }
  };

  const getLocalizedPrice = (price: number, priceCurrency: string) => {
    const originalPrice = price;
    const originalCurrency = priceCurrency;
    const localizedCurrency = userPreferences.preferredCurrency;
    
    let localizedPrice = originalPrice;
    let shouldShowConverted = false;

    if (userPreferences.autoConvert && originalCurrency !== localizedCurrency) {
      const converted = convertAmount(originalPrice, originalCurrency, localizedCurrency);
      localizedPrice = converted?.convertedAmount || originalPrice;
      shouldShowConverted = userPreferences.showConvertedPrices;
    }

    return {
      originalPrice,
      originalCurrency,
      localizedPrice,
      localizedCurrency,
      shouldShowConverted,
    };
  };

  const value: CurrencyContextType = {
    currencies,
    userPreferences,
    loading,
    error,
    selectedCurrency,
    convertAmount,
    formatCurrency,
    updatePreferences,
    refreshExchangeRates,
    setSelectedCurrency,
    getLocalizedPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Custom hooks for common currency operations
export function useCurrencyConverter() {
  const { convertAmount, formatCurrency, selectedCurrency } = useCurrency();
  
  return {
    convert: (amount: number, fromCurrency: string, toCurrency?: string) => 
      convertAmount(amount, fromCurrency, toCurrency),
    format: (amount: number, currency?: string) => 
      formatCurrency(amount, currency),
    selectedCurrency,
  };
}

export function useLocalizedPrice() {
  const { getLocalizedPrice, formatCurrency } = useCurrency();
  
  return {
    getLocalizedPrice,
    formatPrice: (price: number, currency: string) => 
      formatCurrency(price, currency),
  };
}