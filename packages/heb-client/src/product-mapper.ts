import { cleanHtml } from "./utils.js";
import { getShoppingMode } from "./session.js";

// ─────────────────────────────────────────────────────────────
// Raw GraphQL Response Types
// ─────────────────────────────────────────────────────────────

export interface RawDisplayPrice {
  unit?: string;
  formattedAmount?: string;
  amount?: number;
}

export interface RawContextPrice {
  context?: string;
  isOnSale?: boolean;
  isPriceCut?: boolean;
  priceType?: string;
  listPrice?: RawDisplayPrice;
  salePrice?: RawDisplayPrice;
  unitListPrice?: RawDisplayPrice;
  unitSalePrice?: RawDisplayPrice;
}

export interface RawNutritionLabel {
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

export interface MobileProduct {
  productId?: string;
  skus?: Array<{
    id?: string;
    contextPrices?: RawContextPrice[];
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

// ─────────────────────────────────────────────────────────────
// Domain Types
// ─────────────────────────────────────────────────────────────

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

export interface FulfillmentInfo {
  curbside: boolean;
  delivery: boolean;
  inStore: boolean;
  aisleLocation?: string;
}

export interface Product {
  productId: string;
  skuId: string;
  name: string;
  brand?: string;
  isOwnBrand?: boolean;
  description?: string;
  longDescription?: string;
  /** Raw HTML description from source */
  rawDescription?: string;
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

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

export function parseNutrition(
  labels?: RawNutritionLabel[],
): NutritionInfo | undefined {
  if (!labels || labels.length === 0) return undefined;

  const label = labels[0];
  const info: NutritionInfo = {
    servingSize: label.servingSize,
    servingsPerContainer: label.servingsPerContainer,
    calories: label.calories ? parseInt(label.calories) : undefined,
  };

  // Extract nutrients by title
  for (const nutrient of label.nutrients ?? []) {
    switch (nutrient.title) {
      case "Total Fat":
        info.totalFat = nutrient.unit;
        // Check for trans/saturated in subItems
        for (const sub of nutrient.subItems ?? []) {
          if (sub.title === "Saturated Fat") info.saturatedFat = sub.unit;
          if (sub.title === "Trans Fat") info.transFat = sub.unit;
        }
        break;
      case "Cholesterol":
        info.cholesterol = nutrient.unit;
        break;
      case "Sodium":
        info.sodium = nutrient.unit;
        break;
      case "Total Carbohydrate":
        info.totalCarbs = nutrient.unit;
        for (const sub of nutrient.subItems ?? []) {
          if (sub.title === "Dietary Fiber") info.fiber = sub.unit;
          if (sub.title === "Total Sugars") info.sugars = sub.unit;
        }
        break;
      case "Protein":
        info.protein = nutrient.unit;
        break;
    }
  }

  return info;
}

export function mapMobileFulfillment(
  availability?: string[],
): FulfillmentInfo | undefined {
  if (!availability) return undefined;
  return {
    curbside: availability.includes("CURBSIDE_PICKUP"),
    delivery:
      availability.includes("CURBSIDE_DELIVERY") ||
      availability.includes("DELIVERY"),
    inStore: availability.includes("IN_STORE"),
  };
}

export function mapMobileProduct(
  product: MobileProduct,
  shoppingContext: string,
  options: { includeImages?: boolean } = {},
): Product {
  const sku =
    product.skus?.find(
      (s) =>
        s.productAvailability?.includes("CURBSIDE_PICKUP") ||
        s.productAvailability?.includes("DELIVERY"),
    ) ?? product.skus?.[0];

  const preferredContext = getShoppingMode(shoppingContext);
  const priceContext =
    sku?.contextPrices?.find((p) => p.context === preferredContext) ??
    sku?.contextPrices?.find((p) => p.context === "ONLINE") ??
    sku?.contextPrices?.[0];

  const priceSource = priceContext?.salePrice ?? priceContext?.listPrice;
  const unitSource = priceContext?.unitSalePrice ?? priceContext?.unitListPrice;

  const includeImages = options.includeImages ?? false;
  const images =
    includeImages && product.carouselImageUrls?.length
      ? product.carouselImageUrls
      : undefined;

  const cleanedDescription = product.productDescription
    ? cleanHtml(product.productDescription)
    : undefined;

  return {
    productId: product.productId ?? "",
    skuId: sku?.id ?? product.productId ?? "",
    name: product.displayName ?? "",
    brand: product.brand?.name,
    isOwnBrand: product.brand?.isOwnBrand,
    description: cleanedDescription,
    longDescription: cleanedDescription,
    rawDescription: product.productDescription,
    imageUrl: images?.[0],
    images,
    price: priceSource
      ? {
          amount: priceSource.amount ?? 0,
          formatted: priceSource.formattedAmount ?? "",
          unitPrice: unitSource
            ? {
                amount: unitSource.amount ?? 0,
                unit: unitSource.unit ?? "",
                formatted: unitSource.formattedAmount ?? "",
              }
            : undefined,
        }
      : undefined,
    nutrition: parseNutrition(product.nutritionLabels),
    fulfillment: mapMobileFulfillment(sku?.productAvailability),
    ingredients: product.ingredientStatement,
    size: sku?.customerFriendlySize,
    category: product.productCategory?.name,
    isAvailable:
      product.isAvailableForCheckout ??
      product.inAssortment ??
      product.inventory?.inventoryState === "IN_STOCK",
    inStock: product.inventory?.inventoryState === "IN_STOCK",
    maxQuantity: product.maximumOrderQuantity,
  };
}
