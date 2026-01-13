import type { EmailAddressResource } from '@clerk/shared/types';
type VerifyWithEnterpriseConnectionProps = {
    email: EmailAddressResource;
    onReset: () => void;
    nextStep: () => void;
};
export declare const VerifyWithEnterpriseConnection: (props: VerifyWithEnterpriseConnectionProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
