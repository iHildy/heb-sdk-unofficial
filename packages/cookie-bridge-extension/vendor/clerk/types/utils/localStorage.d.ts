export declare const CLERK_ENVIRONMENT_STORAGE_ENTRY = "environment";
/**
 * Safe wrapper around localStorage that automatically prefixes keys with 'clerk_'
 * and handles potential errors and entry expiration
 */
export declare class SafeLocalStorage {
    private static _key;
    private static isExpired;
    static setItem(key: string, value: unknown, expiresInMs?: number): void;
    static getItem<T>(key: string, defaultValue: T): T;
    static removeItem(key: string): void;
}
