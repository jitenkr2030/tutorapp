export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number;
  lastUpdated: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CurrencyPreferences {
  preferredCurrency: string;
  showConvertedPrices: boolean;
  autoConvert: boolean;
}

export interface ConvertedAmount {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: string;
}

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convert to base currency (USD) first, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
}

/**
 * Format a currency amount with proper symbol and formatting
 */
export function formatCurrency(
  amount: number,
  currency: string,
  currencies: Currency[]
): string {
  const currencyInfo = currencies.find(c => c.code === currency);
  const symbol = currencyInfo?.symbol || '$';
  
  // Handle different formatting for different currencies
  switch (currency) {
    case 'JPY':
    case 'CNY':
      // These currencies typically don't use decimal places
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    default:
      return `${symbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
  }
}

/**
 * Get currency display information
 */
export function getCurrencyDisplay(currency: string, currencies: Currency[]) {
  const currencyInfo = currencies.find(c => c.code === currency);
  return {
    code: currencyInfo?.code || currency,
    name: currencyInfo?.name || currency,
    symbol: currencyInfo?.symbol || '$',
    flag: currencyInfo?.flag || '🌐',
    exchangeRate: currencyInfo?.exchangeRate || 1,
  };
}

/**
 * Calculate price in user's preferred currency
 */
export function getLocalizedPrice(
  price: number,
  priceCurrency: string,
  userPreferences: CurrencyPreferences,
  currencies: Currency[]
): {
  originalPrice: number;
  originalCurrency: string;
  localizedPrice: number;
  localizedCurrency: string;
  shouldShowConverted: boolean;
} {
  const exchangeRates = currencies.reduce((acc, curr) => {
    acc[curr.code] = curr.exchangeRate;
    return acc;
  }, {} as Record<string, number>);

  const originalPrice = price;
  const originalCurrency = priceCurrency;
  const localizedCurrency = userPreferences.preferredCurrency;
  
  let localizedPrice = originalPrice;
  let shouldShowConverted = false;

  if (userPreferences.autoConvert && originalCurrency !== localizedCurrency) {
    localizedPrice = convertCurrency(originalPrice, originalCurrency, localizedCurrency, exchangeRates);
    shouldShowConverted = userPreferences.showConvertedPrices;
  }

  return {
    originalPrice,
    originalCurrency,
    localizedPrice,
    localizedCurrency,
    shouldShowConverted,
  };
}

/**
 * Get all active currencies
 */
export function getActiveCurrencies(currencies: Currency[]): Currency[] {
  return currencies.filter(currency => currency.isActive);
}

/**
 * Get default currency
 */
export function getDefaultCurrency(currencies: Currency[]): Currency | null {
  return currencies.find(currency => currency.isDefault) || null;
}

/**
 * Check if exchange rates need updating
 */
export function shouldUpdateRates(currencies: Currency[]): boolean {
  const now = new Date();
  const lastUpdate = currencies.length > 0 ? new Date(currencies[0].lastUpdated) : new Date(0);
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  // Update if more than 24 hours have passed
  return hoursSinceUpdate > 24;
}

/**
 * Validate currency code
 */
export function isValidCurrencyCode(code: string, currencies: Currency[]): boolean {
  return currencies.some(currency => currency.code === code && currency.isActive);
}

/**
 * Get currency options for dropdown/select components
 */
export function getCurrencyOptions(currencies: Currency[]): Array<{
  value: string;
  label: string;
  flag: string;
  symbol: string;
}> {
  return getActiveCurrencies(currencies).map(currency => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`,
    flag: currency.flag,
    symbol: currency.symbol,
  }));
}

/**
 * Calculate price difference between currencies
 */
export function calculatePriceDifference(
  priceA: number,
  currencyA: string,
  priceB: number,
  currencyB: string,
  exchangeRates: Record<string, number>
): {
  difference: number;
  percentage: number;
  isHigher: boolean;
} {
  const convertedPriceB = convertCurrency(priceB, currencyB, currencyA, exchangeRates);
  const difference = priceA - convertedPriceB;
  const percentage = (difference / convertedPriceB) * 100;
  
  return {
    difference,
    percentage,
    isHigher: difference > 0,
  };
}

/**
 * Round currency amount appropriately
 */
export function roundCurrencyAmount(amount: number, currency: string): number {
  // Different currencies have different decimal precision rules
  switch (currency) {
    case 'JPY':
    case 'CNY':
    case 'INR':
      return Math.round(amount);
    default:
      return Math.round(amount * 100) / 100;
  }
}