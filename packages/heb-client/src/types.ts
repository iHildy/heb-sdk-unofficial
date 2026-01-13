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
  'content-type': string;
  'apollographql-client-name'?: string;
  'apollographql-client-version'?: string;
  cookie?: string;
  authorization?: string;
  [key: string]: string | undefined;
}

export interface HEBAuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  scope?: string;
  expiresIn?: number;
  expiresAt?: Date;
}

export type HEBAuthMode = 'cookie' | 'bearer';

export interface HEBEndpoints {
  graphql: string;
  home: string;
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
  /** Auth mode for this session */
  authMode?: HEBAuthMode;
  /** OAuth tokens (bearer sessions only) */
  tokens?: HEBAuthTokens;
  /** Override endpoints (e.g., mobile GraphQL host) */
  endpoints?: Partial<HEBEndpoints>;
  /** Optional refresh hook for bearer sessions */
  refresh?: () => Promise<void>;
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
 * Mobile app persisted query hashes observed via mitmproxy.
 * These target the mobile GraphQL host (api-edge.heb-ecom-api.hebdigital-prd.com).
 */
export const MOBILE_GRAPHQL_HASHES = {
  AddShoppingListItemsV2: '9a765bfdf1b8d86a47203db1dc30283b49a122ae44a60856962e915a68dd58d1',
  CreateShoppingListV2: 'c9a2ad895fe213436c488a485e302f09885aeffde0874ea875b65dfdad364fc2',
  GetCommunicationPreferences: '93dbb05d7170de1aedef60c13d92e77a39d85528558f1347207f89d0abbebe09',
  GetShoppingListsV2: 'ef8f8b5e95ae7cffe88061a05ed04af72955fafd03cf62fc2561ed16469bb586',
  HistoricCashbackEstimate: 'e7946966558ba21fd4adf773bc798c98d79eb22870f03060ad93c20bc6f9e937',
  ProductDetailsPage: '33606eddd452a659bdca241515df51d516ac5ec2d3904a147701f804b3e39bc3',
  ProductSearchPageV2: 'a723225732e31edad1e7ab28f26177b57e7257c7f457b714d77951f56c85e63e',
  TypeaheadContent: '1023d49aab70d3b12c0fc578a61dccd8509f2936601f98f71afd4935bf73ea78',
  activeOrderCards: 'a19327298d78c7aae47ecef59778bd167b2938e7779851f532d132f7175e2a27',
  addItemToCartV2: 'ba00328429c15935088d93be84cc41b4f0032c388e8ccd11cd3ee5b8e7d77e41',
  cartV2: 'd57a76ebe19efdb3a06323afa65eb176a1c92e478ab9916742fba3cb2cc9f075',
  defaultFulfillment: '0f3524c3b63fee83ae98dcd276b3c2eb6cfacaed93ff244cbb8aea64c75e2d3d',
  entryPoint: 'ae99ee7a646405d3037928df0d80179230901d28bc01dfd17b580c168b952980',
  getFrequentlyPurchasedProducts: '644fb3c508b4c5687aac2c63aa1a0fa14c7860a99de61187735c65f1a44ba460',
  getPaymentCards: '6aa8dc2ef29f185645ac72ee52d599333cf7f810e837a33552d29ade4a7cf786',
  listPickupTimeslotsV2: 'ad0fc3510d927e690693b64db501769e3fac7a572f34251d56f4f301f72f6b92',
  nextAvailableTimeslot: 'bb8426c74e096ed99da046bc79fb3df1b2d98d97455c2fe90bcfa1e1396e5e22',
  reserveTimeslotV3: '97163d9114d723db8dce5ea76d5bf297955de3b0cb46baef426428f10917d2a6',
} as const;

/**
 * HEB API endpoints.
 */
export const ENDPOINTS = {
  graphql: 'https://www.heb.com/graphql',
  graphqlMobile: 'https://api-edge.heb-ecom-api.hebdigital-prd.com/graphql',
  login: 'https://www.heb.com/sign-in',
  home: 'https://www.heb.com/',
} as const;
