import { persistedQuery } from "./api.js";
import { resolveShoppingContext } from "./session.js";
import type { HEBSession } from "./types.js";
import {
  type MobileProduct,
  type Product,
  mapMobileProduct,
} from "./product-mapper.js";

// Re-export types for use in other modules
export type {
  NutritionInfo,
  ProductPrice,
  FulfillmentInfo,
  Product,
} from "./product-mapper.js";

// Mobile GraphQL product details response
interface MobileProductDetailsResponse {
  productDetailsPage?: {
    product?: MobileProduct;
  };
}

export interface GetProductOptions {
  includeImages?: boolean;
}

function resolveStoreId(session: HEBSession): number {
  const storeIdRaw = session.cookies?.CURR_SESSION_STORE;
  if (!storeIdRaw) {
    throw new Error(
      "No store selected. Set CURR_SESSION_STORE before fetching product details.",
    );
  }
  const storeId = Number(storeIdRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeId: ${storeIdRaw}`);
  }
  return storeId;
}

/**
 * Get full product details by product ID.
 *
 * Uses the mobile GraphQL API which returns comprehensive product info
 * including SKU ID, nutrition, aisle location, and fulfillment options.
 *
 * @param session - Active HEB bearer session
 * @param productId - Product ID
 * @param options - Options for fetching details
 *
 * @example
 * const product = await getProductDetails(session, '1875945');
 * console.log(`${product.name} - SKU: ${product.skuId}`);
 * console.log(`Price: ${product.price?.formatted}`);
 */
export async function getProductDetails(
  session: HEBSession,
  productId: string,
  options: GetProductOptions = {},
): Promise<Product> {
  if (session.authMode !== "bearer") {
    throw new Error(
      "Product details require a bearer session (mobile GraphQL).",
    );
  }

  return getProductDetailsMobile(session, productId, options);
}

async function getProductDetailsMobile(
  session: HEBSession,
  productId: string,
  options: GetProductOptions,
): Promise<Product> {
  const storeId = resolveStoreId(session);
  const shoppingContext = resolveShoppingContext(session);

  const response = await persistedQuery<{
    productDetailsPage?: MobileProductDetailsResponse["productDetailsPage"];
  }>(session, "ProductDetailsPage", {
    id: productId,
    isAuthenticated: true,
    shoppingContext,
    storeId: String(storeId),
    storeIdInt: storeId,
  });

  if (response.errors?.length) {
    throw new Error(
      `Product fetch failed: ${response.errors.map((e) => e.message).join(", ")}`,
    );
  }

  const product = response.data?.productDetailsPage?.product as
    | MobileProduct
    | undefined;
  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  return mapMobileProduct(product, shoppingContext, {
    includeImages: options.includeImages,
    fallbackProductId: productId,
  });
}

/**
 * Get just the SKU ID for a product.
 * Useful when you have a product ID and need the SKU for cart operations.
 *
 * @example
 * const skuId = await getProductSkuId(session, '1875945');
 * await addToCart(session, '1875945', skuId, 2);
 */
export async function getProductSkuId(
  session: HEBSession,
  productId: string,
): Promise<string> {
  const product = await getProductDetails(session, productId);

  if (!product.skuId) {
    throw new Error(`SKU ID not found for product ${productId}`);
  }

  return product.skuId;
}

/**
 * Build product image URL.
 * HEB images follow a predictable pattern.
 *
 * @param productId - Product ID
 * @param size - Image dimensions (default 360x360)
 *
 * @example
 * const imageUrl = getProductImageUrl('1875945', 500);
 * // https://images.heb.com/is/image/HEBGrocery/1875945?hei=500&wid=500
 */
export function getProductImageUrl(productId: string, size = 360): string {
  return `https://images.heb.com/is/image/HEBGrocery/${productId}?hei=${size}&wid=${size}`;
}

/**
 * Format a product for list display (e.g. search results).
 */
export function formatProductListItem(p: Product, index: number): string {
  const price = p.price?.formatted ? ` - ${p.price.formatted}` : '';
  const size = p.size ? ` - ${p.size}` : '';
  const brand = p.brand ? ` (${p.brand})` : '';
  const stock = p.inStock ? '' : ' [OUT OF STOCK]';
  return `${index + 1}. ${p.name}${brand}${size}${price}${stock} (ID: ${p.productId})`;
}

/**
 * Format full product details.
 */
export function formatProductDetails(product: Product): string {
  return [
    `**${product.name}**`,
    product.brand ? `Brand: ${product.brand}` : null,
    product.price ? `Price: ${product.price.formatted}` : null,
    product.inStock !== undefined ? `In Stock: ${product.inStock ? 'Yes' : 'No'}` : null,
    product.description ? `\nDescription: ${product.description}` : null,
    product.nutrition?.calories ? `\nNutrition: ${product.nutrition.calories} cal` : null,
    `\nSKU ID: ${product.skuId}`,
  ].filter(Boolean).join('\n');
}
