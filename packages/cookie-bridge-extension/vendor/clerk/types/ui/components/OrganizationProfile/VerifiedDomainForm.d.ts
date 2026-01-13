import type { FormProps } from '@/ui/elements/FormContainer';
type VerifiedDomainFormProps = FormProps & {
    domainId: string;
    mode?: 'select' | 'edit';
};
export declare const VerifiedDomainForm: (props: VerifiedDomainFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
