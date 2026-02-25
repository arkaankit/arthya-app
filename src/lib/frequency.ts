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

/**
 * Convert any frequency-based amount to yearly equivalent
 */
export function convertToYearly(amount: number, frequency: Frequency): number {
  const conversionRates: Record<Frequency, number> = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    quarterly: 4,
    yearly: 1
  };

  return amount * conversionRates[frequency];
}

/**
 * Get display label for frequency
 */
export function getFrequencyLabel(frequency: Frequency): string {
  const labels: Record<Frequency, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  };

  return labels[frequency];
}

/**
 * Calculate the number of occurrences in a given time period
 */
export function getOccurrencesInPeriod(frequency: Frequency, months: number): number {
  const perMonth: Record<Frequency, number> = {
    weekly: 52 / 12,
    biweekly: 26 / 12,
    monthly: 1,
    quarterly: 1 / 3,
    yearly: 1 / 12
  };

  return perMonth[frequency] * months;
}
