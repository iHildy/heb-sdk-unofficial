import type { UserResource } from '@clerk/shared/types';
import type { AvatarUploaderProps } from '@/ui/elements/AvatarUploader';
export declare const UserProfileAvatarUploader: (props: Omit<AvatarUploaderProps, "avatarPreview" | "title"> & {
    user: Partial<UserResource>;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
