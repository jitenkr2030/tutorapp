"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Globe, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Yen, 
  Yuan, 
  Rupee, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Settings,
  CreditCard,
  Calculator
} from "lucide-react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number;
  lastUpdated: string;
  isDefault: boolean;
  isActive: boolean;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

interface UserPreferences {
  preferredCurrency: string;
  showConvertedPrices: boolean;
  autoConvert: boolean;
}

const currencyIcons: Record<string, React.ReactNode> = {
  USD: <DollarSign className="h-5 w-5" />,
  EUR: <Euro className="h-5 w-5" />,
  GBP: <PoundSterling className="h-5 w-5" />,
  CAD: <DollarSign className="h-5 w-5" />,
  AUD: <DollarSign className="h-5 w-5" />,
  JPY: <Yen className="h-5 w-5" />,
  CNY: <Yuan className="h-5 w-5" />,
  INR: <Rupee className="h-5 w-5" />,
};

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  JPY: "🇯🇵",
  CNY: "🇨🇳",
  INR: "🇮🇳",
};

export default function MultiCurrencySupport() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    preferredCurrency: "USD",
    showConvertedPrices: true,
    autoConvert: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [updatingRates, setUpdatingRates] = useState(false);

  useEffect(() => {
    fetchCurrencies();
    fetchUserPreferences();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/currencies");
      if (!response.ok) {
        throw new Error("Failed to fetch currencies");
      }
      const data = await response.json();
      setCurrencies(data.currencies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch currencies");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch("/api/user/currency-preferences");
      if (response.ok) {
        const data = await response.json();
        setUserPreferences(data.preferences);
        setSelectedCurrency(data.preferences.preferredCurrency);
      }
    } catch (err) {
      console.error("Error fetching user preferences:", err);
    }
  };

  const updateExchangeRates = async () => {
    setUpdatingRates(true);
    try {
      const response = await fetch("/api/currencies/update-rates", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to update exchange rates");
      }
      await fetchCurrencies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update rates");
    } finally {
      setUpdatingRates(false);
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch("/api/user/currency-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });
      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }
      setUserPreferences(prev => ({ ...prev, ...preferences }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preferences");
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    if (userPreferences.preferredCurrency !== currencyCode) {
      updateUserPreferences({ preferredCurrency: currencyCode });
    }
  };

  const convertCurrency = () => {
    if (!amount || !selectedCurrency) return;
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return;
    
    const selectedCurrencyObj = currencies.find(c => c.code === selectedCurrency);
    const defaultCurrency = currencies.find(c => c.isDefault);
    
    if (selectedCurrencyObj && defaultCurrency) {
      const converted = amountNum * selectedCurrencyObj.exchangeRate;
      setConvertedAmount(converted.toFixed(2));
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || "$";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getCurrencyIcon = (currencyCode: string) => {
    return currencyIcons[currencyCode] || <DollarSign className="h-5 w-5" />;
  };

  const getCurrencyFlag = (currencyCode: string) => {
    return currencyFlags[currencyCode] || "🌐";
  };

  const activeCurrencies = currencies.filter(c => c.isActive);
  const defaultCurrency = currencies.find(c => c.isDefault);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Multi-Currency Support</h2>
          <p className="text-gray-600 mt-2">Manage currencies and exchange rates</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Multi-Currency Support</h2>
          <p className="text-gray-600 mt-1">Manage currencies, exchange rates, and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={updateExchangeRates}
            disabled={updatingRates}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updatingRates ? 'animate-spin' : ''}`} />
            {updatingRates ? "Updating..." : "Update Rates"}
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Currency Preferences</DialogTitle>
                <DialogDescription>
                  Configure your currency display and conversion settings.
                </DialogDescription>
              </DialogHeader>
              <CurrencySettings
                preferences={userPreferences}
                currencies={currencies}
                onUpdatePreferences={updateUserPreferences}
                onClose={() => setShowSettings(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Currencies</p>
                <p className="text-2xl font-bold">{activeCurrencies.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Default Currency</p>
                <p className="text-2xl font-bold">{defaultCurrency?.code || "USD"}</p>
              </div>
              {getCurrencyIcon(defaultCurrency?.code || "USD")}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Currency</p>
                <p className="text-2xl font-bold">{userPreferences.preferredCurrency}</p>
              </div>
              {getCurrencyIcon(userPreferences.preferredCurrency)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold">
                  {currencies[0]?.lastUpdated ? 
                    new Date(currencies[0].lastUpdated).toLocaleDateString() : 
                    "Never"
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="currencies">
        <TabsList>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
          <TabsTrigger value="converter">Currency Converter</TabsTrigger>
          <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="currencies" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencies.map((currency) => (
              <Card key={currency.code} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCurrencyFlag(currency.code)}</span>
                      <div>
                        <CardTitle className="text-lg">{currency.code}</CardTitle>
                        <CardDescription>{currency.name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currency.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                      {currency.isActive ? (
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Symbol</span>
                      <span className="font-semibold">{currency.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exchange Rate</span>
                      <span className="font-semibold">{currency.exchangeRate.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-xs text-gray-500">
                        {new Date(currency.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedCurrency === currency.code && (
                      <div className="flex items-center gap-2 mt-3">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600">Selected</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="converter" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Currency Converter
              </CardTitle>
              <CardDescription>
                Convert amounts between different currencies using real-time exchange rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-currency">From Currency</Label>
                    <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{getCurrencyFlag(currency.code)}</span>
                              <span>{currency.code} - {currency.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="converted-amount">Converted Amount</Label>
                    <Input
                      id="converted-amount"
                      value={convertedAmount}
                      readOnly
                      placeholder="Converted amount"
                    />
                  </div>
                  <div>
                    <Label>To Currency (Default: USD)</Label>
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                      <span className="text-2xl">{getCurrencyFlag(defaultCurrency?.code || "USD")}</span>
                      <span className="font-semibold">{defaultCurrency?.code || "USD"}</span>
                      <span className="text-sm text-gray-600">- {defaultCurrency?.name || "US Dollar"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={convertCurrency} disabled={!amount}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Convert Currency
                </Button>
              </div>
              
              {convertedAmount && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-semibold">
                    {amount} {selectedCurrency} = {convertedAmount} {defaultCurrency?.code || "USD"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Exchange Rate: 1 {selectedCurrency} = {currencies.find(c => c.code === selectedCurrency)?.exchangeRate.toFixed(4)} {defaultCurrency?.code || "USD"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rates</CardTitle>
              <CardDescription>
                Current exchange rates relative to the default currency ({defaultCurrency?.code || "USD"})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Currency</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-right p-3">Exchange Rate</th>
                      <th className="text-right p-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currencies.map((currency) => (
                      <tr key={currency.code} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span>{getCurrencyFlag(currency.code)}</span>
                            <span className="font-semibold">{currency.code}</span>
                          </div>
                        </td>
                        <td className="p-3">{currency.name}</td>
                        <td className="p-3 text-right font-mono">
                          {currency.exchangeRate.toFixed(4)}
                        </td>
                        <td className="p-3 text-right text-sm text-gray-600">
                          {new Date(currency.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Currency Settings Component
interface CurrencySettingsProps {
  preferences: UserPreferences;
  currencies: Currency[];
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
  onClose: () => void;
}

function CurrencySettings({ 
  preferences, 
  currencies, 
  onUpdatePreferences, 
  onClose 
}: CurrencySettingsProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleSave = () => {
    onUpdatePreferences(localPreferences);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="preferred-currency">Preferred Currency</Label>
          <Select 
            value={localPreferences.preferredCurrency} 
            onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, preferredCurrency: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preferred currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.filter(c => c.isActive).map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span>{currencyFlags[currency.code]}</span>
                    <span>{currency.code} - {currency.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-converted"
              checked={localPreferences.showConvertedPrices}
              onChange={(e) => setLocalPreferences(prev => ({ ...prev, showConvertedPrices: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="show-converted">Show converted prices</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-convert"
              checked={localPreferences.autoConvert}
              onChange={(e) => setLocalPreferences(prev => ({ ...prev, autoConvert: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="auto-convert">Auto-convert to preferred currency</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}