import { CaptchaChallenge } from '../../utils/captcha/CaptchaChallenge';
import type { Clerk } from '../resources/internal';
export declare class CaptchaHeartbeat {
    private clerk;
    private captchaChallenge;
    private timers;
    constructor(clerk: Clerk, captchaChallenge?: CaptchaChallenge, timers?: {
        setTimeout: (cb: () => void, ms: number) => number;
        setInterval: (cb: () => void, ms: number) => number;
        clearTimeout: (id: number) => void;
        clearInterval: (id: number) => void;
        cleanup: (..._args: any[]) => void;
    });
    start(): Promise<void>;
    private challengeAndSend;
    private isEnabled;
    private clientBypass;
    private intervalInMs;
}
