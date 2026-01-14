import { nextDataRequest } from './api.js';
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

function resolveStoreCode(session: HEBSession, options?: WeeklyAdOptions): string {
  const storeCodeRaw = options?.storeCode ?? session.cookies?.CURR_SESSION_STORE;
  if (!storeCodeRaw) {
    throw new Error('No store selected. Set CURR_SESSION_STORE or pass weekly ad option storeCode.');
  }
  const storeCode = String(storeCodeRaw).trim();
  if (!storeCode || Number.isNaN(Number(storeCode))) {
    throw new Error(`Invalid storeCode: ${storeCodeRaw}`);
  }
  return storeCode;
}

function normalizeLimit(limit?: number): number | undefined {
  if (limit === undefined) return undefined;
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error(`Invalid limit: ${limit}`);
  }
  return Math.floor(limit);
}

// Incomplete type definition for the Next.js page props
interface NextWeeklyAdResponse {
  pageProps: {
    initialState: {
      weeklyAd: {
        deals: {
          ids: string[];
          entities: Record<string, any>;
          total: number;
          facets: {
            categories: {
              id: string;
              label: string;
              count: number;
            }[];
          };
          meta: {
            startDate: string;
            endDate: string;
            nextCursor?: string;
          };
        };
      };
    };
  };
}

function mapNextProduct(raw: any): WeeklyAdProduct {
  return {
    id: raw.productId || raw.code || '',
    name: raw.name || '',
    brand: raw.brand || undefined,
    description: raw.description || undefined,
    imageUrl: raw.image?.url || raw.images?.[0]?.url || undefined,
    priceText: raw.price?.priceString || undefined,
    saleStory: raw.price?.saleStory || undefined,
    disclaimerText: raw.price?.disclaimer || undefined,
    // validFrom/validTo usually come from the meta, but could be on product
    upc: raw.upc || undefined,
    skuId: raw.sku || undefined,
    storeLocation: raw.storeLocation || undefined,
    categories: raw.categories?.map((c: any) => c.name || c.label) || [],
  };
}

export async function getWeeklyAdProducts(
  session: HEBSession,
  options: WeeklyAdOptions = {}
): Promise<WeeklyAdResult> {
  const storeCode = resolveStoreCode(session, options);
  const limit = normalizeLimit(options.limit);
  
  // Construct the path with query parameters
  const query = new URLSearchParams();
  query.set('storeId', storeCode);
  if (options.category) {
    query.set('categoryId', String(options.category));
  }
  if (options.cursor) {
    query.set('cursor', options.cursor);
  }
  // The interactive weekly ad page seems to be /weekly-ad/deals
  const path = `/weekly-ad/deals?${query.toString()}`;

  const data = await nextDataRequest<NextWeeklyAdResponse>(session, path);
  
  const dealsState = data.pageProps?.initialState?.weeklyAd?.deals;
  
  if (!dealsState) {
    // It's possible the structure is different or we got a different page type (e.g. error or redirect)
    throw new Error('Failed to retrieve weekly ad deals from Next.js data.');
  }
  
  const products = dealsState.ids.map(id => mapNextProduct(dealsState.entities[id]));
  const totalCount = dealsState.total;
  const categories = dealsState.facets?.categories?.map(c => ({
    id: c.id,
    name: c.label,
    count: c.count
  })) || [];
  
  return {
    products: limit ? products.slice(0, limit) : products,
    totalCount,
    validFrom: dealsState.meta?.startDate,
    validTo: dealsState.meta?.endDate,
    storeCode,
    categories,
    cursor: dealsState.meta?.nextCursor,
  };
}
