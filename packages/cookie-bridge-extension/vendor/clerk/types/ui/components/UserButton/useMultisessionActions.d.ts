import type { SignedInSessionResource, UserButtonProps, UserResource } from '@clerk/shared/types';
type UseMultisessionActionsParams = {
    user: UserResource | null | undefined;
    actionCompleteCallback?: () => void;
    navigateAfterSignOut?: () => any;
    navigateAfterMultiSessionSingleSignOut?: () => any;
    afterSwitchSessionUrl?: string;
    userProfileUrl?: string;
    signInUrl?: string;
    taskUrl?: string | null;
} & Pick<UserButtonProps, 'userProfileMode' | 'appearance' | 'userProfileProps'>;
export declare const useMultisessionActions: (opts: UseMultisessionActionsParams) => {
    handleSignOutSessionClicked: (session: SignedInSessionResource) => () => Promise<void>;
    handleManageAccountClicked: () => void | Promise<unknown>;
    handleUserProfileActionClicked: (__experimental_startPath?: string) => void | Promise<unknown>;
    handleSignOutAllClicked: () => Promise<void>;
    handleSessionClicked: (session: SignedInSessionResource) => () => Promise<void>;
    handleAddAccountClicked: () => Promise<unknown>;
    otherSessions: import("@clerk/shared/index-D-PP9Wce").SignedInSessionResource[];
    signedInSessions: import("@clerk/shared/index-D-PP9Wce").SignedInSessionResource[];
};
export {};
