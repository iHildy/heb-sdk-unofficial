import type { TokenResource } from '@clerk/shared/types';
/**
 * Identifies a cached token entry by tokenId and optional audience.
 */
interface TokenCacheKeyJSON {
    audience?: string;
    tokenId: string;
}
/**
 * Cache entry containing token metadata and resolver.
 * Extends TokenCacheKeyJSON with additional properties for expiration tracking and token retrieval.
 */
interface TokenCacheEntry extends TokenCacheKeyJSON {
    /**
     * Timestamp in seconds since UNIX epoch when the entry was created.
     * Used for expiration and cleanup scheduling.
     */
    createdAt?: Seconds;
    /**
     * Promise that resolves to the TokenResource.
     * May be pending and should be awaited before accessing token data.
     */
    tokenResolver: Promise<TokenResource>;
}
type Seconds = number;
export interface TokenCache {
    /**
     * Removes all cached entries and clears associated timeouts.
     * Side effects: Clears all scheduled expiration timers and empties the cache.
     */
    clear(): void;
    /**
     * Closes the BroadcastChannel connection and releases resources.
     * Side effects: Disconnects from multi-tab synchronization channel.
     */
    close(): void;
    /**
     * Retrieves a cached token entry if it exists and has not expired.
     *
     * @param cacheKeyJSON - Object containing tokenId and optional audience to identify the cached entry
     * @param leeway - Optional seconds before expiration to treat token as expired (default: 10s). Combined with 5s sync leeway.
     * @returns The cached TokenCacheEntry if found and valid, undefined otherwise
     */
    get(cacheKeyJSON: TokenCacheKeyJSON, leeway?: number): TokenCacheEntry | undefined;
    /**
     * Stores a token entry in the cache and broadcasts to other tabs when the token resolves.
     *
     * @param entry - TokenCacheEntry containing tokenId, tokenResolver, and optional audience
     * Side effects: Schedules automatic expiration cleanup, broadcasts to other tabs when token resolves
     */
    set(entry: TokenCacheEntry): void;
    /**
     * Returns the current number of cached entries.
     *
     * @returns The count of entries currently stored in the cache
     */
    size(): number;
}
/**
 * Converts between cache key objects and string representations.
 * Format: `prefix::tokenId::audience`
 */
export declare class TokenCacheKey {
    prefix: string;
    data: TokenCacheKeyJSON;
    /**
     * Parses a cache key string into a TokenCacheKey instance.
     */
    static fromKey(key: string): TokenCacheKey;
    constructor(prefix: string, data: TokenCacheKeyJSON);
    /**
     * Converts the key to its string representation for Map storage.
     */
    toKey(): string;
}
export declare const SessionTokenCache: TokenCache;
export {};
