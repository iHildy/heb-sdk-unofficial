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

export async function getWeeklyAdProducts(
  session: HEBSession,
  options: WeeklyAdOptions = {}
): Promise<WeeklyAdResult> {
  resolveStoreCode(session, options);
  normalizeLimit(options.limit);
  void options;

  throw new Error('Weekly ad data is not available without Next.js endpoints. Mobile GraphQL support has not been captured yet.');
}
