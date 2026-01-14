import { persistedQuery } from './api.js';
import { getShoppingMode, resolveShoppingContext } from './session.js';
import type { HEBSession } from './types.js';

/**
 * Product nutrition info.
 */
export interface NutritionInfo {
  servingSize?: string;
  servingsPerContainer?: string;
  calories?: number;
  totalFat?: string;
  saturatedFat?: string;
  transFat?: string;
  cholesterol?: string;
  sodium?: string;
  totalCarbs?: string;
  fiber?: string;
  sugars?: string;
  protein?: string;
}

/**
 * Product price info.
 */
export interface ProductPrice {
  amount: number;
  formatted: string;
  wasPrice?: {
    amount: number;
    formatted: string;
  };
  unitPrice?: {
    amount: number;
    unit: string;
    formatted: string;
  };
}

/**
 * Product fulfillment options.
 */
export interface FulfillmentInfo {
  curbside: boolean;
  delivery: boolean;
  inStore: boolean;
  aisleLocation?: string;
}

/**
 * Full product details.
 */
export interface Product {
  productId: string;
  skuId: string;
  name: string;
  brand?: string;
  isOwnBrand?: boolean;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  images?: string[];
  price?: ProductPrice;
  nutrition?: NutritionInfo;
  fulfillment?: FulfillmentInfo;
  ingredients?: string;
  upc?: string;
  size?: string;
  category?: string;
  categoryPath?: string[];
  isAvailable?: boolean;
  inStock?: boolean;
  maxQuantity?: number;
  productUrl?: string;
}

// Nutrition label structure
interface RawNutritionLabel {
  servingsPerContainer?: string;
  servingSize?: string;
  calories?: string;
  nutrients?: Array<{
    title?: string;
    unit?: string;
    percentage?: string;
    subItems?: Array<{
      title?: string;
      unit?: string;
      percentage?: string;
    }>;
  }>;
}

// Mobile GraphQL product details response
interface MobileProductDetailsResponse {
  productDetailsPage?: {
    product?: MobileProduct;
  };
}

interface MobileProduct {
  productId?: string;
  skus?: Array<{
    id?: string;
    contextPrices?: Array<{
      context?: string;
      listPrice?: { amount?: number; formattedAmount?: string; unit?: string };
      salePrice?: { amount?: number; formattedAmount?: string; unit?: string };
      unitListPrice?: { amount?: number; formattedAmount?: string; unit?: string };
      unitSalePrice?: { amount?: number; formattedAmount?: string; unit?: string };
    }>;
    productAvailability?: string[];
    customerFriendlySize?: string;
  }>;
  displayName?: string;
  productCategory?: { name?: string };
  brand?: { name?: string; isOwnBrand?: boolean };
  productLocation?: { availability?: string; location?: string };
  carouselImageUrls?: string[];
  inAssortment?: boolean;
  inventory?: { inventoryState?: string };
  ingredientStatement?: string;
  productDescription?: string;
  preparationInstructions?: string;
  safetyWarning?: string;
  nutritionLabels?: RawNutritionLabel[];
  isAvailableForCheckout?: boolean;
  maximumOrderQuantity?: number;
}

/**
 * Parse nutrition from new label structure.
 */
function parseNutrition(labels?: RawNutritionLabel[]): NutritionInfo | undefined {
  if (!labels || labels.length === 0) return undefined;
  
  const label = labels[0];
  const info: NutritionInfo = {
    servingSize: label.servingSize,
    servingsPerContainer: label.servingsPerContainer,
    calories: label.calories ? parseInt(label.calories) : undefined,
  };
  
  // Extract nutrients by title
  for (const nutrient of (label.nutrients ?? [])) {
    switch (nutrient.title) {
      case 'Total Fat':
        info.totalFat = nutrient.unit;
        // Check for trans/saturated in subItems
        for (const sub of (nutrient.subItems ?? [])) {
          if (sub.title === 'Saturated Fat') info.saturatedFat = sub.unit;
          if (sub.title === 'Trans Fat') info.transFat = sub.unit;
        }
        break;
      case 'Cholesterol':
        info.cholesterol = nutrient.unit;
        break;
      case 'Sodium':
        info.sodium = nutrient.unit;
        break;
      case 'Total Carbohydrate':
        info.totalCarbs = nutrient.unit;
        for (const sub of (nutrient.subItems ?? [])) {
          if (sub.title === 'Dietary Fiber') info.fiber = sub.unit;
          if (sub.title === 'Total Sugars') info.sugars = sub.unit;
        }
        break;
      case 'Protein':
        info.protein = nutrient.unit;
        break;
    }
  }
  
  return info;
}

function resolveStoreId(session: HEBSession): number {
  const storeIdRaw = session.cookies?.CURR_SESSION_STORE;
  if (!storeIdRaw) {
    throw new Error('No store selected. Set CURR_SESSION_STORE before fetching product details.');
  }
  const storeId = Number(storeIdRaw);
  if (!Number.isFinite(storeId) || storeId <= 0) {
    throw new Error(`Invalid storeId: ${storeIdRaw}`);
  }
  return storeId;
}


function mapMobileFulfillment(availability?: string[]): FulfillmentInfo | undefined {
  if (!availability) return undefined;
  return {
    curbside: availability.includes('CURBSIDE_PICKUP'),
    delivery: availability.includes('CURBSIDE_DELIVERY') || availability.includes('DELIVERY'),
    inStore: availability.includes('IN_STORE'),
  };
}

/**
 * Get full product details by product ID.
 * 
 * Uses the mobile GraphQL API which returns comprehensive product info
 * including SKU ID, nutrition, aisle location, and fulfillment options.
 * 
 * @param session - Active HEB bearer session
 * @param productId - Product ID
 * 
 * @example
 * const product = await getProductDetails(session, '1875945');
 * console.log(`${product.name} - SKU: ${product.skuId}`);
 * console.log(`Price: ${product.price?.formatted}`);
 */
export async function getProductDetails(
  session: HEBSession,
  productId: string
): Promise<Product> {
  if (session.authMode !== 'bearer') {
    throw new Error('Product details require a bearer session (mobile GraphQL).');
  }

  return getProductDetailsMobile(session, productId);
}

async function getProductDetailsMobile(session: HEBSession, productId: string): Promise<Product> {
  const storeId = resolveStoreId(session);
  const shoppingContext = resolveShoppingContext(session);

  const response = await persistedQuery<{ productDetailsPage?: MobileProductDetailsResponse['productDetailsPage'] }>(
    session,
    'ProductDetailsPage',
    {
      id: productId,
      isAuthenticated: true,
      shoppingContext,
      storeId: String(storeId),
      storeIdInt: storeId,
    }
  );

  if (response.errors?.length) {
    throw new Error(`Product fetch failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const product = response.data?.productDetailsPage?.product as MobileProduct | undefined;
  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  const sku = product.skus?.find(s => 
    s.productAvailability?.includes('CURBSIDE_PICKUP') || 
    s.productAvailability?.includes('DELIVERY')
  ) ?? product.skus?.[0];
  const preferredContext = getShoppingMode(shoppingContext);
  const priceContext = sku?.contextPrices?.find(p => p.context === preferredContext)
    ?? sku?.contextPrices?.find(p => p.context === 'ONLINE')
    ?? sku?.contextPrices?.[0];

  const priceSource = priceContext?.salePrice ?? priceContext?.listPrice;
  const unitSource = priceContext?.unitSalePrice ?? priceContext?.unitListPrice;

  const images = product.carouselImageUrls?.length ? product.carouselImageUrls : undefined;

  return {
    productId: product.productId ?? productId,
    skuId: sku?.id ?? productId,
    name: product.displayName ?? '',
    brand: product.brand?.name,
    isOwnBrand: product.brand?.isOwnBrand,
    description: product.productDescription,
    longDescription: product.productDescription,
    imageUrl: images?.[0],
    images,
    price: priceSource ? {
      amount: priceSource.amount ?? 0,
      formatted: priceSource.formattedAmount ?? '',
      unitPrice: unitSource ? {
        amount: unitSource.amount ?? 0,
        unit: unitSource.unit ?? '',
        formatted: unitSource.formattedAmount ?? '',
      } : undefined,
    } : undefined,
    nutrition: parseNutrition(product.nutritionLabels),
    fulfillment: mapMobileFulfillment(sku?.productAvailability),
    ingredients: product.ingredientStatement,
    size: sku?.customerFriendlySize,
    category: product.productCategory?.name,
    isAvailable: product.isAvailableForCheckout ?? product.inAssortment,
    inStock: product.inventory?.inventoryState === 'IN_STOCK',
    maxQuantity: product.maximumOrderQuantity,
  };
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
  productId: string
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
