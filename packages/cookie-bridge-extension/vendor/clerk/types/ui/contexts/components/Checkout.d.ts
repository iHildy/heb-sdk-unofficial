import type { CheckoutCtx } from '../../types';
export declare const CheckoutContext: import("react").Context<CheckoutCtx | null>;
export declare const useCheckoutContext: () => {
    componentName: "Checkout";
    newSubscriptionRedirectUrl: string | undefined;
    appearance?: import("@clerk/types").CheckoutTheme;
    planId?: string;
    planPeriod?: import("@clerk/types").BillingSubscriptionPlanPeriod;
    for?: import("@clerk/types").ForPayerType;
    onSubscriptionComplete?: () => void;
    portalId?: string;
    portalRoot?: HTMLElement | null | undefined;
    onClose?: () => void;
};
