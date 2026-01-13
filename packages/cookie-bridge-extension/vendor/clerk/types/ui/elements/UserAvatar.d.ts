import type { UserResource } from '@clerk/shared/types';
import type { PropsOfComponent } from '../styledSystem';
import { Avatar } from './Avatar';
type UserAvatarProps = Omit<PropsOfComponent<typeof Avatar>, 'imageUrl'> & Partial<Pick<UserResource, 'firstName' | 'lastName' | 'imageUrl'>> & {
    name?: string | null;
    avatarUrl?: string | null;
};
export declare const UserAvatar: (props: UserAvatarProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
