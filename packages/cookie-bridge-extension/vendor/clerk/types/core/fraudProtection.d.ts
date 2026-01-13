import type { Clerk } from './resources/internal';
export declare class FraudProtection {
    private client;
    private CaptchaChallengeImpl;
    private static instance;
    private inflightException;
    private captchaRetryCount;
    private readonly MAX_RETRY_ATTEMPTS;
    static getInstance(): FraudProtection;
    private constructor();
    execute<T extends () => Promise<any>, R = Awaited<ReturnType<T>>>(clerk: Clerk, cb: T): Promise<R>;
    managedChallenge(clerk: Clerk): Promise<{
        captchaError?: string;
        captchaAction?: string;
        captchaToken?: string;
        captchaWidgetType?: import("@clerk/types").CaptchaWidgetType;
    } | undefined>;
    private captchaAttemptsExceeded;
}
