import type { CaptchaOptions } from './types';
export declare const getCaptchaToken: (opts: CaptchaOptions) => Promise<{
    captchaToken: string;
    captchaWidgetType: import("@clerk/types").CaptchaWidgetType;
}>;
