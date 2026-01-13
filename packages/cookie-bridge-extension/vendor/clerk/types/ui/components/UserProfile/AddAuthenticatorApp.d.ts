import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '../../customizables';
type AddAuthenticatorAppProps = FormProps & {
    title: LocalizationKey;
};
export declare const AddAuthenticatorApp: (props: AddAuthenticatorAppProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
