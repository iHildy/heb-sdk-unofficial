import type { SignUpResource } from '@clerk/shared/types';
declare global {
    export interface Window {
        tldts: {
            getDomain(hostname: string, { allowPrivateDomains }: {
                allowPrivateDomains: boolean;
            }): string;
        };
    }
}
declare const isDevOrStagingUrl: (url: string | URL) => boolean;
export { isDevOrStagingUrl };
export declare function isDevAccountPortalOrigin(hostname?: string): boolean;
export declare function getETLDPlusOneFromFrontendApi(frontendApi: string): string;
interface BuildURLParams extends Partial<URL> {
    base?: string;
    hashPath?: string;
    hashSearch?: string;
    hashSearchParams?: URLSearchParams | Record<string, string> | Array<URLSearchParams | Record<string, string>>;
}
interface BuildURLOptions<T> {
    skipOrigin?: boolean;
    stringify?: T;
}
/**
 *
 * buildURL(params: URLParams, options: BuildURLOptions): string
 *
 * Builds a URL safely by using the native URL() constructor. It can
 * also build a secondary path and search URL that lives inside the hash
 * of the main URL. For example:
 *
 * https://foo.com/bar?qux=42#/hash-bar?hash-qux=42
 *
 * References:
 * https://developer.mozilla.org/en-US/docs/Web/API/URL
 *
 * @param {BuildURLParams} params
 * @param {BuildURLOptions} options
 * @returns {URL | string} Returns the URL href
 */
export declare function buildURL<B extends boolean>(params: BuildURLParams, options?: BuildURLOptions<B>): B extends true ? string : URL;
export declare function toURL(url: string | URL): URL;
/**
 *
 * stripOrigin(url: URL | string): string
 *
 * Strips the origin part of a URL and preserves path, search and hash is applicable
 *
 * References:
 * https://developer.mozilla.org/en-US/docs/Web/API/URL
 *
 * @param {URL | string} url
 * @returns {string} Returns the URL href without the origin
 */
export declare function stripOrigin(url: URL | string): string;
/**
 * trimTrailingSlash(path: string): string
 *
 * Strips the trailing slashes from a string
 *
 * @returns {string} Returns the string without trailing slashes
 * @param path
 */
export declare const trimTrailingSlash: (path: string) => string;
/**
 * trimLeadingSlash(path: string): string
 *
 * Strips the leading slashes from a string
 *
 * @returns {string} Returns the string without leading slashes
 * @param path
 */
export declare const trimLeadingSlash: (path: string) => string;
export declare const hasExternalAccountSignUpError: (signUp: SignUpResource) => boolean;
export declare function getSearchParameterFromHash({ hash, paramName, }: {
    hash?: string;
    paramName: string;
}): string | null;
export declare function isValidUrl(val: unknown): val is string;
export declare function relativeToAbsoluteUrl(url: string, origin: string | URL): URL;
/**
 * Check for potentially problematic URLs that could have been crafted to intentionally bypass the origin check. Note that the URLs passed to this
 * function are assumed to be from an "allowed origin", so we are not executing origin-specific checks here.
 */
export declare function isProblematicUrl(url: URL): boolean;
export declare function isDataUri(val?: string): val is string;
/**
 * Checks if a URL uses javascript: protocol.
 * This prevents some XSS attacks through javascript: URLs.
 *
 * IMPORTANT: This does not check for `data:` or other protocols which
 * are dangerous if used for links or setting the window location.
 *
 * @param val - The URL to check
 * @returns True if the URL contains a banned protocol, false otherwise
 */
export declare function hasBannedProtocol(val: string | URL): boolean;
/**
 * Checks if a URL contains a banned protocol for href attributes in links.
 * This prevents some XSS attacks through javascript:, data:, vbscript:, and blob: URLs.
 *
 * @param val - The URL to check
 * @returns True if the URL contains a banned protocol, false otherwise
 */
export declare function hasBannedHrefProtocol(val: string | URL): boolean;
/**
 * Sanitizes an href value by checking for dangerous protocols.
 * Returns null if the href contains a dangerous protocol, otherwise returns the original href.
 * This prevents some XSS attacks through javascript:, data:, vbscript:, and blob: URLs.
 *
 * @param href - The href value to sanitize
 * @returns The sanitized href or null if dangerous
 */
export declare function sanitizeHref(href: string | undefined | null): string | null;
export declare const hasUrlInFragment: (_url: URL | string) => boolean;
/**
 * Creates a new URL by merging a fragment-based URL, if found.
 * The result URL has the original and the fragment pathnames appended
 * and also includes all search params from both places.
 *
 * @example
 * ```ts
 * mergeFragmentIntoUrl('https://accounts.clerk.com/sign-in?user_param=hello#/verify/factor-one?redirect_url=/protected')
 * // Returns: 'https://accounts.clerk.com/sign-in/verify/factor-one?user_param=hello&redirect_url=/protected'
 * ```
 */
export declare const mergeFragmentIntoUrl: (_url: string | URL) => URL;
export declare const pathFromFullPath: (fullPath: string) => string;
export declare function isRedirectForFAPIInitiatedFlow(frontendApi: string, redirectUrl: string): boolean;
export declare function requiresUserInput(redirectUrl: string): boolean;
export declare const isAllowedRedirect: (allowedRedirectOrigins: Array<string | RegExp> | undefined, currentOrigin: string) => (_url: URL | string) => boolean;
export declare function createAllowedRedirectOrigins(allowedRedirectOrigins: Array<string | RegExp> | undefined, frontendApi: string, instanceType?: string): (string | RegExp)[] | undefined;
