export type State<Data = any, Error = any> = {
    data: Data | null;
    error: Error | null;
    /**
     * if there's an ongoing request and no "loaded data"
     */
    isLoading: boolean;
    /**
     * if there's a request or revalidation loading
     */
    isValidating: boolean;
    cachedAt?: number;
};
/**
 * This utility should only be used in tests to clear previously fetched data
 */
export declare const clearFetchCache: () => void;
/**
 * An in-house simpler alternative to useSWR
 * @param fetcher If fetcher is undefined no action will be performed
 * @param params
 * @param options
 * @param resourceId
 */
export declare const useFetch: <K, T>(fetcher: ((...args: any) => Promise<T>) | undefined, params: K, options?: {
    throttleTime?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    staleTime?: number;
}, resourceId?: string) => {
    setCache: (state: State<T, any> | ((params: State<T, any>) => State<T, any>)) => void;
    invalidate: () => void;
    revalidate: () => void;
    data?: T | null | undefined;
    error?: any;
    isLoading?: boolean | undefined;
    isValidating?: boolean | undefined;
    cachedAt?: number;
};
