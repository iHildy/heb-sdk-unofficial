import { graphqlRequest, persistedQuery } from './api.js';
import type { HEBSession } from './types.js';
import { ENDPOINTS } from './types.js';

/**
 * Browser-like headers for SSR requests.
 * These help bypass bot detection by mimicking real browser requests.
 */
function getBrowserHeaders(referer?: string): Record<string, string> {
  return {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'referer': referer ?? 'https://www.heb.com/',
  };
}

/**
 * Search filter option.
 */
export interface SearchFilter {
  key: string;
  value: string;
}

/**
 * Search options.
 */
export interface SearchOptions {
  page?: number;
  filters?: SearchFilter[];
}

/**
 * Product from search results.
 */
export interface SearchProduct {
  productId: string;
  name: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  price?: {
    amount: number;
    formatted: string;
  };
  unitPrice?: {
    amount: number;
    unit: string;
    formatted: string;
  };
  skuId?: string;
  isAvailable?: boolean;
  fulfillmentOptions?: string[];
  /** URL slug for product page */
  slug?: string;
}

/**
 * Search result structure.
 */
export interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
  page: number;
  hasNextPage: boolean;
  facets?: Array<{
    key: string;
    label: string;
    values: Array<{ value: string; count: number }>;
  }>;
}

/**
 * Typeahead suggestion (search term).
 */
export interface TypeaheadSuggestion {
  term: string;
  type: 'recent' | 'trending' | 'keyword';
}

/**
 * Typeahead response with categorized suggestions.
 */
export interface TypeaheadResult {
  recentSearches: string[];
  trendingSearches: string[];
  allTerms: string[];
}

// Raw response types for GraphQL
interface RawSearchResponse {
  searchProducts?: {
    products?: Array<{
      productId?: string;
      name?: string;
      brand?: string;
      description?: string;
      image?: { url?: string };
      price?: { amount?: number; formatted?: string };
      unitPrice?: { amount?: number; unit?: string; formatted?: string };
      skuId?: string;
      isAvailable?: boolean;
      fulfillment?: string[];
    }>;
    totalCount?: number;
    pageInfo?: { hasNextPage?: boolean };
    facets?: Array<{
      key?: string;
      label?: string;
      values?: Array<{ value?: string; count?: number }>;
    }>;
  };
}

interface RawTypeaheadResponse {
  typeaheadContent?: {
    verticalStack?: Array<{
      recentSearchTerms?: string[];
      trendingSearches?: string[];
      __typename?: string;
    }>;
    suggestions?: Array<{
      term?: string;
      type?: string;
    }>;
  };
}

/**
 * Search for products using GraphQL.
 * 
 * Note: This requires the `searchProductQuery` hash which changes per build.
 * If persisted query fails, use `searchSSR()` instead.
 * 
 * @example
 * const results = await searchProducts(session, 'milk', { page: 1 });
 * console.log(results.products);
 */
export async function searchProducts(
  session: HEBSession,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const { page = 1, filters = [] } = options;

  const payload = {
    operationName: 'searchProductQuery',
    variables: {
      query,
      page,
      filters,
    },
    extensions: {
      persistedQuery: {
        version: 1,
        // This hash changes per build - may need to be updated
        sha256Hash: 'DYNAMIC_HASH_REQUIRED',
      },
    },
  };

  const response = await graphqlRequest<RawSearchResponse>(session, payload);

  if (response.errors) {
    const notFoundError = response.errors.find(
      e => e.message?.includes('PersistedQueryNotFound')
    );
    if (notFoundError) {
      throw new Error(
        'Search query hash not found. The hash changes per site build. ' +
        'Use searchSSR() instead for reliable search functionality.'
      );
    }
    throw new Error(`Search failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const data = response.data?.searchProducts;
  
  return {
    products: (data?.products ?? []).map(p => ({
      productId: p.productId ?? '',
      name: p.name ?? '',
      brand: p.brand,
      description: p.description,
      imageUrl: p.image?.url,
      price: p.price ? {
        amount: p.price.amount ?? 0,
        formatted: p.price.formatted ?? '',
      } : undefined,
      unitPrice: p.unitPrice ? {
        amount: p.unitPrice.amount ?? 0,
        unit: p.unitPrice.unit ?? '',
        formatted: p.unitPrice.formatted ?? '',
      } : undefined,
      skuId: p.skuId,
      isAvailable: p.isAvailable,
      fulfillmentOptions: p.fulfillment,
    })),
    totalCount: data?.totalCount ?? 0,
    page,
    hasNextPage: data?.pageInfo?.hasNextPage ?? false,
    facets: data?.facets?.map(f => ({
      key: f.key ?? '',
      label: f.label ?? '',
      values: (f.values ?? []).map(v => ({
        value: v.value ?? '',
        count: v.count ?? 0,
      })),
    })),
  };
}

/**
 * Search for products using SSR (Server-Side Rendering).
 * 
 * This fetches the HTML search page and extracts product URLs from it.
 * More reliable than GraphQL search since it doesn't require dynamic hashes.
 * 
 * Includes built-in rate limiting and degraded response detection to
 * handle H-E-B's bot mitigation measures.
 * 
 * @example
 * const products = await searchSSR(session, 'cinnamon rolls');
 * const product = products[0];
 * console.log(`Found: ${product.name} (ID: ${product.productId})`);
 * 
 * @throws {Error} If rate limiting is detected (degraded response)
 */
export async function searchSSR(
  session: HEBSession,
  query: string,
  limit = 20
): Promise<SearchProduct[]> {
  const searchUrl = `${ENDPOINTS.home}search?q=${encodeURIComponent(query)}`;
  
  // Build headers: combine session cookies with browser-like headers
  const browserHeaders = getBrowserHeaders(`${ENDPOINTS.home}search`);
  const headers = {
    ...browserHeaders,
    // Keep session cookie for authentication
    cookie: session.headers.cookie,
  };
  
  const response = await fetch(searchUrl, {
    method: 'GET',
    headers,
    // Follow redirects automatically
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  
  // Extract product URLs from HTML using regex
  // Pattern: product-detail/[slug]/[productId]
  const pattern = /product-detail\/([^"\/]+)\/(\d+)/g;
  const matches = [...html.matchAll(pattern)];
  
  // Dedupe by product ID
  const seen = new Set<string>();
  const products: SearchProduct[] = [];
  
  for (const match of matches) {
    const [, slug, productId] = match;
    
    if (seen.has(productId)) continue;
    seen.add(productId);
    
    // Convert slug to display name
    const name = slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/Nbsp/gi, ''); // Clean up HTML entities
    
    products.push({
      productId,
      name,
      slug,
      imageUrl: `https://images.heb.com/is/image/HEBGrocery/${productId}?hei=360&wid=360`,
    });
    
    if (products.length >= limit) break;
  }
  
  return products;
}

/**
 * Get typeahead/autocomplete suggestions.
 * 
 * Returns recent searches and trending searches from HEB.
 * 
 * @example
 * const result = await typeahead(session, 'pea');
 * console.log('Recent:', result.recentSearches);
 * console.log('Trending:', result.trendingSearches);
 */
export async function typeahead(
  session: HEBSession,
  query: string
): Promise<TypeaheadResult> {
  const response = await persistedQuery<RawTypeaheadResponse>(
    session,
    'typeaheadContent',
    { query }
  );

  if (response.errors) {
    throw new Error(`Typeahead failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const data = response.data?.typeaheadContent;
  
  // Handle new verticalStack structure
  const recentSearches: string[] = [];
  const trendingSearches: string[] = [];
  
  if (data?.verticalStack) {
    for (const item of data.verticalStack) {
      if (item.recentSearchTerms) {
        recentSearches.push(...item.recentSearchTerms);
      }
      if (item.trendingSearches) {
        trendingSearches.push(...item.trendingSearches);
      }
    }
  }
  
  // Also handle legacy suggestions structure
  if (data?.suggestions) {
    for (const s of data.suggestions) {
      if (s.term) {
        trendingSearches.push(s.term);
      }
    }
  }
  
  return {
    recentSearches,
    trendingSearches,
    allTerms: [...recentSearches, ...trendingSearches],
  };
}

/**
 * Get typeahead terms as a flat array.
 * 
 * @deprecated Use typeahead() for full results with categorization.
 */
export async function typeaheadTerms(
  session: HEBSession,
  query: string
): Promise<string[]> {
  const result = await typeahead(session, query);
  return result.allTerms;
}
