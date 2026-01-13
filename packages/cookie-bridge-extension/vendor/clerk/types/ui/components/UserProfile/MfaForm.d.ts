import type { VerificationStrategy } from '@clerk/shared/types';
import type { FormProps } from '@/ui/elements/FormContainer';
type MfaFormProps = FormProps & {
    selectedStrategy?: VerificationStrategy;
};
export declare const MfaForm: (props: MfaFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
