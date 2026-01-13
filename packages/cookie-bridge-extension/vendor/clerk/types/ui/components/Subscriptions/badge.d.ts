import type { BillingSubscriptionItemResource } from '@clerk/shared/types';
import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
export declare const SubscriptionBadge: <T extends {
    status: BillingSubscriptionItemResource["status"];
}>({ subscription, elementDescriptor, }: {
    subscription: T | {
        status: "free_trial";
    };
    elementDescriptor?: ElementDescriptor;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
