import { persistedQuery } from './api.js';
import { resolveShoppingContext } from './session.js';
import type { HEBSession, ShoppingContext } from './types.js';

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



interface WeeklyAdData {
  productSearch?: {
    products?: WeeklyAdItem[];
    info?: {
      total?: number;
      filterCounts?: {
        categories?: Array<{
          filter?: string; 
          displayName?: string;
          count?: number;
        }>;
      };
    };
    cursorList?: string[];
    productPage?: {
      products?: WeeklyAdItem[];
      cursorList?: string[];
    };
  };
  productPage?: {
    products?: WeeklyAdItem[];
    cursorList?: string[];
  };
  info?: {
    daysRemaining?: number;
  };
}

interface WeeklyAdPageResponse {
  weeklyAd?: WeeklyAdData;
  weeklyAdProductCategoryPage?: WeeklyAdData;
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
  carouselImageUrls?: string[];
  image?: { url?: string };
  productLocation?: { location?: string };
  
  // Price is inside skus -> contextPrices
  skus?: Array<{
    id?: string;
    storeLocation?: { location?: string };
    twelveDigitUPC?: string;
    contextPrices?: Array<{
      context?: string;
      priceType?: string;
      salePrice?: { formattedAmount?: string };
      listPrice?: { formattedAmount?: string };
      isOnSale?: boolean;
    }>;
  }>;
  
  // Also support old/other structure if needed
  price?: {
    priceString?: string;
    salePriceString?: string;
  };
  deal?: {
    callout?: string;
    disclaimer?: string;
  };
  twelveDigitUPC?: string;
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

function normalizeLimit(limit?: number): number {
  if (limit === undefined) return 20;
  if (!Number.isFinite(limit) || limit < 0) {
    // Allow 0 for metadata-only fetch
    throw new Error(`Invalid limit: ${limit}`);
  }
  return Math.floor(limit);
}


function mapWeeklyAdProduct(item: WeeklyAdItem): WeeklyAdProduct {
  // Extract price from first SKU's first context price if available
  const sku = item.skus?.[0];
  const priceObj = sku?.contextPrices?.find(cp => cp.context === 'CURBSIDE' || cp.context === 'IN_STORE') 
                  ?? sku?.contextPrices?.[0];
  
  const priceText = priceObj?.salePrice?.formattedAmount 
                   ?? priceObj?.listPrice?.formattedAmount 
                   ?? item.price?.salePriceString 
                   ?? item.price?.priceString;

  const saleStory = priceObj?.isOnSale ? 'On Sale' : item.deal?.callout;

  return {
    id: item.productId ?? '',
    name: item.displayName ?? '',
    brand: item.brand?.name,
    imageUrl: item.carouselImageUrls?.[0] ?? item.image?.url,
    priceText: priceText,
    saleStory: saleStory,
    disclaimerText: item.deal?.disclaimer,
    upc: item.twelveDigitUPC ?? sku?.twelveDigitUPC,
    skuId: sku?.id,
    storeLocation: item.productLocation?.location ?? sku?.storeLocation?.location,
  };
}

export async function getWeeklyAdProducts(
  session: HEBSession,
  options: WeeklyAdOptions = {}
): Promise<WeeklyAdResult> {
  const storeId = resolveStoreId(session, options);
  const limit = normalizeLimit(options.limit);
  const shoppingContext = resolveShoppingContext(session);
  const cursor = options.cursor ? String(options.cursor) : undefined;
  
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
        ...(cursor ? { cursor, pageCursor: cursor } : {}),
      }
  );



  let landingPageData = response.data?.weeklyAd ?? response.data?.weeklyAdProductCategoryPage; 
  
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


     if (landingResponse.data?.weeklyAd) {
         landingPageData = landingResponse.data.weeklyAd;
     }
  }

  if (response.errors?.length) {
    throw new Error(`Weekly ad fetch failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const data = response.data?.weeklyAd ?? response.data?.weeklyAdProductCategoryPage;

  // Extract products (weekly ad currently returns productPage.products, not productSearch.products)
  const productsList =
    data?.productPage?.products ??
    data?.productSearch?.productPage?.products ??
    data?.productSearch?.products ??
    [];

  const cursorList =
    data?.productPage?.cursorList ??
    data?.productSearch?.productPage?.cursorList ??
    data?.productSearch?.cursorList ??
    [];

  let nextCursor: string | undefined;
  if (cursorList.length > 0) {
    if (cursor) {
      const index = cursorList.indexOf(cursor);
      if (index >= 0 && index + 1 < cursorList.length) {
        nextCursor = cursorList[index + 1];
      }
    } else if (cursorList.length > 1) {
      nextCursor = cursorList[1];
    } else {
      nextCursor = cursorList[0];
    }
  }
  
  let products = productsList
    .map(mapWeeklyAdProduct)
    .filter(p => p.id && p.name);

  if (limit === 0) {
    products = [];
  } else {
    products = products.slice(0, limit);
  }

  // Extract categories
  const categorySource = landingPageData?.productSearch?.info?.filterCounts?.categories 
                         ?? data?.productSearch?.info?.filterCounts?.categories 
                         ?? [];
                         
  const categories: WeeklyAdCategory[] = categorySource.map(c => ({
    id: String(c.filter ?? ''),
    name: c.displayName ?? 'Unknown',
    count: c.count ?? 0,
  }));

  return {
    products,
    totalCount: data?.productSearch?.info?.total ?? products.length,
    validFrom: data?.productSearch?.info?.total ? undefined : undefined, // Dates not found in new schema yet
    validTo: undefined, 
    storeCode: String(storeId),
    categories,
    cursor: nextCursor,
  };
}
