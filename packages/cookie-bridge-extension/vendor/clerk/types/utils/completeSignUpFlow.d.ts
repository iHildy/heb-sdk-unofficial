import type { SignUpResource } from '@clerk/shared/types';
type CompleteSignUpFlowProps = {
    signUp: SignUpResource;
    verifyEmailPath?: string;
    verifyPhonePath?: string;
    continuePath?: string;
    navigate: (to: string, options?: {
        searchParams?: URLSearchParams;
    }) => Promise<unknown>;
    handleComplete?: () => Promise<void>;
    redirectUrl?: string;
    redirectUrlComplete?: string;
    oidcPrompt?: string;
};
export declare const completeSignUpFlow: ({ signUp, verifyEmailPath, verifyPhonePath, continuePath, navigate, handleComplete, redirectUrl, redirectUrlComplete, oidcPrompt, }: CompleteSignUpFlowProps) => Promise<unknown> | undefined;
export {};
