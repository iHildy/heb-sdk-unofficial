/**
 * Base error for all H-E-B API errors.
 */
export class HEBError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'HEBError';
  }
}

/**
 * Authentication-related errors.
 * Thrown when login fails, 2FA is required, or session is invalid.
 */
export class HEBAuthError extends HEBError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'HEBAuthError';
  }
}

/**
 * Session-related errors.
 * Thrown when session is expired, missing, or cookies are stale.
 */
export class HEBSessionError extends HEBError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'HEBSessionError';
  }
}

/**
 * Cart operation errors.
 * Thrown when add/update/remove cart operations fail.
 */
export class HEBCartError extends HEBError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'HEBCartError';
  }
}

/**
 * Product-related errors.
 * Thrown when product lookup fails or product is unavailable.
 */
export class HEBProductError extends HEBError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'HEBProductError';
  }
}

/**
 * Search-related errors.
 */
export class HEBSearchError extends HEBError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'HEBSearchError';
  }
}
