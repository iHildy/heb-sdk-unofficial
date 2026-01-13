import type { UserResource } from '@clerk/shared/types';
type UseMultipleSessionsParam = {
    user: UserResource | null | undefined;
};
declare const useMultipleSessions: (params: UseMultipleSessionsParam) => {
    signedInSessions: import("@clerk/shared/index-D-PP9Wce").SignedInSessionResource[];
    otherSessions: import("@clerk/shared/index-D-PP9Wce").SignedInSessionResource[];
};
export { useMultipleSessions };
