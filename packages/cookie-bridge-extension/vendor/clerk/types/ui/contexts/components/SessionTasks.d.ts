import type { SessionResource } from '@clerk/shared/types';
import type { SessionTasksCtx, TaskChooseOrganizationCtx, TaskResetPasswordCtx } from '../../types';
export declare const SessionTasksContext: import("react").Context<SessionTasksCtx | null>;
type SessionTasksContextType = SessionTasksCtx & {
    navigateOnSetActive: (opts: {
        session: SessionResource;
        redirectUrlComplete: string;
    }) => Promise<unknown>;
};
export declare const useSessionTasksContext: () => SessionTasksContextType;
export declare const TaskChooseOrganizationContext: import("react").Context<TaskChooseOrganizationCtx | null>;
export declare const useTaskChooseOrganizationContext: () => TaskChooseOrganizationCtx;
export declare const TaskResetPasswordContext: import("react").Context<TaskResetPasswordCtx | null>;
export declare const useTaskResetPasswordContext: () => TaskResetPasswordCtx;
export {};
