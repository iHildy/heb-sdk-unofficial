import type { CaptchaWidgetType } from '@clerk/shared/types';
import type { CaptchaOptions } from './types';
declare global {
    export interface Window {
        turnstile: Turnstile.Turnstile;
    }
}
export declare const shouldRetryTurnstileErrorCode: (errorCode: string) => boolean;
export declare const getTurnstileToken: (opts: CaptchaOptions) => Promise<{
    captchaToken: string;
    captchaWidgetType: CaptchaWidgetType;
}>;
