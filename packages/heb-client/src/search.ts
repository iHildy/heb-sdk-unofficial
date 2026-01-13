import { nextDataRequest, persistedQuery } from './api.js';
import type { HEBSession } from './types.js';

const DEFAULT_SEARCH_LIMIT = 20;
const CONTEXT_ONLINE = 'ONLINE';
const CONTEXT_CURBSIDE = 'CURBSIDE';

/**
 * Search options.
 */
export interface SearchOptions {
  limit?: number;
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

// Raw response types for Next.js search data
interface RawSearchResponse {
  pageProps?: {
    layout?: {
      visualComponents?: RawSearchComponent[];
    };
    searchTerm?: string;
  };
}

interface RawSearchComponent {
  __typename?: string;
  items?: RawSearchProduct[];
  total?: number;
  filters?: RawSearchFilter[];
  categoryFilters?: RawCategoryFilter[];
}

interface RawSearchFilter {
  id?: string;
  displayTitle?: string;
  options?: RawSearchFilterOption[];
}

interface RawSearchFilterOption {
  id?: string;
  displayTitle?: string;
  count?: number;
}

interface RawCategoryFilter {
  categoryId?: string;
  displayTitle?: string;
  count?: number;
}

interface RawSearchProduct {
  id?: string;
  displayName?: string;
  fullDisplayName?: string;
  brand?: string | { name?: string; isOwnBrand?: boolean };
  productImageUrls?: Array<{ url?: string; size?: string }>;
  carouselImageUrls?: string[];
  productPageURL?: string;
  inventory?: { inventoryState?: string };
  SKUs?: RawSearchSku[];
  shoppingContext?: string;
}

interface RawSearchSku {
  id?: string;
  contextPrices?: RawContextPrice[];
  productAvailability?: string[];
  customerFriendlySize?: string;
}

interface RawContextPrice {
  context?: string;
  isOnSale?: boolean;
  isPriceCut?: boolean;
  priceType?: string;
  listPrice?: RawDisplayPrice;
  salePrice?: RawDisplayPrice;
  unitListPrice?: RawDisplayPrice;
  unitSalePrice?: RawDisplayPrice;
}

interface RawDisplayPrice {
  unit?: string;
  formattedAmount?: string;
  amount?: number;
}

function selectSearchGrid(response: RawSearchResponse): RawSearchComponent | undefined {
  const components = response.pageProps?.layout?.visualComponents ?? [];
  return (
    components.find(c => c.__typename === 'SearchGridV2') ??
    components.find(c => Array.isArray(c.items))
  );
}

function getPreferredPriceContext(shoppingContext?: string): string {
  if (!shoppingContext) return CONTEXT_ONLINE;
  return shoppingContext.includes('CURBSIDE') ? CONTEXT_CURBSIDE : CONTEXT_ONLINE;
}

function selectContextPrice(prices: RawContextPrice[], shoppingContext?: string): RawContextPrice | undefined {
  if (!prices.length) return undefined;
  const preferred = getPreferredPriceContext(shoppingContext);
  return (
    prices.find(price => price.context === preferred) ??
    prices.find(price => price.context === CONTEXT_ONLINE) ??
    prices[0]
  );
}

function toPrice(display?: RawDisplayPrice): { amount: number; formatted: string } | undefined {
  if (!display) return undefined;
  return {
    amount: display.amount ?? 0,
    formatted: display.formattedAmount ?? '',
  };
}

function toUnitPrice(display?: RawDisplayPrice): { amount: number; unit: string; formatted: string } | undefined {
  if (!display) return undefined;
  return {
    amount: display.amount ?? 0,
    unit: display.unit ?? '',
    formatted: display.formattedAmount ?? '',
  };
}

function selectImageUrl(product: RawSearchProduct): string | undefined {
  const images = product.productImageUrls;
  if (Array.isArray(images) && images.length) {
    const preferred =
      images.find(img => img.size === 'LARGE') ??
      images.find(img => img.size === 'MEDIUM') ??
      images[0];
    return preferred?.url;
  }

  if (Array.isArray(product.carouselImageUrls) && product.carouselImageUrls.length) {
    return product.carouselImageUrls[0];
  }

  return undefined;
}

function extractSlug(productPageURL?: string): string | undefined {
  if (!productPageURL) return undefined;
  const match = productPageURL.match(/product-detail\/([^/]+)\/\d+$/);
  return match?.[1];
}

function mapSearchProduct(raw: RawSearchProduct): SearchProduct {
  const sku = raw.SKUs?.[0];
  const contextPrice = sku?.contextPrices
    ? selectContextPrice(sku.contextPrices, raw.shoppingContext)
    : undefined;

  const price = contextPrice?.salePrice ?? contextPrice?.listPrice;
  const unitPrice = contextPrice?.unitSalePrice ?? contextPrice?.unitListPrice;

  const brand = typeof raw.brand === 'string' ? raw.brand : raw.brand?.name;
  const inventoryState = raw.inventory?.inventoryState;

  return {
    productId: raw.id ?? '',
    name: raw.fullDisplayName ?? raw.displayName ?? '',
    brand,
    imageUrl: selectImageUrl(raw),
    price: toPrice(price),
    unitPrice: toUnitPrice(unitPrice),
    skuId: sku?.id,
    isAvailable: inventoryState ? inventoryState === 'IN_STOCK' : undefined,
    fulfillmentOptions: sku?.productAvailability,
    slug: extractSlug(raw.productPageURL),
  };
}

function mapFacets(component?: RawSearchComponent): SearchResult['facets'] {
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

/**
 * Search for products using Next.js data endpoint.
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
  const limit = Math.max(1, options.limit ?? DEFAULT_SEARCH_LIMIT);
  const path = `/en/search.json?q=${encodeURIComponent(query)}`;

  const response = await nextDataRequest<RawSearchResponse>(session, path);
  const grid = selectSearchGrid(response);
  const rawProducts = grid?.items ?? [];
  const products = rawProducts.slice(0, limit).map(mapSearchProduct);
  const totalCount = grid?.total ?? rawProducts.length;

  return {
    products,
    totalCount,
    page: 1,
    hasNextPage: totalCount > products.length,
    facets: mapFacets(grid),
  };
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
