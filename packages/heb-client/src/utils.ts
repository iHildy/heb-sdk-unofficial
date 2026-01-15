/**
 * Utility functions for the HEB client.
 * 
 * @module utils
 */

/**
 * Format an ISO date string to a 12-hour time (e.g., "3:40pm").
 * Handles timezones based on the input string.
 */
export function formatExpiryTime(isoString: string): string {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  const minuteStr = minutes.toString().padStart(2, '0');
  return `${hours}:${minuteStr}${ampm}`;
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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&trade;/g, '™')
    .replace(/&reg;/g, '®')
    .replace(/&copy;/g, '©')
    // Strip remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Collapse multiple newlines
    .replace(/\n\s*\n/g, '\n')
    // Trim whitespace
    .trim();
}
