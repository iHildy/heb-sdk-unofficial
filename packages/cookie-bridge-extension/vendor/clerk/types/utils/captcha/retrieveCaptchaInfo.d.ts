import type { Clerk } from '../../core/clerk';
export declare const retrieveCaptchaInfo: (clerk: Clerk) => {
    captchaSiteKey: string | null;
    captchaWidgetType: import("@clerk/types").CaptchaWidgetType;
    captchaProvider: "turnstile";
    captchaPublicKeyInvisible: string | null;
    canUseCaptcha: boolean | null;
    nonce: string | undefined;
};
