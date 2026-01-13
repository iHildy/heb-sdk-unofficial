import type { useOrganization } from '@clerk/shared/react';
import type { GetMembersParams } from '@clerk/shared/types';
type MembersSearchProps = {
    /**
     * Controlled query param state by parent component
     */
    query: GetMembersParams['query'];
    /**
     * Controlled input field value by parent component
     */
    value: string;
    /**
     * Paginated Organization memberships
     */
    memberships: ReturnType<typeof useOrganization>['memberships'];
    /**
     * Handler for change event on input field
     */
    onSearchChange: (value: string) => void;
    /**
     * Handler for `query` value changes
     */
    onQueryTrigger: (query: string) => void;
};
export declare const MembersSearch: ({ query, value, memberships, onSearchChange, onQueryTrigger }: MembersSearchProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
