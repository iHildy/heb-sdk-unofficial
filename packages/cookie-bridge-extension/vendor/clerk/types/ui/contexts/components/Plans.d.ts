import type { Appearance, BillingPlanResource, BillingSubscriptionItemResource, BillingSubscriptionPlanPeriod } from '@clerk/shared/types';
import type { LocalizationKey } from '../../localization';
/**
 * Only remove decimal places if they are '00', to match previous behavior.
 */
export declare function normalizeFormatted(formatted: string): string;
export declare const usePaymentMethods: () => {
    data: import("@clerk/shared/index-D-PP9Wce").BillingPaymentMethodResource[];
    count: number;
    error: import("@clerk/shared/index-D-PP9Wce").ClerkAPIResponseError | null;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    page: number;
    pageCount: number;
    fetchPage: (size: number | ((_size: number) => number)) => void;
    fetchPrevious: () => void;
    fetchNext: () => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    revalidate: () => Promise<void>;
    setData: (data?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentMethodResource> | ((currentData?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentMethodResource> | undefined) => import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentMethodResource> | Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentMethodResource> | undefined> | undefined) | undefined) => Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentMethodResource> | undefined>;
};
export declare const usePaymentAttempts: () => {
    data: import("@clerk/shared/index-D-PP9Wce").BillingPaymentResource[];
    count: number;
    error: import("@clerk/shared/index-D-PP9Wce").ClerkAPIResponseError | null;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    page: number;
    pageCount: number;
    fetchPage: (size: number | ((_size: number) => number)) => void;
    fetchPrevious: () => void;
    fetchNext: () => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    revalidate: () => Promise<void>;
    setData: (data?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentResource> | ((currentData?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentResource> | undefined) => import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentResource> | Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentResource> | undefined> | undefined) | undefined) => Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPaymentResource> | undefined>;
};
export declare const useStatements: (externalParams?: {
    mode: "cache";
}) => {
    data: import("@clerk/shared/index-D-PP9Wce").BillingStatementResource[];
    count: number;
    error: import("@clerk/shared/index-D-PP9Wce").ClerkAPIResponseError | null;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    page: number;
    pageCount: number;
    fetchPage: (size: number | ((_size: number) => number)) => void;
    fetchPrevious: () => void;
    fetchNext: () => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    revalidate: () => Promise<void>;
    setData: (data?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingStatementResource> | ((currentData?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingStatementResource> | undefined) => import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingStatementResource> | Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingStatementResource> | undefined> | undefined) | undefined) => Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingStatementResource> | undefined>;
};
export declare const useSubscription: () => {
    subscriptionItems: import("@clerk/shared/index-D-PP9Wce").BillingSubscriptionItemResource[];
    data: import("@clerk/shared/index-D-PP9Wce").BillingSubscriptionResource | undefined | null;
    error: Error | undefined;
    isLoading: boolean;
    isFetching: boolean;
    revalidate: () => Promise<void> | void;
};
export declare const usePlans: (params?: {
    mode: "cache";
}) => {
    data: import("@clerk/shared/index-D-PP9Wce").BillingPlanResource[];
    count: number;
    error: import("@clerk/shared/index-D-PP9Wce").ClerkAPIResponseError | null;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    page: number;
    pageCount: number;
    fetchPage: (size: number | ((_size: number) => number)) => void;
    fetchPrevious: () => void;
    fetchNext: () => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    revalidate: () => Promise<void>;
    setData: (data?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPlanResource> | ((currentData?: import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPlanResource> | undefined) => import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPlanResource> | Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPlanResource> | undefined> | undefined) | undefined) => Promise<import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").BillingPlanResource> | undefined>;
};
type HandleSelectPlanProps = {
    plan: BillingPlanResource;
    planPeriod: BillingSubscriptionPlanPeriod;
    mode?: 'modal' | 'mounted';
    event?: React.MouseEvent<HTMLElement>;
    appearance?: Appearance;
    newSubscriptionRedirectUrl?: string;
};
export declare const usePlansContext: () => {
    activeOrUpcomingSubscription: (plan: BillingPlanResource) => import("@clerk/shared/index-D-PP9Wce").BillingSubscriptionItemResource | undefined;
    activeAndUpcomingSubscriptions: (plan: BillingPlanResource) => import("@clerk/shared/index-D-PP9Wce").BillingSubscriptionItemResource[];
    activeOrUpcomingSubscriptionBasedOnPlanPeriod: (plan: BillingPlanResource, planPeriod?: BillingSubscriptionPlanPeriod) => import("@clerk/shared/index-D-PP9Wce").BillingSubscriptionItemResource | undefined;
    isDefaultPlanImplicitlyActiveOrUpcoming: boolean;
    handleSelectPlan: ({ plan, planPeriod, mode, event, appearance, newSubscriptionRedirectUrl }: HandleSelectPlanProps) => void;
    openSubscriptionDetails: (event?: React.MouseEvent<HTMLElement>) => void;
    buttonPropsForPlan: ({ plan, subscription: sub, isCompact, selectedPlanPeriod, }: {
        plan?: BillingPlanResource;
        subscription?: BillingSubscriptionItemResource;
        isCompact?: boolean;
        selectedPlanPeriod?: BillingSubscriptionPlanPeriod;
    }) => {
        localizationKey: LocalizationKey;
        variant: "bordered" | "solid";
        colorScheme: "secondary" | "primary";
        isDisabled: boolean;
        disabled: boolean;
    };
    canManageSubscription: ({ plan, subscription: sub }: {
        plan?: BillingPlanResource;
        subscription?: BillingSubscriptionItemResource;
    }) => boolean;
    captionForSubscription: (subscription: BillingSubscriptionItemResource) => LocalizationKey | undefined;
    defaultFreePlan: import("@clerk/shared/index-D-PP9Wce").BillingPlanResource | undefined;
    revalidateAll: () => void;
};
export {};
