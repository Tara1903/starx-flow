/**
 * European Localization, Timezone and Currency Utilities
 */

export const DEFAULT_LOCALE = 'de-DE';
export const DEFAULT_TIMEZONE = 'Europe/Berlin';
export const DEFAULT_CURRENCY = 'EUR';

/**
 * Formats an amount into European currency format (€ 1.250,00)
 */
export function formatEuro(amount: number, locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date into European standard format (e.g. 14. Nov 2026, 14:30 Uhr)
 */
export function formatEuropeanDate(date: string | Date, locale = DEFAULT_LOCALE, timeZone = DEFAULT_TIMEZONE): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
