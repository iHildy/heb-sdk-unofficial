import type { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import type { LocalizationKey } from '../../localization';
type AddPaymentMethodProps = {
    onSuccess: (context: {
        gateway: 'stripe';
        paymentToken: string;
    }) => Promise<void>;
    checkout?: ReturnType<typeof useCheckout>['checkout'];
    cancelAction?: () => void;
};
declare const Root: (props: PropsWithChildren<AddPaymentMethodProps>) => import("@emotion/react/jsx-runtime").JSX.Element;
declare const FormHeader: ({ text }: {
    text: LocalizationKey;
}) => null;
declare const FormSubtitle: ({ text }: {
    text: LocalizationKey;
}) => null;
declare const FormButton: ({ text }: {
    text: LocalizationKey;
}) => null;
export { Root, FormHeader, FormSubtitle, FormButton };
