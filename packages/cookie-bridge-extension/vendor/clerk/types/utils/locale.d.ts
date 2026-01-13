/**
 * Detects the user's preferred locale from the browser.
 * Falls back to null if locale cannot be determined.
 *
 * @returns The browser's reported locale string (typically BCP 47 format like 'en-US', 'es-ES') or null if locale cannot be determined.
 */
export declare function getBrowserLocale(): string | null;
