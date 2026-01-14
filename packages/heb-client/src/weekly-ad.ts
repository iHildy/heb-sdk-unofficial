import type { HEBSession } from './types.js';

const FLIPP_BASE_URL = 'https://dam.flippenterprise.net/flyerkit';
const FLIPP_MERCHANT_ID = 'ffheb';
const FLIPP_ACCESS_TOKEN = '98856c1ed32273db1aac58bfe8c76d90';
const DEFAULT_LOCALE = 'en';
const DEFAULT_DISPLAY_TYPE = 'all';

export interface WeeklyAdOptions {
  storeCode?: string | number;
  postalCode?: string;
  locale?: string;
  displayType?: string;
  categoryFilter?: string;
  department?: string;
  limit?: number;
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
  page?: number;
  itemType?: number;
}

export interface WeeklyAdResult {
  products: WeeklyAdProduct[];
  totalCount: number;
  flyerId: string;
  flyerRunId?: string;
  validFrom?: string;
  validTo?: string;
  storeCode: string;
  postalCode: string;
}

interface FlippStoreInfo {
  merchant_store_code?: string;
  postal_code?: string;
}

interface FlippPublication {
  id?: number;
  flyer_run_id?: number;
  flyer_type?: string;
  name?: string;
  valid_from?: string;
  valid_to?: string;
}

interface FlippProduct {
  id?: number;
  name?: string;
  brand?: string;
  description?: string;
  image_url?: string;
  price_text?: string;
  sale_story?: string;
  disclaimer_text?: string;
  valid_from?: string;
  valid_to?: string;
  categories?: string[];
  page?: number;
  item_type?: number;
  item_categories?: {
    l2?: { category_name?: string };
    l3?: { category_name?: string };
  };
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

function resolveLocale(options?: WeeklyAdOptions): string {
  const locale = options?.locale?.trim() || DEFAULT_LOCALE;
  return locale;
}

function resolveDisplayType(options?: WeeklyAdOptions): string {
  const displayType = options?.displayType?.trim() || DEFAULT_DISPLAY_TYPE;
  return displayType;
}

function normalizeLimit(limit?: number): number | undefined {
  if (limit === undefined) return undefined;
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error(`Invalid limit: ${limit}`);
  }
  return Math.floor(limit);
}

function buildUrl(path: string, params: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${FLIPP_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Weekly ad request failed: ${response.status} ${response.statusText}\n${body}`);
  }
  return response.json() as Promise<T>;
}

async function fetchStoreInfo(storeCode: string, locale: string): Promise<FlippStoreInfo> {
  const url = buildUrl(`/store/${FLIPP_MERCHANT_ID}`, {
    locale,
    access_token: FLIPP_ACCESS_TOKEN,
    store_code: storeCode,
  });
  return requestJson<FlippStoreInfo>(url);
}

async function fetchPublications(storeCode: string, postalCode: string, locale: string): Promise<FlippPublication[]> {
  const url = buildUrl(`/publications/${FLIPP_MERCHANT_ID}`, {
    locale,
    access_token: FLIPP_ACCESS_TOKEN,
    show_storefronts: true,
    postal_code: postalCode,
    store_code: storeCode,
  });
  return requestJson<FlippPublication[]>(url);
}

async function fetchProducts(publicationId: string, locale: string, displayType: string): Promise<FlippProduct[]> {
  const url = buildUrl(`/publication/${publicationId}/products`, {
    locale,
    access_token: FLIPP_ACCESS_TOKEN,
    display_type: displayType,
  });
  return requestJson<FlippProduct[]>(url);
}

function selectWeeklyPublication(publications: FlippPublication[]): FlippPublication {
  const weekly = publications.find(publication => publication.flyer_type === 'weeklyad');
  if (weekly) return weekly;
  const fallback = publications.find(publication => publication.name?.toLowerCase().includes('weekly'));
  if (fallback) return fallback;
  throw new Error('Weekly ad publication not found for this store.');
}

function matchesCategory(product: FlippProduct, categoryFilter?: string): boolean {
  if (!categoryFilter) return true;
  const needle = categoryFilter.toLowerCase();
  const categories = product.categories ?? [];
  return categories.some(category => category.toLowerCase().includes(needle));
}

function matchesDepartment(product: FlippProduct, department?: string): boolean {
  if (!department) return true;
  const needle = department.toLowerCase();
  const candidates = [
    product.item_categories?.l2?.category_name,
    product.item_categories?.l3?.category_name,
  ].filter(Boolean) as string[];
  return candidates.some(category => category.toLowerCase().includes(needle));
}

function mapProduct(product: FlippProduct): WeeklyAdProduct {
  return {
    id: String(product.id ?? ''),
    name: product.name ?? '',
    brand: product.brand ?? undefined,
    description: product.description ?? undefined,
    imageUrl: product.image_url ?? undefined,
    priceText: product.price_text ?? undefined,
    saleStory: product.sale_story ?? undefined,
    disclaimerText: product.disclaimer_text ?? undefined,
    validFrom: product.valid_from ?? undefined,
    validTo: product.valid_to ?? undefined,
    categories: product.categories ?? undefined,
    page: product.page ?? undefined,
    itemType: product.item_type ?? undefined,
  };
}

export async function getWeeklyAdProducts(
  session: HEBSession,
  options: WeeklyAdOptions = {}
): Promise<WeeklyAdResult> {
  const storeCode = resolveStoreCode(session, options);
  const locale = resolveLocale(options);
  const displayType = resolveDisplayType(options);
  const limit = normalizeLimit(options.limit);

  const storeInfo = options.postalCode
    ? { postal_code: options.postalCode }
    : await fetchStoreInfo(storeCode, locale);

  const postalCode = storeInfo.postal_code?.trim();
  if (!postalCode) {
    throw new Error('Postal code not found for store. Provide weekly ad option postalCode.');
  }

  const publications = await fetchPublications(storeCode, postalCode, locale);
  if (!Array.isArray(publications) || publications.length === 0) {
    throw new Error('No weekly ad publications returned for this store.');
  }

  const publication = selectWeeklyPublication(publications);
  const publicationId = publication.id ? String(publication.id) : '';
  if (!publicationId) {
    throw new Error('Weekly ad publication id missing.');
  }

  const rawProducts = await fetchProducts(publicationId, locale, displayType);
  const filtered = rawProducts.filter(product => matchesCategory(product, options.categoryFilter))
    .filter(product => matchesDepartment(product, options.department));

  const sliced = limit ? filtered.slice(0, limit) : filtered;
  const products = sliced.map(mapProduct);

  return {
    products,
    totalCount: filtered.length,
    flyerId: publicationId,
    flyerRunId: publication.flyer_run_id ? String(publication.flyer_run_id) : undefined,
    validFrom: publication.valid_from ?? undefined,
    validTo: publication.valid_to ?? undefined,
    storeCode,
    postalCode,
  };
}
