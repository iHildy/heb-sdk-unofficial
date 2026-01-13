import type { ClerkPaginationParams } from '@clerk/shared/types';
export declare function convertPageToOffsetSearchParams<T>(pageParams: ClerkPaginationParams<T> | undefined): URLSearchParams;
