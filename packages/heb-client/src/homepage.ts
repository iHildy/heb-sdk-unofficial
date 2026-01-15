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
 * Generic item in a homepage section.
 */
export type HomepageItem = HomepageBanner | HomepagePromotion | HomepageFeaturedProduct | {
  id: string;
  type: string;
  name: string;
  [key: string]: unknown;
};

/**
 * Content section on the homepage.
 */
export interface HomepageSection {
  id: string;
  type: string;
  title?: string;
  itemCount: number;
  items: HomepageItem[];
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

/**
 * Options for filtering and limiting homepage data.
 */
export interface HomepageOptions {
  /**
   * Maximum number of sections to return (default: unlimited).
   */
  maxSections?: number;

  /**
   * Maximum items to include per section (default: unlimited).
   * Set to 0 to exclude item content entirely.
   */
  maxItemsPerSection?: number;

  /**
   * Section types to include (whitelist). If provided, only matching types are returned.
   * Case-insensitive partial match (e.g., "carousel" matches "ContentDeliveryTextLinkCarousel").
   */
  includeSectionTypes?: string[];

  /**
   * Section types to exclude (blacklist). Excluded after include filter.
   * Case-insensitive partial match.
   */
  excludeSectionTypes?: string[];

  /**
   * Whether to populate the top-level `banners` array (default: true).
   */
  includeBanners?: boolean;

  /**
   * Whether to populate the top-level `promotions` array (default: true).
   */
  includePromotions?: boolean;

  /**
   * Whether to populate the top-level `featuredProducts` array (default: true).
   */
  includeFeaturedProducts?: boolean;

  /**
   * Only include sections that have a title (default: false).
   */
  onlyTitledSections?: boolean;
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
 * @param options - Optional filtering/limiting options
 * @returns Homepage data with banners, promotions, and sections
 *
 * @example
 * // Get all homepage content
 * const homepage = await getHomepage(session);
 * 
 * @example
 * // Get only titled sections with max 5 items each
 * const homepage = await getHomepage(session, {
 *   onlyTitledSections: true,
 *   maxItemsPerSection: 5,
 * });
 * 
 * @example
 * // Get only carousel sections, no banners/promos
 * const homepage = await getHomepage(session, {
 *   includeSectionTypes: ['carousel'],
 *   includeBanners: false,
 *   includePromotions: false,
 * });
 */
export async function getHomepage(session: HEBSession, options: HomepageOptions = {}): Promise<HomepageData> {
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

  // Destructure options with defaults
  const {
    maxSections,
    maxItemsPerSection,
    includeSectionTypes,
    excludeSectionTypes,
    includeBanners = true,
    includePromotions = true,
    includeFeaturedProducts = true,
    onlyTitledSections = false,
  } = options;

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

  // Helper to check if a section type matches filter patterns
  const matchesPattern = (type: string, patterns: string[]): boolean => {
    const lowerType = type.toLowerCase();
    return patterns.some(p => lowerType.includes(p.toLowerCase()));
  };

  let sections: HomepageSection[] = [];
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

    // Apply section type filters
    if (includeSectionTypes && includeSectionTypes.length > 0) {
      if (!matchesPattern(componentType, includeSectionTypes)) return;
    }
    if (excludeSectionTypes && excludeSectionTypes.length > 0) {
      if (matchesPattern(componentType, excludeSectionTypes)) return;
    }

    // Apply titled-only filter
    if (onlyTitledSections && !title) return;

    const rawItems = extractComponentItems(component);
    const sectionItems: HomepageItem[] = [];

    const isBannerComponent = /banner|hero|carousel/i.test(componentType);
    const isPromoComponent = /promo|deal|offer/i.test(componentType);

    // Process items (respect maxItemsPerSection)
    const itemsToProcess = maxItemsPerSection !== undefined 
      ? rawItems.slice(0, maxItemsPerSection === 0 ? 0 : maxItemsPerSection)
      : rawItems;

    itemsToProcess.forEach((item, itemIndex) => {
      const itemType = String(item?.type ?? item?.__typename ?? '').toLowerCase();
      const itemId = String(item?.id ?? item?.externalId ?? `${componentType}-${index}-${itemIndex}`);

      let mappedItem: HomepageItem | null = null;

      // Handle banners
      if (includeBanners && (isBannerComponent || itemType.includes('banner') || itemType.includes('hero'))) {
        const banner = mapBanner(item, itemId, banners.length);
        if (banner) {
          if (!seenBannerIds.has(banner.id)) {
            seenBannerIds.add(banner.id);
            banners.push(banner);
          }
          mappedItem = banner;
        }
      }

      // Handle promotions
      if (!mappedItem && includePromotions && (isPromoComponent || itemType.includes('promo') || itemType.includes('deal'))) {
        const promo = mapPromotion(item, itemId);
        if (promo) {
          if (!seenPromoIds.has(promo.id)) {
            seenPromoIds.add(promo.id);
            promotions.push(promo);
          }
          mappedItem = promo;
        }
      }

      // Handle products
      if (!mappedItem && includeFeaturedProducts && isProductLike(item)) {
        const product = mapFeaturedProduct(item);
        if (product) {
          if (!seenProductIds.has(product.productId)) {
            seenProductIds.add(product.productId);
            featuredProducts.push(product);
          }
          mappedItem = product;
        }
      }

      // Fallback: Generic Item
      if (!mappedItem) {
        mappedItem = {
          id: itemId,
          type: itemType || 'unknown',
          name: (item.text as string) ?? (item.title as string) ?? (item.name as string) ?? 'Untitled',
          ...item
        };
      }

      sectionItems.push(mappedItem);
    });

    sections.push({
      id: String((component as any)?.id ?? (component as any)?.externalId ?? (component as any)?.uuid ?? `${componentType}-${index}`),
      type: componentType,
      title,
      itemCount: rawItems.length, // Total count before limiting
      items: sectionItems,        // Potentially limited items
    });
  });

  // Add categories section if applicable
  const categories = extractCategories(categoriesRes.data);
  if (categories.length) {
    const categoryType = 'Categories';
    
    // Check filters
    const includeCategories = 
      (!includeSectionTypes || includeSectionTypes.length === 0 || matchesPattern(categoryType, includeSectionTypes)) &&
      (!excludeSectionTypes || excludeSectionTypes.length === 0 || !matchesPattern(categoryType, excludeSectionTypes)) &&
      !onlyTitledSections; // Categories has a title, so this would pass anyway
    
    if (includeCategories || !onlyTitledSections) {
      const categoryItems = maxItemsPerSection !== undefined
        ? categories.slice(0, maxItemsPerSection === 0 ? 0 : maxItemsPerSection)
        : categories;

      sections.push({
        id: 'categories',
        type: categoryType,
        title: 'Categories',
        itemCount: categories.length,
        items: categoryItems.map((c: any) => ({
          id: c.id ?? 'unknown',
          type: 'Category',
          name: c.name ?? 'Unknown Category',
          ...c
        })),
      });
    }
  }

  // Apply maxSections limit
  if (maxSections !== undefined && maxSections > 0) {
    sections = sections.slice(0, maxSections);
  }

  return { 
    banners: includeBanners ? banners : [], 
    promotions: includePromotions ? promotions : [], 
    featuredProducts: includeFeaturedProducts ? featuredProducts : [], 
    sections 
  };
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

/**
 * Format homepage data for display.
 */
export function formatHomepageData(homepage: HomepageData): string {
  const parts: string[] = ['**H-E-B Homepage**'];

  // Banners
  if (homepage.banners.length > 0) {
    parts.push(`\n**Banners (${homepage.banners.length}):**`);
    homepage.banners.forEach((b, i) => {
      parts.push(`${i + 1}. ${b.title ?? 'Untitled'}${b.linkUrl ? ` - ${b.linkUrl}` : ''}`);
    });
  }

  // Promotions
  if (homepage.promotions.length > 0) {
    parts.push(`\n**Promotions (${homepage.promotions.length}):**`);
    homepage.promotions.forEach((p, i) => {
      parts.push(`${i + 1}. ${p.title}${p.description ? ` - ${p.description}` : ''}`);
    });
  }

  // Featured Products
  if (homepage.featuredProducts.length > 0) {
    parts.push(`\n**Featured Products (${homepage.featuredProducts.length}):**`);
    homepage.featuredProducts.forEach((p, i) => {
      const price = p.priceFormatted ?? '';
      parts.push(`${i + 1}. ${p.name}${p.brand ? ` (${p.brand})` : ''} ${price} (ID: ${p.productId})`);
    });
  }

  // Content Sections
  if (homepage.sections.length > 0) {
    parts.push(`\n**Content Sections (${homepage.sections.length}):**`);
    homepage.sections.forEach((s, i) => {
      parts.push(`\n${i + 1}. **${s.title ?? s.type}** (${s.itemCount} items)`);
      
      if (s.items && s.items.length > 0) {
        s.items.forEach(item => {
          let itemText = '';
          
          // Check for product
          if ('productId' in item) {
             const p = item as any;
             const price = p.priceFormatted ?? (p.price ? `$${p.price}` : '');
             itemText = `${p.name} ${price}`.trim();
          } 
          // Check for banner/promo
          else if ('imageUrl' in item) {
             const b = item as any;
             itemText = b.title ?? b.name ?? 'Banner';
             if (b.subtitle || b.description) itemText += ` - ${b.subtitle ?? b.description}`;
          }
          // Fallback
          else {
             const anyItem = item as any;
             itemText = anyItem.name ?? anyItem.title ?? anyItem.text ?? 'Unknown Item';
          }

          parts.push(`   - ${itemText}`);
        });
      }
    });
  }

  if (parts.length === 1) {
    parts.push('\nNo homepage content found.');
  }

  return parts.join('\n');
}
