import type { UserOrganizationInvitationResource } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import type { Button } from '../../customizables';
export declare const PreviewListItems: (props: PropsWithChildren) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const PreviewListItem: (props: PropsWithChildren<{
    organizationData: UserOrganizationInvitationResource["publicOrganizationData"];
}>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const PreviewListItemButton: (props: Parameters<typeof Button>[0]) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const OrganizationListPreviewButton: (props: PropsWithChildren<{
    onClick: () => void | Promise<void>;
}>) => import("@emotion/react/jsx-runtime").JSX.Element;
