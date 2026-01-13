import type { EmailAddressResource } from '@clerk/shared/types';
type VerifyWithLinkProps = {
    email: EmailAddressResource;
    onReset: () => void;
    nextStep: () => void;
};
export declare const VerifyWithLink: (props: VerifyWithLinkProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const VerificationSuccessPage: () => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
