import type { ActiveSessionResource, ClientJSON, ClientJSONSnapshot, ClientResource, LastAuthenticationStrategy, SignedInSessionResource, SignInResource, SignUpResource } from '@clerk/shared/types';
import { BaseResource, Session } from './internal';
export declare class Client extends BaseResource implements ClientResource {
    private static instance;
    pathRoot: string;
    sessions: Session[];
    signUp: SignUpResource;
    signIn: SignInResource;
    lastActiveSessionId: string | null;
    captchaBypass: boolean;
    cookieExpiresAt: Date | null;
    /** Last authentication strategy used by this client; `null` when unknown/disabled. */
    lastAuthenticationStrategy: LastAuthenticationStrategy | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    static getOrCreateInstance(data?: ClientJSON | ClientJSONSnapshot | null): Client;
    static clearInstance(): void;
    static isClientResource(resource: unknown): resource is Client;
    private constructor();
    get signUpAttempt(): SignUpResource;
    get signInAttempt(): SignInResource;
    /**
     * @deprecated Use `signedInSessions()` instead.
     */
    get activeSessions(): ActiveSessionResource[];
    get signedInSessions(): SignedInSessionResource[];
    create(): Promise<this>;
    fetch({ fetchMaxTries }?: {
        fetchMaxTries?: number;
    }): Promise<this>;
    destroy(): Promise<void>;
    removeSessions(): Promise<ClientResource>;
    clearCache(): void;
    isEligibleForTouch(): boolean;
    buildTouchUrl({ redirectUrl }: {
        redirectUrl: URL;
    }): string;
    __internal_sendCaptchaToken(params: unknown): Promise<ClientResource>;
    fromJSON(data: ClientJSON | ClientJSONSnapshot | null): this;
    __internal_toSnapshot(): ClientJSONSnapshot;
    protected path(): string;
}
