import type { CaptchaWidgetType } from '@clerk/shared/types';
import type { Clerk } from '../../core/resources/internal';
import type { CaptchaOptions } from './types';
export declare class CaptchaChallenge {
    private clerk;
    constructor(clerk: Clerk);
    /**
     * Triggers an invisible challenge.
     * This will always use the non-interactive variant of the CAPTCHA challenge and will
     * always use the fallback key.
     */
    invisible(opts?: Partial<CaptchaOptions>): Promise<{
        captchaAction: "signup" | "verify" | "heartbeat" | undefined;
        captchaToken: string;
        captchaWidgetType: CaptchaWidgetType;
    } | {
        captchaAction: "signup" | "verify" | "heartbeat" | undefined;
        captchaError: any;
    }>;
    /**
     * Triggers a smart challenge if the user is required to solve a CAPTCHA.
     * The type of the challenge depends on the dashboard configuration.
     * By default, smart (managed) captcha is preferred. If the customer has selected invisible, this method
     * will fall back to using the invisible captcha instead.
     *
     * Managed challenged start as non-interactive and escalate to interactive if necessary.
     */
    managedOrInvisible(opts?: Partial<CaptchaOptions>): Promise<{
        captchaError?: string;
        captchaAction?: string;
        captchaToken?: string;
        captchaWidgetType?: CaptchaWidgetType;
    } | undefined>;
    /**
     * Similar to managed() but will render the CAPTCHA challenge in a modal
     * managed by clerk-js itself.
     */
    managedInModal(opts?: Partial<CaptchaOptions>): Promise<{
        captchaError?: string;
        captchaAction?: string;
        captchaToken?: string;
        captchaWidgetType?: CaptchaWidgetType;
    } | undefined>;
}
