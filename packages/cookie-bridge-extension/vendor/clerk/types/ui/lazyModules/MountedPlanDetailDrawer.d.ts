import type { __internal_PlanDetailsProps, Appearance } from '@clerk/shared/types';
export declare function MountedPlanDetailDrawer({ appearance, planDetailsDrawer, onOpenChange, }: {
    appearance?: Appearance;
    onOpenChange: (open: boolean) => void;
    planDetailsDrawer: {
        open: false;
        props: null | __internal_PlanDetailsProps;
    };
}): import("@emotion/react/jsx-runtime").JSX.Element | null;
