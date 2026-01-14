/**
 * Homepage content operations.
 *
 * @module homepage
 */

import { nextDataRequest } from './api.js';
import type { HEBSession } from './types.js';

// ─────────────────────────────────────────────────────────────
// Raw API Response Types (internal)
// ─────────────────────────────────────────────────────────────

interface RawBanner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  url?: string;
  linkUrl?: string;
  position?: number;
}

interface RawGridBanner {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  url?: string;
  linkUrl?: string;
  imageUrl?: string;
  position: number;
}

interface RawFeaturedProduct {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  price?: { formatted: string; amount: number };
  productId?: string;
}

interface RawPromotion {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  validFrom?: string;
  validTo?: string;
}

interface RawHomepageSection {
  id: string;
  type: string;
  title?: string;
  items?: unknown[];
}

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
 * Requires a valid buildId on the session.
 *
 * @param session - Active HEB session
 * @returns Homepage data with banners, promotions, and sections
 *
 * @example
 * const homepage = await getHomepage(session);
 * homepage.banners.forEach(b => console.log(b.title));
 */
export async function getHomepage(session: HEBSession): Promise<HomepageData> {
  const data = await nextDataRequest<{
    pageProps: {
      banners?: RawBanner[];
      gridBanners?: RawGridBanner[];
      heroBanners?: RawBanner[];
      promotions?: RawPromotion[];
      deals?: RawPromotion[];
      featuredProducts?: RawFeaturedProduct[];
      sections?: RawHomepageSection[];
      components?: RawHomepageSection[];
    };
  }>(session, '/en.json');

  const pageProps = data.pageProps ?? {};

  // Parse banners (may come from multiple sources)
  const rawBanners = [
    ...(pageProps.banners ?? []),
    ...(pageProps.heroBanners ?? []),
    ...(pageProps.gridBanners ?? []),
  ];

  const banners: HomepageBanner[] = rawBanners.map((b, i) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    imageUrl: b.imageUrl,
    linkUrl: b.linkUrl ?? b.url,
    position: b.position ?? i,
  }));

  // Parse promotions
  const rawPromos = pageProps.promotions ?? pageProps.deals ?? [];
  const promotions: HomepagePromotion[] = rawPromos.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    linkUrl: p.linkUrl,
  }));

  // Parse featured products
  const rawProducts = pageProps.featuredProducts ?? [];
  const featuredProducts: HomepageFeaturedProduct[] = rawProducts.map((p) => ({
    productId: p.productId ?? p.id,
    name: p.name,
    brand: p.brand,
    imageUrl: p.imageUrl,
    priceFormatted: p.price?.formatted,
    price: p.price?.amount,
  }));

  // Parse sections
  const rawSections = pageProps.sections ?? pageProps.components ?? [];
  const sections: HomepageSection[] = rawSections.map((s) => ({
    id: s.id,
    type: s.type,
    title: s.title,
    itemCount: s.items?.length ?? 0,
  }));

  return { banners, promotions, featuredProducts, sections };
}
