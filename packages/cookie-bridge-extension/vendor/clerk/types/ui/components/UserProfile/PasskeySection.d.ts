import type { PasskeyResource } from '@clerk/shared/types';
import type { FormProps } from '@/ui/elements/FormContainer';
type PasskeyScreenProps = {
    passkey: PasskeyResource;
};
type UpdatePasskeyFormProps = FormProps & PasskeyScreenProps;
export declare const UpdatePasskeyForm: (props: UpdatePasskeyFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const PasskeySection: () => import("@emotion/react/jsx-runtime").JSX.Element | null;
export {};
