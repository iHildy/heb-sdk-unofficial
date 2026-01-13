import type { PhoneCodeChannelData } from '@clerk/shared/types';
import type { FormControlState } from '@/ui/utils/useFormControl';
type SignUpAlternativePhoneCodePhoneNumberCardProps = {
    handleSubmit: React.FormEventHandler;
    phoneNumberFormState: FormControlState<any>;
    onUseAnotherMethod: () => void;
    phoneCodeProvider: PhoneCodeChannelData;
};
export declare const SignInAlternativePhoneCodePhoneNumberCard: (props: SignUpAlternativePhoneCodePhoneNumberCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
