import { persistedQuery } from './api.js';
import { resolveShoppingContext as resolveSessionContext } from './session.js';
import type { HEBSession } from './types.js';
import { 
  type MobileProduct, 
  type Product, 
  mapMobileProduct 
} from './product-mapper.js';

const DEFAULT_SEARCH_LIMIT = 20;

/**
 * Search options.
 */
export interface SearchOptions {
  limit?: number;
  storeId?: string | number;
  shoppingContext?: string;
  searchMode?: 'MAIN_SEARCH' | 'BIA_SEARCH';
  includeImages?: boolean;
}

/**
 * Search result structure.
 */
export interface SearchResult {
  products: Product[];
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

// ─────────────────────────────────────────────────────────────
// Mobile GraphQL search response types
// ─────────────────────────────────────────────────────────────

interface MobileSearchPage {
  layout?: {
    visualComponents?: MobileSearchComponent[];
  };
}

interface MobileSearchComponent {
  __typename?: string;
  items?: MobileProduct[];
  total?: number;
  nextCursor?: string;
  searchContextToken?: string;
  filters?: Array<{
    id?: string;
    displayTitle?: string;
    options?: Array<{ id?: string; displayTitle?: string; count?: number }>;
  }>;
  categoryFilters?: Array<{ categoryId?: string; displayTitle?: string; count?: number }>;
}

function resolveStoreId(session: HEBSession, options?: SearchOptions): number {
  const storeIdRaw = options?.storeId ?? session.cookies?.CURR_SESSION_STORE;
  if (!storeIdRaw) {
    throw new Error('No store selected. Set CURR_SESSION_STORE or pass search option storeId.');
  }
  const storeId = Number(storeIdRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeId: ${storeIdRaw}`);
  }
  return storeId;
}

function resolveShoppingContext(session: HEBSession, options?: SearchOptions): string {
  return options?.shoppingContext ?? resolveSessionContext(session);
}

function selectMobileSearchGrid(page?: MobileSearchPage): MobileSearchComponent | undefined {
  const components = page?.layout?.visualComponents ?? [];
  return (
    components.find(c => c.__typename === 'SearchGridV2') ??
    components.find(c => Array.isArray(c.items))
  );
}

function mapMobileFacets(component?: MobileSearchComponent): SearchResult['facets'] {
  if (!component) return undefined;
  const facets: NonNullable<SearchResult['facets']> = [];

  if (Array.isArray(component.filters)) {
    for (const filter of component.filters) {
      const values = (filter.options ?? []).map(option => ({
        value: option.id ?? option.displayTitle ?? '',
        count: option.count ?? 0,
      }));

      facets.push({
        key: filter.id ?? '',
        label: filter.displayTitle ?? '',
        values,
      });
    }
  }

  if (Array.isArray(component.categoryFilters) && component.categoryFilters.length) {
    facets.push({
      key: 'category',
      label: 'Category',
      values: component.categoryFilters.map(category => ({
        value: category.categoryId ?? category.displayTitle ?? '',
        count: category.count ?? 0,
      })),
    });
  }

  return facets.length ? facets : undefined;
}

async function searchProductsMobile(
  session: HEBSession,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const limit = Math.max(1, options.limit ?? DEFAULT_SEARCH_LIMIT);
  const storeId = resolveStoreId(session, options);
  const shoppingContext = resolveShoppingContext(session, options);

  const response = await persistedQuery<{ productSearchPageV2?: MobileSearchPage }>(
    session,
    'ProductSearchPageV2',
    {
      isAuthenticated: true,
      params: {
        doNotSuggestPhrase: false,
        pageSize: Math.max(50, limit),
        query,
        shoppingContext,
        storeId,
      },
      searchMode: options.searchMode ?? 'MAIN_SEARCH',
      searchPageLayout: 'MOBILE_SEARCH_PAGE_LAYOUT',
      shoppingContext,
      storeId,
      storeIdID: String(storeId),
      storeIdString: String(storeId),
    }
  );

  if (response.errors?.length) {
    throw new Error(`Search failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const grid = selectMobileSearchGrid(response.data?.productSearchPageV2);
  const rawProducts = grid?.items ?? [];
  /*
   * Filter out products that don't have a valid ID or name.
   */
  const validProducts = rawProducts
    .map(item => mapMobileProduct(item, shoppingContext, { includeImages: options.includeImages }))
    .filter(p => p.productId && p.name);

  const products = validProducts.slice(0, limit);
  const totalCount = grid?.total ?? rawProducts.length;

  return {
    products,
    totalCount,
    page: 1,
    hasNextPage: Boolean(grid?.nextCursor) || totalCount > products.length,
    facets: mapMobileFacets(grid),
  };
}

async function typeaheadMobile(session: HEBSession, query: string): Promise<TypeaheadResult> {
  const response = await persistedQuery<{ typeaheadContent?: { verticalStack?: Array<any> } }>(
    session,
    'TypeaheadContent',
    { searchMode: 'MAIN_SEARCH', term: query }
  );

  if (response.errors?.length) {
    throw new Error(`Typeahead failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const recentSearches: string[] = [];
  const trendingSearches: string[] = [];

  const stack = response.data?.typeaheadContent?.verticalStack ?? [];
  for (const item of stack) {
    if (Array.isArray(item?.recentSearchTerms)) {
      recentSearches.push(...item.recentSearchTerms);
    }
    if (Array.isArray(item?.trendingSearches)) {
      trendingSearches.push(...item.trendingSearches);
    }
  }

  return {
    recentSearches,
    trendingSearches,
    allTerms: [...recentSearches, ...trendingSearches],
  };
}

/**
 * Search for products using the mobile GraphQL API.
 * Requires a bearer session.
 *
 * @example
 * const results = await searchProducts(session, 'milk', { limit: 20 });
 * console.log(results.products);
 */
export async function searchProducts(
  session: HEBSession,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  if (session.authMode !== 'bearer') {
    throw new Error('Search requires a bearer session (mobile GraphQL).');
  }

  return searchProductsMobile(session, query, options);
}

/**
 * Get "Buy It Again" products (previously purchased items).
 * Requires a bearer session.
 *
 * @example
 * const results = await getBuyItAgain(session, { limit: 20 });
 * console.log(results.products);
 */
export async function getBuyItAgain(
  session: HEBSession,
  options: SearchOptions = {}
): Promise<SearchResult> {
  if (session.authMode !== 'bearer') {
    throw new Error('Buy It Again requires a bearer session (mobile GraphQL).');
  }

  return searchProductsMobile(session, '', { ...options, searchMode: 'BIA_SEARCH' });
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
  if (session.authMode === 'bearer') {
    return typeaheadMobile(session, query);
  }

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

// Raw response types for GraphQL typeahead
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
