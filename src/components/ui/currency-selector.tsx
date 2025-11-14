"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/currency-context";
import { Globe, ChevronDown } from "lucide-react";

interface CurrencySelectorProps {
  variant?: "button" | "select" | "compact";
  className?: string;
  showFlag?: boolean;
  showSymbol?: boolean;
  onCurrencyChange?: (currency: string) => void;
}

export default function CurrencySelector({
  variant = "button",
  className = "",
  showFlag = true,
  showSymbol = true,
  onCurrencyChange,
}: CurrencySelectorProps) {
  const { 
    currencies, 
    selectedCurrency, 
    setSelectedCurrency, 
    userPreferences,
    loading 
  } = useCurrency();
  
  const [open, setOpen] = useState(false);

  const activeCurrencies = currencies.filter(currency => currency.isActive);
  const currentCurrency = currencies.find(c => c.code === selectedCurrency);

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    onCurrencyChange?.(currencyCode);
    setOpen(false);
  };

  const getCurrencyDisplay = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (!currency) return currencyCode;

    const parts = [];
    if (showFlag) parts.push(currency.flag);
    if (showSymbol) parts.push(currency.symbol);
    parts.push(currency.code);

    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (variant === "select") {
    return (
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select currency">
            {getCurrencyDisplay(selectedCurrency)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {activeCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span>{currency.flag}</span>
                <span>{currency.code}</span>
                <span className="text-gray-500">- {currency.name}</span>
                {currency.isDefault && (
                  <Badge variant="outline" className="text-xs">Default</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === "compact") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <Globe className="h-4 w-4 mr-1" />
            {selectedCurrency}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            {activeCurrencies.map((currency) => (
              <Button
                key={currency.code}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleCurrencyChange(currency.code)}
              >
                <span className="mr-2">{currency.flag}</span>
                <span>{currency.code}</span>
                {currency.isDefault && (
                  <Badge variant="outline" className="ml-auto text-xs">Default</Badge>
                )}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Default button variant
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <Globe className="h-4 w-4 mr-2" />
          {getCurrencyDisplay(selectedCurrency)}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Select Currency</h3>
          <p className="text-xs text-gray-500">Choose your preferred currency</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {activeCurrencies.map((currency) => (
            <button
              key={currency.code}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
              onClick={() => handleCurrencyChange(currency.code)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{currency.flag}</span>
                  <div>
                    <div className="font-medium">{currency.code}</div>
                    <div className="text-sm text-gray-500">{currency.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{currency.symbol}</div>
                  {currency.isDefault && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Compact version for headers and tight spaces
export function CompactCurrencySelector({ className = "" }: { className?: string }) {
  const { selectedCurrency, currencies } = useCurrency();
  const currentCurrency = currencies.find(c => c.code === selectedCurrency);
  
  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {currentCurrency?.flag && <span>{currentCurrency.flag}</span>}
      <span className="font-medium">{selectedCurrency}</span>
    </div>
  );
}

// Currency display component for showing prices with conversion
interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  showConversion?: boolean;
  className?: string;
  showOriginal?: boolean;
}

export function CurrencyDisplay({ 
  amount, 
  currency, 
  showConversion = true, 
  className = "",
  showOriginal = false 
}: CurrencyDisplayProps) {
  const { 
    formatCurrency, 
    getLocalizedPrice, 
    userPreferences,
    currencies 
  } = useCurrency();

  if (!showConversion || currency === userPreferences.preferredCurrency) {
    return (
      <span className={className}>
        {formatCurrency(amount, currency)}
      </span>
    );
  }

  const localizedPrice = getLocalizedPrice(amount, currency);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {formatCurrency(localizedPrice.localizedPrice, localizedPrice.localizedCurrency)}
        </span>
        {showOriginal && (
          <span className="text-sm text-gray-500">
            ({formatCurrency(localizedPrice.originalPrice, localizedPrice.originalCurrency)})
          </span>
        )}
      </div>
    </div>
  );
}

// Price comparison component for showing prices in multiple currencies
interface PriceComparisonProps {
  price: number;
  currency: string;
  className?: string;
}

export function PriceComparison({ price, currency, className = "" }: PriceComparisonProps) {
  const { currencies, convertAmount, formatCurrency } = useCurrency();
  
  const activeCurrencies = currencies.filter(c => c.isActive && c.code !== currency);
  
  return (
    <div className={className}>
      <div className="text-sm font-medium mb-2">Price in other currencies:</div>
      <div className="space-y-1">
        {activeCurrencies.slice(0, 3).map((targetCurrency) => {
          const converted = convertAmount(price, currency, targetCurrency.code);
          return (
            <div key={targetCurrency.code} className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <span>{targetCurrency.flag}</span>
                <span>{targetCurrency.code}</span>
              </span>
              <span className="font-medium">
                {converted ? formatCurrency(converted.convertedAmount, targetCurrency.code) : 'N/A'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}