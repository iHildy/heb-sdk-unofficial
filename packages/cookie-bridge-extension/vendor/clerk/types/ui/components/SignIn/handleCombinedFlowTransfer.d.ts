import type { LoadedClerk, PhoneCodeChannel, SessionResource, SignUpModes, SignUpResource } from '@clerk/shared/types';
import type { RouteContextValue } from '../../router/RouteContext';
type HandleCombinedFlowTransferProps = {
    identifierAttribute: 'emailAddress' | 'phoneNumber' | 'username';
    identifierValue: string;
    signUpMode: SignUpModes;
    navigate: RouteContextValue['navigate'];
    organizationTicket?: string;
    afterSignUpUrl: string;
    clerk: LoadedClerk;
    handleError: (err: any) => void;
    redirectUrl?: string;
    redirectUrlComplete?: string;
    passwordEnabled: boolean;
    alternativePhoneCodeChannel?: PhoneCodeChannel | null;
    navigateOnSetActive: (opts: {
        session: SessionResource;
        redirectUrl: string;
    }) => Promise<unknown>;
};
/**
 * This function is used to handle transfering from a sign in to a sign up when SignIn is rendered as the combined flow.
 * There is special logic to handle transfer email-based sign ups directly to verification, bypassing the initial sign up form.
 */
export declare function handleCombinedFlowTransfer({ identifierAttribute, identifierValue, signUpMode, navigate, organizationTicket, afterSignUpUrl, clerk, handleError, redirectUrl, redirectUrlComplete, passwordEnabled, navigateOnSetActive, alternativePhoneCodeChannel, }: HandleCombinedFlowTransferProps): Promise<unknown> | void;
export declare function hasOptionalFields(signUp: SignUpResource, identifierAttribute: 'emailAddress' | 'phoneNumber' | 'username'): boolean;
export {};
