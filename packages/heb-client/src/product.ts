import { nextDataRequest } from './api.js';
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

// Raw response from Next.js data endpoint
interface RawProductResponse {
  pageProps?: {
    product?: {
      // ID fields
      id?: string;
      productId?: string;
      skuId?: string;
      masterSkuId?: string;
      
      // Name fields
      name?: string;
      fullDisplayName?: string;
      
      // Brand can be string or object
      brand?: string | { name?: string; isOwnBrand?: boolean };
      
      // Description
      description?: string;
      productDescription?: string;
      longDescription?: string;
      
      // Images
      image?: { url?: string };
      images?: Array<{ url?: string }>;
      carouselImageUrls?: string[];
      
      // Price
      price?: {
        amount?: number;
        formatted?: string;
        wasPrice?: { amount?: number; formatted?: string };
        unitPrice?: { amount?: number; unit?: string; formatted?: string };
      };
      
      // Nutrition - new structure with labels array
      nutritionLabels?: RawNutritionLabel[];
      
      // Legacy nutrition structure
      nutrition?: {
        servingSize?: string;
        calories?: number;
        totalFat?: string;
        saturatedFat?: string;
        cholesterol?: string;
        sodium?: string;
        totalCarbohydrate?: string;
        dietaryFiber?: string;
        sugars?: string;
        protein?: string;
      };
      
      // Fulfillment
      fulfillment?: {
        curbsideEligible?: boolean;
        deliveryEligible?: boolean;
        inStoreOnly?: boolean;
        aisleLocation?: string;
      };
      
      // Inventory
      inventory?: {
        inventoryState?: string;
      };
      inAssortment?: boolean;
      
      // SKUs array - contains actual SKU IDs for cart operations
      SKUs?: Array<{
        id?: string;
        contextPrices?: Array<{
          context?: string;
          listPrice?: { amount?: number; formattedAmount?: string };
          salePrice?: { amount?: number; formattedAmount?: string };
        }>;
        customerFriendlySize?: string;
        productAvailability?: string[];
      }>;
      
      // Other fields
      ingredientStatement?: string;
      ingredients?: string;
      upc?: string;
      size?: string;
      category?: { name?: string };
      breadcrumbs?: Array<{ title?: string; categoryId?: string }>;
      isAvailable?: boolean;
      maximumOrderQuantity?: number;
      productPageURL?: string;
    };
  };
}

/**
 * Parse brand from various formats.
 */
function parseBrand(brand: unknown): { name?: string; isOwnBrand?: boolean } {
  if (!brand) return {};
  if (typeof brand === 'string') return { name: brand };
  if (typeof brand === 'object' && brand !== null) {
    const b = brand as { name?: string; isOwnBrand?: boolean };
    return { name: b.name, isOwnBrand: b.isOwnBrand };
  }
  return {};
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

/**
 * Get full product details by product ID.
 * 
 * Uses Next.js data endpoint which returns comprehensive product info
 * including SKU ID, nutrition, aisle location, and fulfillment options.
 * 
 * @param session - Active HEB session with buildId
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
  const path = `/en/product-detail/${productId}.json`;
  
  const data = await nextDataRequest<RawProductResponse>(session, path);
  const p = data.pageProps?.product;

  if (!p) {
    throw new Error(`Product ${productId} not found`);
  }

  // Parse brand
  const brandInfo = parseBrand(p.brand);
  
  // SKU ID - extract from SKUs array first (required for cart operations)
  const skuId = p.SKUs?.[0]?.id ?? p.skuId ?? p.masterSkuId ?? p.id ?? productId;
  
  // Name - prefer fullDisplayName
  const name = p.fullDisplayName ?? p.name ?? '';
  
  // Description - prefer productDescription
  const description = p.productDescription ?? p.description;
  
  // Images
  const images = p.carouselImageUrls ?? 
    p.images?.map(img => img.url).filter((u): u is string => Boolean(u)) ??
    (p.image?.url ? [p.image.url] : undefined);
  
  // Category path from breadcrumbs
  const categoryPath = p.breadcrumbs
    ?.filter(b => b.title && b.title !== 'H-E-B')
    ?.map(b => b.title) as string[] | undefined;

  // Price - try legacy structure first, fallback to SKUs array
  const skuPrice = p.SKUs?.[0]?.contextPrices?.find(cp => cp.context === 'CURBSIDE') 
    ?? p.SKUs?.[0]?.contextPrices?.[0];
  const price = p.price ? {
    amount: p.price.amount ?? 0,
    formatted: p.price.formatted ?? '',
    wasPrice: p.price.wasPrice ? {
      amount: p.price.wasPrice.amount ?? 0,
      formatted: p.price.wasPrice.formatted ?? '',
    } : undefined,
    unitPrice: p.price.unitPrice ? {
      amount: p.price.unitPrice.amount ?? 0,
      unit: p.price.unitPrice.unit ?? '',
      formatted: p.price.unitPrice.formatted ?? '',
    } : undefined,
  } : (skuPrice ? {
    amount: skuPrice.listPrice?.amount ?? 0,
    formatted: skuPrice.listPrice?.formattedAmount ?? '',
  } : undefined);

  return {
    productId: p.productId ?? p.id ?? productId,
    skuId,
    name,
    brand: brandInfo.name,
    isOwnBrand: brandInfo.isOwnBrand,
    description,
    longDescription: p.longDescription,
    imageUrl: images?.[0] ?? p.image?.url,
    images,
    price,
    nutrition: parseNutrition(p.nutritionLabels) ?? (p.nutrition ? {
      servingSize: p.nutrition.servingSize,
      calories: p.nutrition.calories,
      totalFat: p.nutrition.totalFat,
      saturatedFat: p.nutrition.saturatedFat,
      cholesterol: p.nutrition.cholesterol,
      sodium: p.nutrition.sodium,
      totalCarbs: p.nutrition.totalCarbohydrate,
      fiber: p.nutrition.dietaryFiber,
      sugars: p.nutrition.sugars,
      protein: p.nutrition.protein,
    } : undefined),
    fulfillment: p.fulfillment ? {
      curbside: p.fulfillment.curbsideEligible ?? false,
      delivery: p.fulfillment.deliveryEligible ?? false,
      inStore: p.fulfillment.inStoreOnly ?? false,
      aisleLocation: p.fulfillment.aisleLocation,
    } : undefined,
    ingredients: p.ingredientStatement ?? p.ingredients,
    upc: p.upc,
    size: p.SKUs?.[0]?.customerFriendlySize ?? p.size,
    category: categoryPath?.at(-1),
    categoryPath,
    isAvailable: p.isAvailable ?? p.inAssortment,
    inStock: p.inventory?.inventoryState === 'IN_STOCK',
    maxQuantity: p.maximumOrderQuantity,
    productUrl: p.productPageURL,
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
