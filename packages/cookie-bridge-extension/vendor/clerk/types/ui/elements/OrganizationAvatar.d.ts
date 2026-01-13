import type { OrganizationResource } from '@clerk/shared/types';
import type { PropsOfComponent } from '../styledSystem';
import { Avatar } from './Avatar';
type OrganizationAvatarProps = PropsOfComponent<typeof Avatar> & Partial<Pick<OrganizationResource, 'name' | 'imageUrl'>>;
export declare const OrganizationAvatar: (props: OrganizationAvatarProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
