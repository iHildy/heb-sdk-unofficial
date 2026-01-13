import type { UserOrganizationInvitationResource } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import type { ElementDescriptor } from '@/ui/customizables/elementDescriptors';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { Button } from '../../customizables';
import type { ThemableCssProp } from '../../styledSystem';
type OrganizationPreviewListItemsProps = PropsWithChildren<{
    elementDescriptor: ElementDescriptor;
}>;
export declare const OrganizationPreviewListItems: ({ elementDescriptor, children }: OrganizationPreviewListItemsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const sharedMainIdentifierSx: ThemableCssProp;
type OrganizationPreviewListItemProps = PropsWithChildren<{
    elementId: React.ComponentProps<typeof OrganizationPreview>['elementId'];
    elementDescriptor: React.ComponentProps<typeof OrganizationPreview>['elementDescriptor'];
    organizationData: UserOrganizationInvitationResource['publicOrganizationData'];
}>;
export declare const OrganizationPreviewListItem: ({ children, elementId, elementDescriptor, organizationData, }: OrganizationPreviewListItemProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const OrganizationPreviewSpinner: import("react").ForwardRefExoticComponent<import("react").RefAttributes<HTMLDivElement>>;
export declare const OrganizationPreviewListItemButton: (props: Parameters<typeof Button>[0]) => import("@emotion/react/jsx-runtime").JSX.Element;
type OrganizationPreviewButtonProps = PropsWithChildren<{
    onClick: () => void | Promise<void>;
    elementDescriptor: ElementDescriptor;
}>;
export declare const OrganizationPreviewButton: (props: OrganizationPreviewButtonProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
