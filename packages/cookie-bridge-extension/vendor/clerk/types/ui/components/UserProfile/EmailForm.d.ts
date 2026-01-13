import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '../../localization';
type EmailFormProps = FormProps & {
    emailId?: string;
    title?: LocalizationKey;
    subtitle?: LocalizationKey;
    disableAutoFocus?: boolean;
};
export declare const EmailForm: (props: EmailFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
