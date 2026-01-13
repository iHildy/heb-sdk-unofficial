import type { __internal_CheckoutProps, Appearance } from '@clerk/shared/types';
export declare function MountedCheckoutDrawer({ appearance, checkoutDrawer, onOpenChange, }: {
    appearance?: Appearance;
    onOpenChange: (open: boolean) => void;
    checkoutDrawer: {
        open: false;
        props: null | __internal_CheckoutProps;
    };
}): import("@emotion/react/jsx-runtime").JSX.Element | null;
