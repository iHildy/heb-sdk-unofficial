/**
 * Valid shopping context values for HEB API.
 * These map to different browse/fulfillment modes in the app.
 * 
 * - CURBSIDE_PICKUP: Order online, pick up at store
 * - CURBSIDE_DELIVERY: Order online, home delivery
 * - EXPLORE_MY_STORE: In-store browsing mode
 */
export type ShoppingContext = 'CURBSIDE_PICKUP' | 'CURBSIDE_DELIVERY' | 'EXPLORE_MY_STORE';

/**
 * Fulfillment type for timeslot reservations.
 * This is a separate concept from ShoppingContext - used specifically
 * in reserveTimeslotV3 mutation.
 */
export type FulfillmentType = 'DELIVERY' | 'PICKUP';

/**
 * Maps ShoppingContext to the Categories API context parameter.
 */
export const SHOPPING_CONTEXT_TO_CATEGORIES: Record<ShoppingContext, string> = {
  EXPLORE_MY_STORE: 'instoreview',
  CURBSIDE_PICKUP: 'cspview',
  CURBSIDE_DELIVERY: 'csdview',
};

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
  /** Shopping context for browse/fulfillment mode */
  shoppingContext?: ShoppingContext;
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
  /** Auth mode for this session */
  authMode?: HEBAuthMode;
  /** OAuth tokens (bearer sessions only) */
  tokens?: HEBAuthTokens;
  /** Override endpoints (e.g., mobile GraphQL host) */
  endpoints?: Partial<HEBEndpoints>;
  /** Active shopping context (defaults to CURBSIDE_PICKUP if unset) */
  shoppingContext?: ShoppingContext;
  /** Optional refresh hook for bearer sessions */
  refresh?: () => Promise<void>;
  /** Enable detailed debug logging (default: false) */
  debug?: boolean;
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
  fulfillmentType: FulfillmentType;
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
  getShoppingListsV2: '954a24fe9f3cf6f904fdb602b412e355271dbc8b919303ae84c8328e555e99fa',
  getShoppingListV2: '085fcaef4f2f05ee16ea44c1489801e7ae7e7a95311cbf6d7a3f09135f0ea557',
} as const;

/**
 * Mobile app persisted query hashes observed via mitmproxy.
 * These target the mobile GraphQL host (api-edge.heb-ecom-api.hebdigital-prd.com).
 */
export const MOBILE_GRAPHQL_HASHES = {
  AddShoppingListItemsV2: '9a765bfdf1b8d86a47203db1dc30283b49a122ae44a60856962e915a68dd58d1',
  Categories: 'bb5e592b7ec6fffc7d1119e161e372b2bc3f734451c67cd31681e1f3c2150b15',
  CreateShoppingListV2: 'c9a2ad895fe213436c488a485e302f09885aeffde0874ea875b65dfdad364fc2',
  DiscoverDetail: '5d6b1718d1a46004bbeba75eefbe47ab7fbcff457cb05f9833bce13ef030af53',
  DiscoverLayout: '0a7739f1eb9948cc2441655debe193ea82518e9f2f58116349061494f2a450a5',
  GeneralAlerts: '5c00d628856fbf19957e95353e487532f9e9ad39cc2f3916ceb978b2288ee996',
  GetCommunicationPreferences: '93dbb05d7170de1aedef60c13d92e77a39d85528558f1347207f89d0abbebe09',
  GetShoppingListsV2: 'ef8f8b5e95ae7cffe88061a05ed04af72955fafd03cf62fc2561ed16469bb586',
  HistoricCashbackEstimate: 'e7946966558ba21fd4adf773bc798c98d79eb22870f03060ad93c20bc6f9e937',
  Me: '0bba145a4d719b3fdf7802a3a5486123de626508e1206cdd2edf8a1f23b9dd43',
  MyAddresses: '5bc59d0d204ff3275a5070ddf882e561b25c7fb6e0f2a68171b16c573b49e4b8',
  ProductDetailsPage: '33606eddd452a659bdca241515df51d516ac5ec2d3904a147701f804b3e39bc3',
  ProductSearchPageV2: 'a723225732e31edad1e7ab28f26177b57e7257c7f457b714d77951f56c85e63e',
  TypeaheadContent: '1023d49aab70d3b12c0fc578a61dccd8509f2936601f98f71afd4935bf73ea78',
  activeOrderCards: 'a19327298d78c7aae47ecef59778bd167b2938e7779851f532d132f7175e2a27',
  activeStatusCards: 'cc547e0525844273db36778f100966315b70aa51b0f0ea482b064d686143e383',
  addItemToCartV2: 'ba00328429c15935088d93be84cc41b4f0032c388e8ccd11cd3ee5b8e7d77e41',
  cartV2: 'd57a76ebe19efdb3a06323afa65eb176a1c92e478ab9916742fba3cb2cc9f075',
  couponSummary: 'd947c24ff085a4ef457b39baf8cba1d11d1b4ce920de89da00e1913bf7eecd83',
  defaultFulfillment: '0f3524c3b63fee83ae98dcd276b3c2eb6cfacaed93ff244cbb8aea64c75e2d3d',
  entryPoint: 'ae99ee7a646405d3037928df0d80179230901d28bc01dfd17b580c168b952980',
  getFrequentlyPurchasedProducts: '644fb3c508b4c5687aac2c63aa1a0fa14c7860a99de61187735c65f1a44ba460',
  getPaymentCards: '6aa8dc2ef29f185645ac72ee52d599333cf7f810e837a33552d29ade4a7cf786',
  listPickupTimeslotsV2: 'ad0fc3510d927e690693b64db501769e3fac7a572f34251d56f4f301f72f6b92',
  nextAvailableTimeslot: 'bb8426c74e096ed99da046bc79fb3df1b2d98d97455c2fe90bcfa1e1396e5e22',
  orderDetails: 'bd1ba9beb2e4af8a4099965d1b4ce455d28532e8b727d490f3a7df6486d5508f',
  orderHistory: '24c9d9f68669313a33d559f8a1c86360125af36533d28725b2e7c955ab5b5619',
  readyOrders: '34309a819913e2d4ef854adcce0b7056b0ed3c67770c9995b8a1772e09dda9cd',
  reserveTimeslotV3: '97163d9114d723db8dce5ea76d5bf297955de3b0cb46baef426428f10917d2a6',
  searchCouponsV2: '9167a6a0455d21aa581bd0d46326d797d3f65b2262569c1641a4db57943e87c4',
  sortOrderDimensions: '1345024de7e1af61e9b55d35c746fb6b42082cf1e0ce33df742c6da12d5d07e7',
  WhatsNew: 'cdd192bb9b472537384cca9d7de863a638311f6d06f010010b12827c8d85c5b8',
  weeklyAdProductCategoryPage: '1f827f085cdd170d56e510cf0dce475a82957b5c038efaf80534c1b65c6b2aee',
  weeklyAdLandingPageInfo: 'f4dc8f7f319415b33a16d00e9c8b1c3b3eb84d19c6ad48be96b29311e1a30ff2',
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
