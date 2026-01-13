/**
 * @internal
 */
export declare const useOrganizationListInView: () => {
    userMemberships: {
        data: undefined;
        count: undefined;
        error: undefined;
        isLoading: false;
        isFetching: false;
        isError: false;
        page: undefined;
        pageCount: undefined;
        fetchPage: undefined;
        fetchPrevious: undefined;
        fetchNext: undefined;
        hasNextPage: false;
        hasPreviousPage: false;
        revalidate: undefined;
        setData: undefined;
    } | {
        data: import("@clerk/shared/index-D-PP9Wce").OrganizationMembershipResource[];
        count: number;
        error: import("@clerk/shared/index-D-PP9Wce").ClerkAPIResponseError | null;
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
        page: number;
        pageCount: number;
        fetchPage: (size: number | ((_size: number) => number)) => void;
        fetchPrevious: () => void;
        fetchNext: () => void;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        revalidate: () => Promise<void>;
        setData: (data?: (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationMembershipResource> | undefined)[] | ((currentData?: (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationMembershipResource> | undefined)[] | undefined) => (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationMembershipResource> | undefined)[] | Promise<(import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationMembershipResource> | undefined)[] | undefined> | undefined) | undefined) => Promise<(import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationMembershipResource> | undefined)[] | undefined>;
    };
    userInvitations: {
        data: undefined;
        count: undefined;
        error: undefined;
        isLoading: false;
        isFetching: false;
        isError: false;
        page: undefined;
        pageCount: undefined;
        fetchPage: undefined;
        fetchPrevious: undefined;
        fetchNext: undefined;
        hasNextPage: false;
        hasPreviousPage: false;
        revalidate: undefined;
        setData: undefined;
    } | {
        data: import("@clerk/shared/index-D-PP9Wce").UserOrganizationInvitationResource[];
        count: number;
        error: import("@clerk/shared/index-D-PP9Wce").ClerkAPIResponseError | null;
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
        page: number;
        pageCount: number;
        fetchPage: (size: number | ((_size: number) => number)) => void;
        fetchPrevious: () => void;
        fetchNext: () => void;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        revalidate: () => Promise<void>;
        setData: (data?: (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").UserOrganizationInvitationResource> | undefined)[] | ((currentData?: (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").UserOrganizationInvitationResource> | undefined)[] | undefined) => (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").UserOrganizationInvitationResource> | undefined)[] | Promise<(import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").UserOrganizationInvitationResource> | undefined)[] | undefined> | undefined) | undefined) => Promise<(import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").UserOrganizationInvitationResource> | undefined)[] | undefined>;
    };
    userSuggestions: {
        data: undefined;
        count: undefined;
        error: undefined;
        isLoading: false;
        isFetching: false;
        isError: false;
        page: undefined;
        pageCount: undefined;
        fetchPage: undefined;
        fetchPrevious: undefined;
        fetchNext: undefined;
        hasNextPage: false;
        hasPreviousPage: false;
        revalidate: undefined;
        setData: undefined;
    } | {
        data: import("@clerk/shared/index-D-PP9Wce").OrganizationSuggestionResource[];
        count: number;
        error: import("@clerk/shared/index-D-PP9Wce").ClerkAPIResponseError | null;
        isLoading: boolean;
        isFetching: boolean;
        isError: boolean;
        page: number;
        pageCount: number;
        fetchPage: (size: number | ((_size: number) => number)) => void;
        fetchPrevious: () => void;
        fetchNext: () => void;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        revalidate: () => Promise<void>;
        setData: (data?: (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationSuggestionResource> | undefined)[] | ((currentData?: (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationSuggestionResource> | undefined)[] | undefined) => (import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationSuggestionResource> | undefined)[] | Promise<(import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationSuggestionResource> | undefined)[] | undefined> | undefined) | undefined) => Promise<(import("@clerk/shared/index-D-PP9Wce").ClerkPaginatedResponse<import("@clerk/shared/index-D-PP9Wce").OrganizationSuggestionResource> | undefined)[] | undefined>;
    };
    ref: (element: HTMLElement | null) => void;
};
