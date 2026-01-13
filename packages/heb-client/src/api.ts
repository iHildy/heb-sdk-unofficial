import type { HEBSession } from './types.js';
import { ENDPOINTS, GRAPHQL_HASHES } from './types.js';

/**
 * GraphQL request payload structure.
 */
export interface GraphQLPayload {
  operationName: string;
  variables: Record<string, unknown>;
  extensions?: {
    persistedQuery?: {
      version: number;
      sha256Hash: string;
    };
  };
}

/**
 * HEB API error structure.
 */
export interface HEBAPIError {
  message: string;
  extensions?: {
    code?: string;
    classification?: string;
  };
}

/**
 * GraphQL response wrapper.
 */
export interface GraphQLResponse<T> {
  data?: T;
  errors?: HEBAPIError[];
}

/**
 * Common HEB API error codes.
 */
export const ERROR_CODES = {
  INVALID_PRODUCT_STORE: 'INVALID_PRODUCT_STORE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
} as const;

/**
 * Execute a GraphQL request against the HEB API.
 */
export async function graphqlRequest<T>(
  session: HEBSession,
  payload: GraphQLPayload
): Promise<GraphQLResponse<T>> {
  const response = await fetch(ENDPOINTS.graphql, {
    method: 'POST',
    headers: session.headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HEB API request failed: ${response.status} ${response.statusText}\n${body}`);
  }

  return response.json() as Promise<GraphQLResponse<T>>;
}

/**
 * Execute a persisted GraphQL query.
 */
export async function persistedQuery<T>(
  session: HEBSession,
  operationName: keyof typeof GRAPHQL_HASHES,
  variables: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const hash = GRAPHQL_HASHES[operationName];
  if (!hash) {
    throw new Error(`Unknown operation: ${operationName}. Available: ${Object.keys(GRAPHQL_HASHES).join(', ')}`);
  }

  return graphqlRequest<T>(session, {
    operationName,
    variables,
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: hash,
      },
    },
  });
}

/**
 * Fetch data from Next.js data endpoint.
 */
export async function nextDataRequest<T>(
  session: HEBSession,
  path: string
): Promise<T> {
  if (!session.buildId) {
    throw new Error('Session buildId required for Next.js data requests. Re-fetch session or provide buildId.');
  }

  const url = `${ENDPOINTS.home}_next/data/${session.buildId}${path}`;
  
  const headers = {
    ...session.headers,
    'x-nextjs-data': '1',
  };

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Next.js data request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Check if response contains specific error code.
 */
export function hasErrorCode(
  response: GraphQLResponse<unknown>,
  code: string
): boolean {
  return response.errors?.some(e => e.extensions?.code === code) ?? false;
}

/**
 * Extract error messages from response.
 */
export function getErrorMessages(response: GraphQLResponse<unknown>): string[] {
  return response.errors?.map(e => e.message) ?? [];
}
