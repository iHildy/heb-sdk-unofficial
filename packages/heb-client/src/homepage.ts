/**
 * Homepage content operations.
 *
 * @module homepage
 */

import { persistedQuery } from './api.js';
import { resolveShoppingContext } from './session.js';
import type { HEBSession } from './types.js';

// ─────────────────────────────────────────────────────────────
// Raw API Response Types (internal)
// ─────────────────────────────────────────────────────────────

type RawComponent = Record<string, unknown>;

interface MobileLayoutResponse {
  collectionEntryPoint?: {
    layout?: {
      visualComponents?: RawComponent[];
      components?: RawComponent[];
    };
    header?: Record<string, unknown>;
  };
  entryPoint?: {
    collectionEntryPoint?: {
      layout?: {
        visualComponents?: RawComponent[];
        components?: RawComponent[];
      };
      header?: Record<string, unknown>;
    };
  };
  [key: string]: unknown;
}

const MOBILE_DEVICE = 'iPhone16,2';
const MOBILE_APP_VERSION = '5.9.0';

// ─────────────────────────────────────────────────────────────
// Public Types (exported)
// ─────────────────────────────────────────────────────────────

/**
 * Banner displayed on the homepage (hero or grid).
 */
export interface HomepageBanner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  position: number;
}

/**
 * Promotional content on the homepage.
 */
export interface HomepagePromotion {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
}

/**
 * Featured product displayed on the homepage.
 */
export interface HomepageFeaturedProduct {
  productId: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  priceFormatted?: string;
  price?: number;
}

/**
 * Content section on the homepage.
 */
export interface HomepageSection {
  id: string;
  type: string;
  title?: string;
  itemCount: number;
}

/**
 * Complete homepage data.
 */
export interface HomepageData {
  banners: HomepageBanner[];
  promotions: HomepagePromotion[];
  featuredProducts: HomepageFeaturedProduct[];
  sections: HomepageSection[];
}

// ─────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────

/**
 * Get the H-E-B homepage content.
 *
 * Returns featured banners, promotions, and product sections.
 * Requires a bearer session for the mobile GraphQL API.
 *
 * @param session - Active HEB session
 * @returns Homepage data with banners, promotions, and sections
 *
 * @example
 * const homepage = await getHomepage(session);
 * homepage.banners.forEach(b => console.log(b.title));
 */
export async function getHomepage(session: HEBSession): Promise<HomepageData> {
  if (session.authMode !== 'bearer') {
    throw new Error('Homepage data requires a bearer session (mobile GraphQL).');
  }

  const storeIdRaw = session.cookies?.CURR_SESSION_STORE;
  if (!storeIdRaw) {
    throw new Error('No store selected. Set CURR_SESSION_STORE before fetching homepage.');
  }
  const storeId = Number(storeIdRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeId: ${storeIdRaw}`);
  }

  const shoppingContext = resolveShoppingContext(session);
  const device = MOBILE_DEVICE;
  const version = MOBILE_APP_VERSION;



  const [entryPointRes, savingsRes, categoriesRes] = await Promise.all([
    persistedQuery<MobileLayoutResponse>(session, 'entryPoint', {
      device,
      id: 'home-page',
      isAuthenticated: true,
      shoppingContext,
      storeId,
      storeIdID: String(storeId),
      storeIdString: String(storeId),
      version,
    }),
    persistedQuery<MobileLayoutResponse>(session, 'entryPoint', {
      device,
      id: 'featured-savings',
      isAuthenticated: true,
      shoppingContext,
      storeId,
      storeIdID: String(storeId),
      storeIdString: String(storeId),
      version,
    }),
    persistedQuery<Record<string, unknown>>(session, 'Categories', {
      context: 'cspview',
      storeId,
    }),
  ]);

  console.log('DEBUG: entryPoint(home-page) response:', JSON.stringify(entryPointRes));
  console.log('DEBUG: entryPoint(featured-savings) response:', JSON.stringify(savingsRes));


  const errors = [
    ...(entryPointRes.errors ?? []),
    ...(savingsRes.errors ?? []),
    ...(categoriesRes.errors ?? []),
  ];
  if (errors.length) {
    throw new Error(`Homepage fetch failed: ${errors.map(e => e.message).join(', ')}`);
  }


  const components = [
    ...extractComponents(entryPointRes.data),
    ...extractComponents(savingsRes.data),
  ];

  const sections: HomepageSection[] = [];
  const banners: HomepageBanner[] = [];
  const promotions: HomepagePromotion[] = [];
  const featuredProducts: HomepageFeaturedProduct[] = [];

  const seenBannerIds = new Set<string>();
  const seenPromoIds = new Set<string>();
  const seenProductIds = new Set<string>();

  components.forEach((component, index) => {
    const componentType = String((component as any)?.type ?? (component as any)?.__typename ?? 'component');
    const header = (component as any)?.header as Record<string, unknown> | undefined;
    const title = String((component as any)?.title ?? header?.title ?? (component as any)?.heading ?? '').trim() || undefined;
    const items = extractComponentItems(component);

    sections.push({
      id: String((component as any)?.id ?? (component as any)?.externalId ?? (component as any)?.uuid ?? `${componentType}-${index}`),
      type: componentType,
      title,
      itemCount: items.length,
    });

    const isBannerComponent = /banner|hero|carousel/i.test(componentType);
    const isPromoComponent = /promo|deal|offer/i.test(componentType);

    items.forEach((item, itemIndex) => {
      const itemType = String(item?.type ?? item?.__typename ?? '').toLowerCase();
      const itemId = String(item?.id ?? item?.externalId ?? `${componentType}-${index}-${itemIndex}`);

      if ((isBannerComponent || itemType.includes('banner') || itemType.includes('hero')) && !seenBannerIds.has(itemId)) {
        const banner = mapBanner(item, itemId, banners.length);
        if (banner) {
          seenBannerIds.add(banner.id);
          banners.push(banner);
        }
        return;
      }

      if ((isPromoComponent || itemType.includes('promo') || itemType.includes('deal')) && !seenPromoIds.has(itemId)) {
        const promo = mapPromotion(item, itemId);
        if (promo) {
          seenPromoIds.add(promo.id);
          promotions.push(promo);
        }
        return;
      }

      if (isProductLike(item)) {
        const product = mapFeaturedProduct(item);
        if (product && !seenProductIds.has(product.productId)) {
          seenProductIds.add(product.productId);
          featuredProducts.push(product);
        }
      }
    });
  });

  const categories = extractCategories(categoriesRes.data);
  if (categories.length) {
    sections.push({
      id: 'categories',
      type: 'Categories',
      title: 'Categories',
      itemCount: categories.length,
    });
  }

  return { banners, promotions, featuredProducts, sections };
}

function extractComponents(payload?: MobileLayoutResponse): RawComponent[] {
  const components: RawComponent[] = [];
  const candidates = [
    payload?.collectionEntryPoint?.layout?.visualComponents,
    payload?.collectionEntryPoint?.layout?.components,
    payload?.entryPoint?.collectionEntryPoint?.layout?.visualComponents,
    payload?.entryPoint?.collectionEntryPoint?.layout?.components,
    (payload as any)?.nativeEntryPoint?.visualComponents,
    (payload as any)?.nativeEntryPoint?.components,
    (payload as any)?.discoverLayout?.collectionEntryPoint?.layout?.visualComponents,
    (payload as any)?.discoverLayout?.collectionEntryPoint?.layout?.components,
    (payload as any)?.discoverDetail?.collectionEntryPoint?.layout?.visualComponents,
    (payload as any)?.discoverDetail?.collectionEntryPoint?.layout?.components,
    (payload as Record<string, unknown>)?.['layout'] && (payload as any)?.layout?.visualComponents,
    (payload as Record<string, unknown>)?.['layout'] && (payload as any)?.layout?.components,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      components.push(...candidate);
    }
  }

  return components;
}

function extractComponentItems(component: RawComponent): RawComponent[] {
  const keys = [
    'items', 'cards', 'tiles', 'banners', 'promotions', 'products', 'productList', 'entries', 'components',
    'textLinks', 'carouselItems', 'mobileAndNativeLayoutOrder', 'moduleCards',
    'sectionOne', 'sectionTwo', 'sectionThree', 'shortcutsSet'
  ];
  const results: RawComponent[] = [];
  
  let foundItems = false;
  for (const key of keys) {
    const value = component?.[key] as unknown;
    if (Array.isArray(value)) {
      results.push(...value);
      if (value.length > 0) foundItems = true;
    } else if (value && typeof value === 'object') {
      // Check for nested lists in objects
      const nestedCandidates = [
        (value as any).items,
        (value as any).carouselItems,
        (value as any).shortcutsSet
      ];
      
      for (const candidate of nestedCandidates) {
        if (Array.isArray(candidate)) {
          results.push(...candidate);
          if (candidate.length > 0) foundItems = true;
        }
      }
    }
  }

  // If NO explicit items list was found, but the component itself looks like a Banner or Promo,
  // treat the component ITSELF as the item.
  if (!foundItems && results.length === 0) {
    // Check if it has banner-like properties
    if (component.imageUrl || (component.image as any)?.url || component.title || component.headline) {
         // It's a single item component
         results.push(component);
    }
  }
  
  return results;
}

function mapBanner(item: RawComponent, id: string, position: number): HomepageBanner | null {
  const imageUrl = resolveImageUrl(item);
  if (!imageUrl) return null;
  return {
    id,
    title: (item.title as string) ?? (item.headline as string) ?? (item.name as string),
    subtitle: (item.subtitle as string) ?? (item.subTitle as string),
    imageUrl,
    linkUrl: (item.linkUrl as string) ?? (item.url as string) ?? (item.link as any)?.url,
    position,
  };
}

function mapPromotion(item: RawComponent, id: string): HomepagePromotion | null {
  const title = (item.title as string) ?? (item.headline as string) ?? (item.name as string);
  if (!title) return null;
  return {
    id,
    title,
    description: (item.description as string) ?? (item.subtitle as string),
    imageUrl: resolveImageUrl(item),
    linkUrl: (item.linkUrl as string) ?? (item.url as string) ?? (item.link as any)?.url,
  };
}

function mapFeaturedProduct(item: RawComponent): HomepageFeaturedProduct | null {
  const productId = String(item.productId ?? item.id ?? (item.product as any)?.id ?? '');
  const name = (item.name as string) ?? (item.displayName as string) ?? (item.title as string);
  if (!productId || !name) return null;

  const brand = (item.brand as any)?.name ?? (item.brand as string);
  const imageUrl = resolveImageUrl(item) ?? (item.thumbnailImageUrls as any)?.[0]?.url;
  const priceAmount = (item.price as any)?.amount ?? (item.price as any)?.value;
  const priceFormatted = (item.price as any)?.formattedAmount ?? (item.price as any)?.formatted;

  return {
    productId,
    name,
    brand: typeof brand === 'string' ? brand : undefined,
    imageUrl,
    price: typeof priceAmount === 'number' ? priceAmount : undefined,
    priceFormatted: typeof priceFormatted === 'string' ? priceFormatted : undefined,
  };
}

function resolveImageUrl(item: RawComponent): string | undefined {
  const imageUrl = (item.imageUrl as string)
    ?? (item.image as any)?.url
    ?? (item.image as any)?.src
    ?? (item.media as any)?.url;
  return typeof imageUrl === 'string' ? imageUrl : undefined;
}

function isProductLike(item: RawComponent): boolean {
  return Boolean(item.productId || item.id || (item.product as any)?.id) && Boolean(item.name || item.displayName || item.title);
}

function extractCategories(payload?: Record<string, unknown>): RawComponent[] {
  if (!payload) return [];
  const candidates = [
    (payload as any).categories,
    (payload as any).categoryTree,
    (payload as any).categoryNavigation,
    (payload as any).categories?.items,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as RawComponent[];
    }
  }
  return [];
}
