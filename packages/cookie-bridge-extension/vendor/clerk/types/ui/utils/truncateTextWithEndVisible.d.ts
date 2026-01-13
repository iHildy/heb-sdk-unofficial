/**
 * Truncates a string to show the beginning and the last N characters,
 * with an ellipsis in the middle.
 *
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum total length of the truncated string (including ellipsis). Default is 20.
 * @param {number} endChars - Number of characters to preserve at the end. Default is 5.
 * @return {string} - Truncated string with ellipsis in the middle
 *
 * @example
 * truncateWithEndVisible('this is a very long string') // returns 'this is a ve...ring'
 * truncateWithEndVisible('test@email.com', 10) // returns 'te...e.com'
 */
export declare function truncateWithEndVisible(str: string, maxLength?: number, endChars?: number): string;
