export declare const CLERK_BEFORE_UNLOAD_EVENT = "clerk:beforeunload";
/**
 * Additional protocols can be provided using the `allowedRedirectProtocols` Clerk option.
 */
export declare const ALLOWED_PROTOCOLS: string[];
/**
 * Helper utility to navigate via window.location.href. Also dispatches a clerk:beforeunload custom event.
 *
 * Note that this utility should **never** be called with a user-provided URL. We make no specific checks against the contents of the URL here and assume it is safe. Use `Clerk.navigate()` instead for user-provided URLs.
 */
export declare function windowNavigate(to: URL | string): void;
