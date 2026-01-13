import type { __internal_SubscriptionDetailsProps, Appearance } from '@clerk/shared/types';
export declare function MountedSubscriptionDetailDrawer({ appearance, subscriptionDetailsDrawer, onOpenChange, }: {
    appearance?: Appearance;
    onOpenChange: (open: boolean) => void;
    subscriptionDetailsDrawer: {
        open: false;
        props: null | __internal_SubscriptionDetailsProps;
    };
}): import("@emotion/react/jsx-runtime").JSX.Element | null;
