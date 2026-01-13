import { useOrganization } from '@clerk/shared/react';
type ActiveMembersListProps = {
    memberships: ReturnType<typeof useOrganization>['memberships'];
    pageSize: number;
};
export declare const ActiveMembersList: ({ memberships, pageSize }: ActiveMembersListProps) => import("@emotion/react/jsx-runtime").JSX.Element | null;
export {};
