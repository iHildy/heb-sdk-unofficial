import type { OrganizationResource } from '@clerk/shared/types';
import React from 'react';
export type UserMembershipListProps = {
    onPersonalWorkspaceClick: React.MouseEventHandler;
    onOrganizationClick: (org: OrganizationResource) => unknown;
};
export declare const UserMembershipList: (props: UserMembershipListProps) => import("@emotion/react/jsx-runtime").JSX.Element | null;
