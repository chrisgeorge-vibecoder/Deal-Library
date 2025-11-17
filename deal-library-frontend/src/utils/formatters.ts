/**
 * Formatting utilities for displaying data
 */

/**
 * Format scale numbers for display
 * @param scale - The scale number (e.g., 2500000)
 * @returns Formatted string (e.g., "2.5M")
 */
export function formatScale(scale?: number): string {
  if (!scale || scale === 0) return 'N/A';
  
  if (scale >= 1000000) {
    const millions = scale / 1000000;
    return `${millions.toFixed(1)}M`;
  }
  
  if (scale >= 1000) {
    const thousands = scale / 1000;
    return `${thousands.toFixed(1)}K`;
  }
  
  return scale.toString();
}

/**
 * Format currency for display
 * @param amount - The amount in dollars
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage for display
 * @param value - The decimal value (e.g., 0.15)
 * @returns Formatted string (e.g., "15%")
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}









