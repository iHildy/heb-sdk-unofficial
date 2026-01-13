type UseAPIKeysPaginationParams = {
    query: string;
    page: number;
    pageCount: number;
    isFetching: boolean;
    fetchPage: (page: number) => void;
};
/**
 * Hook that manages pagination logic for API keys:
 * - Resets to page 1 when query changes
 * - Adjusts page when current page exceeds available pages (e.g., after deletion)
 * - Provides cache invalidation function for mutations
 */
export declare const useAPIKeysPagination: ({ query, page, pageCount, isFetching, fetchPage }: UseAPIKeysPaginationParams) => void;
export {};
