import type { FormProps } from '@/ui/elements/FormContainer';
type VerifyDomainFormProps = FormProps & {
    domainId: string;
    skipToVerified: boolean;
};
export declare const VerifyDomainForm: (props: VerifyDomainFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
