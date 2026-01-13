import type { createClerkEventBus } from '@clerk/shared/clerkEventBus';
import type { Clerk, InstanceType } from '@clerk/shared/types';
import type { FapiClient } from '../fapiClient';
/**
 * The AuthCookieService class is a service responsible to handle
 * all operations and helpers required in a standard browser context
 * based on the cookies to remove the dependency between cookies
 * and auth from the Clerk instance.
 * This service is responsible to:
 *   - refresh the session cookie using a poller
 *   - refresh the session cookie on tab visibility change
 *   - update the related cookies listening to the `token:update` event
 *   - initialize auth related cookies for development instances (eg __client_uat, __clerk_db_jwt)
 *   - cookie setup for production / development instances
 * It also provides the following helpers:
 *   - isSignedOut(): check if the current user is signed-out using cookies
 *   - decorateUrlWithDevBrowserToken(): decorates url with auth related info (eg dev browser jwt)
 *   - handleUnauthenticatedDevBrowser(): resets dev browser in case of invalid dev browser
 */
export declare class AuthCookieService {
    private clerk;
    private instanceType;
    private clerkEventBus;
    private poller;
    private clientUat;
    private sessionCookie;
    private activeCookie;
    private devBrowser;
    static create(clerk: Clerk, fapiClient: FapiClient, instanceType: InstanceType, clerkEventBus: ReturnType<typeof createClerkEventBus>): Promise<AuthCookieService>;
    private constructor();
    setup(): Promise<void>;
    isSignedOut(): boolean;
    handleUnauthenticatedDevBrowser(): Promise<void>;
    decorateUrlWithDevBrowserToken(url: URL): URL;
    private setupDevelopment;
    private setupProduction;
    startPollingForToken(): void;
    stopPollingForToken(): void;
    private refreshTokenOnFocus;
    private refreshSessionToken;
    private updateSessionCookie;
    setClientUatCookieForDevelopmentInstances(): void;
    private inCustomDevelopmentDomain;
    private handleGetTokenError;
    private handleSignOut;
    /**
     * The below methods handle active context tracking (session and organization) to ensure
     * only tabs with matching context can update the session cookie.
     * The format of the cookie value is "<session id>:<org id>" where either part can be empty.
     */
    setActiveContextInStorage(): void;
    private isCurrentContextActive;
    getSessionCookie(): string | undefined;
}
