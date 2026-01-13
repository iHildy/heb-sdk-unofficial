import { __experimental_useCheckout as useCheckout } from '@clerk/shared/react';
declare const Root: ({ children }: {
    children: React.ReactNode;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
declare const Stage: ({ children, name, }: {
    children: React.ReactNode;
    name: ReturnType<typeof useCheckout>["checkout"]["status"];
}) => import("react").ReactNode;
declare const FetchStatus: ({ children, status, }: {
    children: React.ReactNode;
    status: "idle" | "fetching" | "error" | "invalid_plan_change" | "missing_payer_email";
}) => import("react").ReactNode;
export { Root, Stage, FetchStatus };
