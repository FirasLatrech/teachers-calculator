/**
 * Utility functions for consistent formatting of numbers and dates across the app
 */

/**
 * Format a number to fixed decimal places with European style (using . as decimal separator)
 * and ensuring Latin numerals are used regardless of device locale
 */
export const formatNumber = (value: number, decimalPlaces = 2): string => {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    numberingSystem: 'latn',
  });
};

/**
 * Format a date to a time string (HH:MM) ensuring Latin numerals are used
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    numberingSystem: 'latn',
  });
};

/**
 * Format a date string to full date with time, ensuring Latin numerals are used
 */
export const formatFullDate = (dateString: string, language: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    numberingSystem: 'latn',
  });
};
