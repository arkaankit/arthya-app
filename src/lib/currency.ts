// Currency utilities and exchange rates

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
];

// Approximate exchange rates (relative to USD)
// In a real application, these would be fetched from an API
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  SGD: 1.34,
  HKD: 7.82,
  SEK: 10.68,
  NZD: 1.65,
  KRW: 1320.50,
  MXN: 17.08,
  BRL: 4.97,
  ZAR: 18.75,
  AED: 3.67,
  SAR: 3.75,
  TRY: 28.95,
};

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

export function getCurrencyName(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.name || currencyCode;
}

export function getCurrencyFlag(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.flag || '';
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;
  
  return convertedAmount;
}

/**
 * Format currency amount with symbol
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2
  } = options;
  
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  let result = '';
  
  if (showSymbol) {
    result = `${symbol}${formattedAmount}`;
  } else {
    result = formattedAmount;
  }
  
  if (showCode) {
    result += ` ${currencyCode}`;
  }
  
  return result;
}

/**
 * Get currency conversion info for display
 */
export function getCurrencyConversionInfo(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  formattedOriginal: string;
  formattedConverted: string;
} {
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);
  const rate = convertedAmount / amount;
  
  return {
    originalAmount: amount,
    convertedAmount,
    fromCurrency,
    toCurrency,
    rate,
    formattedOriginal: formatCurrency(amount, fromCurrency),
    formattedConverted: formatCurrency(convertedAmount, toCurrency)
  };
}

/**
 * Calculate total in base currency from mixed currency amounts
 */
export function calculateTotalInBaseCurrency(
  items: Array<{ amount: number; currency: string }>,
  baseCurrency: string
): number {
  return items.reduce((total, item) => {
    const converted = convertCurrency(item.amount, item.currency, baseCurrency);
    return total + converted;
  }, 0);
}

/**
 * Storage for custom exchange rates (user can override)
 */
const STORAGE_KEY = 'financeflow_custom_rates';

export function getCustomRates(): Record<string, number> {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function setCustomRate(currencyCode: string, rate: number): void {
  const customRates = getCustomRates();
  customRates[currencyCode] = rate;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customRates));
}

export function getEffectiveRate(currencyCode: string): number {
  const customRates = getCustomRates();
  return customRates[currencyCode] || EXCHANGE_RATES[currencyCode] || 1;
}
