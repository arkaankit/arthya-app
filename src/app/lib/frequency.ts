/**
 * Utility functions for handling frequency conversions
 */

export type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Convert any frequency-based amount to monthly equivalent
 */
export function convertToMonthly(amount: number, frequency: Frequency): number {
  const conversionRates: Record<Frequency, number> = {
    weekly: 52 / 12,      // ~4.33 weeks per month
    biweekly: 26 / 12,    // ~2.17 biweekly periods per month
    monthly: 1,
    quarterly: 1 / 3,     // ~0.33 quarters per month
    yearly: 1 / 12        // ~0.083 years per month
  };

  return amount * conversionRates[frequency];
}
