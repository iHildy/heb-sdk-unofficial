import type { Clerk } from '@clerk/shared/types';
export declare function assertClerkSingletonExists(clerk: Clerk | undefined): asserts clerk is Clerk;
export declare function assertContextExists(contextVal: unknown, providerName: string): asserts contextVal;
export declare function getInitialValuesFromQueryParams(queryString: string, params: string[]): Record<string, string>;
export declare const populateParamFromObject: <T extends Record<any, any>>({ urlWithParam, entity }: {
    urlWithParam: string;
    entity: T;
}) => string;
