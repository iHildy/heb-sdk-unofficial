import type { FormControlState } from '@/ui/utils/useFormControl';
import type { Fields } from './waitlistFormHelpers';
type WaitlistFormProps = {
    formState: Record<keyof Fields, FormControlState<any>>;
};
export declare const WaitlistForm: (props: WaitlistFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
