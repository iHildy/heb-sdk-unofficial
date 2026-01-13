import type { UserAvatarCtx } from '../../types';
export declare const UserAvatarContext: import("react").Context<UserAvatarCtx | null>;
export declare const useUserAvatarContext: () => {
    componentName: "UserAvatar";
    appearance?: import("@clerk/types").UserAvatarTheme;
    rounded?: boolean;
};
