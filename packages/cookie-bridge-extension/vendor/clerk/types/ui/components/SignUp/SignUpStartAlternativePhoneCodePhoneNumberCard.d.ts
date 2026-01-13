import type { PhoneCodeChannelData } from '@clerk/shared/types';
import type { FormControlState } from '@/ui/utils/useFormControl';
import type { Fields } from './signUpFormHelpers';
type SignUpFormProps = {
    handleSubmit: React.FormEventHandler;
    fields: Fields;
    formState: Record<Exclude<keyof Fields, 'ticket'>, FormControlState<any>>;
    onUseAnotherMethod: () => void;
    phoneCodeProvider: PhoneCodeChannelData;
};
export declare const SignUpStartAlternativePhoneCodePhoneNumberCard: (props: SignUpFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
