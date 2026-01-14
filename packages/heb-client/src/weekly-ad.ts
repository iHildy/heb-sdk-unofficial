import { persistedQuery } from './api.js';
import type { HEBSession } from './types.js';

export interface WeeklyAdOptions {
  storeCode?: string | number;
  category?: string | number;
  limit?: number;
  cursor?: string;
}

export interface WeeklyAdProduct {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  imageUrl?: string;
  priceText?: string;
  saleStory?: string;
  disclaimerText?: string;
  validFrom?: string;
  validTo?: string;
  categories?: string[];
  
  // New fields
  upc?: string;
  skuId?: string;
  storeLocation?: string;
}

export interface WeeklyAdCategory {
  id: string;
  name: string;
  count: number;
}

export interface WeeklyAdResult {
  products: WeeklyAdProduct[];
  totalCount: number;
  validFrom?: string;
  validTo?: string;
  storeCode: string;
  
  categories: WeeklyAdCategory[];
  cursor?: string;
}

// ─────────────────────────────────────────────────────────────
// GraphQL Types
// ─────────────────────────────────────────────────────────────

interface WeeklyAdPageResponse {
  weeklyAdProductCategoryPage?: { // For products
    total?: number;
    nextCursor?: string;
    validFrom?: string;
    validTo?: string;
    layout?: {
      visualComponents?: WeeklyAdComponent[];
    };
    categoryFilters?: Array<{
      id?: string;
      label?: string;
      productCount?: number;
    }>;
  };
  weeklyAdLandingPageInfo?: { // For initial categories
    categoryFilters?: Array<{
      id?: string;
      label?: string;
      productCount?: number;
    }>;
  };
}

interface WeeklyAdComponent {
  __typename?: string;
  // It seems weekly ad usually has a grid or list component
  items?: WeeklyAdItem[];
  // Sometimes categories are in a separate component
}

interface WeeklyAdItem {
  productId?: string;
  displayName?: string;
  brand?: { name?: string };
  image?: { url?: string };
  price?: {
    price?: number;
    priceString?: string;
    salePrice?: number;
    salePriceString?: string;
  };
  deal?: {
    mechanism?: string; // e.g. "Simple Savings"
    callout?: string;   // e.g. "Save $1.00"
    disclaimer?: string;
  };
  upc?: string;
  // Sku info might be nested
  skus?: Array<{
    id?: string;
    storeLocation?: { aisle?: string; side?: string };
  }>;
}

function resolveStoreId(session: HEBSession, options?: WeeklyAdOptions): number {
  const storeCodeRaw = options?.storeCode ?? session.cookies?.CURR_SESSION_STORE;
  if (!storeCodeRaw) {
    throw new Error('No store selected. Set CURR_SESSION_STORE or pass weekly ad option storeCode.');
  }
  const storeId = Number(storeCodeRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeCode: ${storeCodeRaw}`);
  }
  return storeId;
}

function resolveShoppingContext(session: HEBSession, options?: WeeklyAdOptions): string {
  return session.shoppingContext ?? session.cookies?.shoppingContext ?? 'CURBSIDE_PICKUP';
}

function normalizeLimit(limit?: number): number {
  if (limit === undefined) return 20;
  if (!Number.isFinite(limit) || limit < 0) {
    // Allow 0 for metadata-only fetch
    throw new Error(`Invalid limit: ${limit}`);
  }
  return Math.floor(limit);
}

function mapWeeklyAdProduct(item: WeeklyAdItem): WeeklyAdProduct {
  const priceText = item.price?.salePriceString ?? item.price?.priceString; // Prefer sale price
  
  return {
    id: item.productId ?? '',
    name: item.displayName ?? '',
    brand: item.brand?.name,
    imageUrl: item.image?.url,
    priceText: priceText,
    saleStory: item.deal?.callout,
    disclaimerText: item.deal?.disclaimer,
    upc: item.upc,
    skuId: item.skus?.[0]?.id,
    storeLocation: item.skus?.[0]?.storeLocation ? `Aisle ${item.skus[0].storeLocation.aisle}` : undefined,
  };
}

export async function getWeeklyAdProducts(
  session: HEBSession,
  options: WeeklyAdOptions = {}
): Promise<WeeklyAdResult> {
  const storeId = resolveStoreId(session, options);
  const limit = normalizeLimit(options.limit);
  const shoppingContext = resolveShoppingContext(session, options);
  
  // Build variables
  const categoryFilter = options.category ? [String(options.category)] : null;
  

  // If no specific category is requested, we might want to hit weeklyAdLandingPageInfo first to get categories
  // But weeklyAdProductCategoryPage also handles top level. 
  // Let's try to fetch both if we can, or prefer weeklyAdProductCategoryPage if we have a category.
  
  // Actually, checking the HAR:
  // - Landing page calls `weeklyAdLandingPageInfo` (vars: filters={}, storeId)
  // - Then `weeklyAdProductCategoryPage` (vars: filters={categories:null}, limit=50)

  // We'll use weeklyAdProductCategoryPage as primary, but if we need categories specifically and don't get them, we might fallback.
  // Wait, let's just use `weeklyAdProductCategoryPage` for products.
  

  const response = await persistedQuery<WeeklyAdPageResponse>(
      session,
      'weeklyAdProductCategoryPage',
      {
        filters: {
          categories: categoryFilter, // null for all/landing
        },
        isAuthenticated: true,
        limit: Math.max(1, limit),
        shoppingContext,
        storeId,
      }
  );

  console.log('DEBUG: weeklyAdProductCategoryPage response:', JSON.stringify(response, null, 2));

  // If we wanted categories explicitly (limit=0 often implies metadata fetch),
  // and we didn't get them from the product page (sometimes empty on search results?),
  // let's fetch landing page info.
  let landingPageData = response.data?.weeklyAdLandingPageInfo; // Won't exist on this query
  

  if (limit === 0 || !categoryFilter) {
     const landingResponse = await persistedQuery<WeeklyAdPageResponse>(
        session, 
        'weeklyAdLandingPageInfo',
        {
            filters: {},
            isAuthenticated: true,
            storeId
        }
     );
     console.log('DEBUG: weeklyAdLandingPageInfo response:', JSON.stringify(landingResponse, null, 2));

     if (landingResponse.data?.weeklyAdLandingPageInfo) {
         landingPageData = landingResponse.data.weeklyAdLandingPageInfo;
     }
  }

  if (response.errors?.length) {
    throw new Error(`Weekly ad fetch failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const data = response.data?.weeklyAdProductCategoryPage;
  
  // Extract products
  // Based on search.ts, we need to find the component that has items.
  // Weekly Ad structure might be slightly different.
  // Assuming 'layout.visualComponents' contains a grid.
  const components = data?.layout?.visualComponents ?? [];
  const gridComponent = components.find(c => Array.isArray(c.items) && c.items.length > 0) 
                        ?? components.find(c => c.__typename === 'ProductGrid'); // Guessing typename

  const rawItems = gridComponent?.items ?? [];
  
  let products = rawItems
    .map(mapWeeklyAdProduct)
    .filter(p => p.id && p.name);

  if (limit === 0) {
    products = [];
  } else {
    products = products.slice(0, limit);
  }

  // Extract categories
  // In search.ts it was categoryFilters. Here let's see.
  // The summary showed "categories" in filters. 
  // We hope the response includes available categories for the view.
  // If not in categoryFilters, maybe we can infer from facets if they exist.

  const categorySource = landingPageData?.categoryFilters ?? data?.categoryFilters ?? [];
  const categories: WeeklyAdCategory[] = categorySource.map(c => ({
    id: c.id ?? '',
    name: c.label ?? 'Unknown',
    count: c.productCount ?? 0,
  }));

  return {
    products,
    totalCount: data?.total ?? products.length,
    validFrom: data?.validFrom, // These might be null if not returned
    validTo: data?.validTo, 
    storeCode: String(storeId),
    categories,
    cursor: data?.nextCursor,
  };
}
