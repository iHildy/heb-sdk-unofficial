/**
 * Core cookie values required for authenticated HEB requests.
 */
export interface HEBCookies {
  /** Session Authentication Token (JWT, HttpOnly) */
  sat: string;
  /** Imperva bot mitigation fingerprint */
  reese84: string;
  /** Imperva session tracking (may have suffix like _1234567) */
  incap_ses: string;
  /** Selected store ID for fulfillment context */
  CURR_SESSION_STORE?: string;
  /** Any additional cookies captured during auth */
  [key: string]: string | undefined;
}

/**
 * Required headers for HEB GraphQL API requests.
 */
export interface HEBHeaders {
  'apollographql-client-name': string;
  'apollographql-client-version': string;
  cookie: string;
  'content-type': string;
  [key: string]: string;
}

/**
 * Complete session object with cookies, headers, and metadata.
 */
export interface HEBSession {
  cookies: HEBCookies;
  headers: HEBHeaders;
  /** JWT expiration timestamp */
  expiresAt?: Date;
  /** Build ID extracted from site (for x-nextjs-data requests) */
  buildId?: string;
}

/**
 * Login credentials - can be passed directly or read from env.
 */
export interface HEBCredentials {
  email: string;
  password: string;
}

/**
 * Options for the login function.
 */
export interface LoginOptions {
  /** Run browser in headless mode (default: true) */
  headless?: boolean;
  /** Timeout for login flow in ms (default: 60000) */
  timeout?: number;
  /** Store ID to set after login */
  storeId?: string;
  /** 
   * Path to Chrome user data directory to reuse existing profile.
   * Helps bypass bot detection by using a trusted profile.
   * Example: '/Users/you/Library/Application Support/Google/Chrome'
   */
  userDataDir?: string;
}

/**
 * Known GraphQL operation hashes (persisted queries).
 */
export interface Address {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  nickname?: string;
}

/**
 * Variables for ReserveTimeslot mutation
 */
export interface ReserveTimeslotVariables {
  id: string; // The slot ID (e.g. from getDeliverySlots 'id' or 'timeslotId')
  date: string; // YYYY-MM-DD
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  pickupStoreId?: string; // e.g. "790", if pickup
  deliveryAddress?: Address;
  ignoreCartConflicts: boolean;
  storeId: number;
  userIsLoggedIn: boolean;
}

/**
 * Known GraphQL operation hashes (persisted queries).
 */
export const GRAPHQL_HASHES = {
  cartItemV2: 'ade8ec1365c185244d42f9cc4c13997fec4b633ac3c38ff39558df92b210c6d0',
  cartEstimated: '7b033abaf2caa80bc49541e51d2b89e3cc6a316e37c4bd576d9b5c498a51e9c5',
  typeaheadContent: '1ed956c0f10efcfc375321f33c40964bc236fff1397a4e86b7b53cb3b18ad329',
  ModifiableOrderDetailsRequest: '24fe4f6d8f4d3ae8927af0a7d07b8c57abcb303cdd277cd9bb4e022ca1d33b8e',
  ReserveTimeslot: '8b4800e25b070c15448237c7138530f1e1b3655ad3745a814cd5226c144da524',
  listDeliveryTimeslotsV2: '2085a738c42670ed52a42ab190b1f5ae178bb22ac444838e5d1c810cb6e4bf3c',
  listPickupTimeslotsV2: '7f9e10c23b1415ebf350493414b2e55e18c81c63f0571cf35f8dd155c9f3a9a0',
  StoreSearch: 'e01fa39e66c3a2c7881322bc48af6a5af97d49b1442d433f2d09d273de2db4b6',
  SelectPickupFulfillment: '8fa3c683ee37ad1bab9ce22b99bd34315b2a89cfc56208d63ba9efc0c49a6323',
} as const;

/**
 * HEB API endpoints.
 */
export const ENDPOINTS = {
  graphql: 'https://www.heb.com/graphql',
  login: 'https://www.heb.com/sign-in',
  home: 'https://www.heb.com/',
} as const;
