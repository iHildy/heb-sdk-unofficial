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
