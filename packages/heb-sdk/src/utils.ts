/**
 * Utility functions for the HEB client.
 * 
 * @module utils
 */

/**
 * HEB operates in Central Time (Texas). All slot times should be displayed
 * in this timezone for consistency with HEB's in-store experience.
 */
export const HEB_TIMEZONE = 'America/Chicago';

/**
 * Format an ISO date string to a 12-hour time in HEB's timezone (e.g., "8:00pm").
 * 
 * @param isoString - ISO 8601 timestamp (e.g., "2026-01-15T02:00:00Z")
 * @returns Formatted time string in Central Time (e.g., "8:00pm")
 */
export function formatSlotTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    timeZone: HEB_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase().replace(' ', '');
}

/**
 * Format an ISO date string to a human-readable date in HEB's timezone.
 * 
 * @param isoString - ISO 8601 timestamp (e.g., "2026-01-15T02:00:00Z")
 * @returns Formatted date string (e.g., "Wednesday, Jan 14")
 */
export function formatSlotDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    timeZone: HEB_TIMEZONE,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format an ISO date string to a short date in HEB's timezone (e.g., "1/14/2026").
 * 
 * @param isoString - ISO 8601 timestamp
 * @returns Formatted short date string
 */
export function formatSlotDateShort(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    timeZone: HEB_TIMEZONE,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get the date portion (YYYY-MM-DD) from an ISO timestamp in HEB's timezone.
 * This is useful for grouping slots by local date rather than UTC date.
 * 
 * @param isoString - ISO 8601 timestamp
 * @returns Date string in YYYY-MM-DD format (in Central Time)
 */
export function getLocalDateString(isoString: string): string {
  const date = new Date(isoString);
  // Use Intl to get date parts in the correct timezone
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: HEB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Format an ISO date string to a 12-hour time (e.g., "3:40pm").
 * Uses HEB's timezone for consistent display.
 * 
 * @deprecated Use formatSlotTime instead for slot-related formatting
 */
export function formatExpiryTime(isoString: string): string {
  return formatSlotTime(isoString);
}

/**
 * Format a number as USD currency (e.g., "$26.44").
 * 
 * @param amount - Amount in dollars
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Clean HTML tags and entities from text.
 * Converts <br> to newlines, decodes common entities, and strips other tags.
 * 
 * @param text - Raw text with HTML tags and entities
 * @returns Cleaned text
 */
export function cleanHtml(text?: string): string | undefined {
  if (!text) return undefined;

  return text
    // Replace breaks with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace <b>/<strong> tags with markdown bold (just strip them for now to avoid confusion or use simple chars)
    // The request mentioned "Description: • Certified USDA Organic<br>• 1 Gallon..."
    // Converting <b> to nothing or simple text is safer than markdown if not rendered as such.
    // However, the AI report example output was plain text. Let's strip tags but keep structure.
    .replace(/<\/?(b|strong)(\s+[^>]*)?>/gi, '') 
    // Decode common entities
    .replace(/&bull;/g, '•')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&trade;/g, '™')
    .replace(/&reg;/g, '®')
    .replace(/&copy;/g, '©')
    .replace(/&amp;/g, '&')
    // Strip remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Collapse multiple newlines
    .replace(/\n\s*\n/g, '\n')
    // Trim whitespace
    .trim();
}
