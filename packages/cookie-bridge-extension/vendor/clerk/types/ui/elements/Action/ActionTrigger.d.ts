import { type PropsWithChildren } from 'react';
type ActionTriggerProps = PropsWithChildren<{
    value: string;
    hideOnActive?: boolean;
}>;
export declare const ActionTrigger: (props: ActionTriggerProps) => import("react").DetailedReactHTMLElement<import("react").HTMLAttributes<HTMLElement>, HTMLElement> | null;
export {};
