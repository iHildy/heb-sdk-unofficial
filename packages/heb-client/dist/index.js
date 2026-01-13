// src/types.ts
var GRAPHQL_HASHES = {
  cartItemV2: "ade8ec1365c185244d42f9cc4c13997fec4b633ac3c38ff39558df92b210c6d0",
  typeaheadContent: "1ed956c0f10efcfc375321f33c40964bc236fff1397a4e86b7b53cb3b18ad329",
  ModifiableOrderDetailsRequest: "24fe4f6d8f4d3ae8927af0a7d07b8c57abcb303cdd277cd9bb4e022ca1d33b8e",
  ReserveTimeslot: "8b4800e25b070c15448237c7138530f1e1b3655ad3745a814cd5226c144da524",
  listDeliveryTimeslotsV2: "2085a738c42670ed52a42ab190b1f5ae178bb22ac444838e5d1c810cb6e4bf3c",
  listPickupTimeslotsV2: "7f9e10c23b1415ebf350493414b2e55e18c81c63f0571cf35f8dd155c9f3a9a0",
  StoreSearch: "e01fa39e66c3a2c7881322bc48af6a5af97d49b1442d433f2d09d273de2db4b6",
  SelectPickupFulfillment: "8fa3c683ee37ad1bab9ce22b99bd34315b2a89cfc56208d63ba9efc0c49a6323"
};
var ENDPOINTS = {
  graphql: "https://www.heb.com/graphql",
  login: "https://www.heb.com/sign-in",
  home: "https://www.heb.com/"
};

// src/api.ts
var ERROR_CODES = {
  INVALID_PRODUCT_STORE: "INVALID_PRODUCT_STORE",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND"
};
async function graphqlRequest(session, payload) {
  const response = await fetch(ENDPOINTS.graphql, {
    method: "POST",
    headers: session.headers,
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HEB API request failed: ${response.status} ${response.statusText}
${body}`);
  }
  return response.json();
}
async function persistedQuery(session, operationName, variables) {
  const hash = GRAPHQL_HASHES[operationName];
  if (!hash) {
    throw new Error(`Unknown operation: ${operationName}. Available: ${Object.keys(GRAPHQL_HASHES).join(", ")}`);
  }
  return graphqlRequest(session, {
    operationName,
    variables,
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: hash
      }
    }
  });
}
async function nextDataRequest(session, path) {
  if (!session.buildId) {
    throw new Error("Session buildId required for Next.js data requests. Re-fetch session or provide buildId.");
  }
  const url = `${ENDPOINTS.home}_next/data/${session.buildId}${path}`;
  const headers = {
    ...session.headers,
    "x-nextjs-data": "1"
  };
  const response = await fetch(url, {
    method: "GET",
    headers
  });
  if (!response.ok) {
    throw new Error(`Next.js data request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
function hasErrorCode(response, code) {
  return response.errors?.some((e) => e.extensions?.code === code) ?? false;
}
function getErrorMessages(response) {
  return response.errors?.map((e) => e.message) ?? [];
}

// src/cart.ts
function isCartError(data) {
  return typeof data === "object" && data !== null && "__typename" in data && data.__typename === "AddItemToCartV2Error";
}
function parseCartResponse(response) {
  if (response.errors?.length) {
    if (hasErrorCode(response, ERROR_CODES.INVALID_PRODUCT_STORE)) {
      return {
        success: false,
        errors: ["Product not available at your selected store. Check CURR_SESSION_STORE cookie."]
      };
    }
    if (hasErrorCode(response, ERROR_CODES.UNAUTHORIZED)) {
      return {
        success: false,
        errors: ["Session expired or not logged in. Re-authenticate to continue."]
      };
    }
    return {
      success: false,
      errors: response.errors.map((e) => e.message)
    };
  }
  const data = response.data?.addItemToCartV2;
  if (!data) {
    return {
      success: false,
      errors: ["No response from cart API"]
    };
  }
  if (isCartError(data)) {
    return {
      success: false,
      errors: [data.message || data.title || `Cart error: ${data.code}`]
    };
  }
  const cart = data;
  const items = (cart.commerceItems ?? []).map((item) => ({
    productId: item.productId ?? "",
    skuId: item.skuId ?? "",
    name: item.displayName,
    quantity: item.quantity ?? 0,
    price: item.price ? {
      amount: item.price.amount ?? 0,
      formatted: item.price.formattedAmount ?? ""
    } : void 0,
    imageUrl: item.productImage?.url
  }));
  return {
    success: true,
    cart: {
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: cart.price?.subtotal ? {
        amount: cart.price.subtotal.amount ?? 0,
        formatted: cart.price.subtotal.formattedAmount ?? ""
      } : void 0
    }
  };
}
async function addToCart(session, productId, skuId, quantity) {
  const isLoggedIn = Boolean(session.cookies.sat);
  const response = await persistedQuery(
    session,
    "cartItemV2",
    {
      userIsLoggedIn: isLoggedIn,
      productId,
      skuId,
      quantity
    }
  );
  return parseCartResponse(response);
}
var updateCartItem = addToCart;
async function removeFromCart(session, productId, skuId) {
  return addToCart(session, productId, skuId, 0);
}
async function quickAdd(session, productId, skuId) {
  return addToCart(session, productId, skuId, 1);
}

// src/utils.ts
function formatExpiryTime(isoString) {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, "0");
  return `${hours}:${minuteStr}${ampm}`;
}

// src/curbside.ts
async function getCurbsideSlots(session, options) {
  const { storeNumber, days = 14 } = options;
  const response = await persistedQuery(
    session,
    "listPickupTimeslotsV2",
    {
      storeNumber: Number(storeNumber),
      limit: days > 0 ? 2147483647 : 14
      // HEB uses max int for "all slots"
    }
  );
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  const result = response.data?.listPickupTimeslotsV2;
  if (result?.__typename === "TimeslotsStandardErrorV2") {
    throw new Error(result.message || "Failed to fetch curbside slots");
  }
  const slotsByDay = result?.slotsByDay;
  if (!slotsByDay || !Array.isArray(slotsByDay)) {
    return [];
  }
  const slots = [];
  for (const day of slotsByDay) {
    const slotsByGroup = day.slotsByGroup || [];
    for (const group of slotsByGroup) {
      if (group.slots && Array.isArray(group.slots)) {
        for (const slot of group.slots) {
          slots.push({
            slotId: slot.id,
            date: new Date(day.date),
            startTime: slot.start || "",
            endTime: slot.end || "",
            fee: slot.totalPrice?.amount || 0,
            isAvailable: !slot.isFull,
            raw: slot
          });
        }
      }
    }
  }
  return slots;
}
async function reserveCurbsideSlot(session, slotId, date, storeId) {
  const variables = {
    id: slotId,
    date,
    fulfillmentType: "PICKUP",
    pickupStoreId: storeId,
    ignoreCartConflicts: false,
    storeId: parseInt(storeId, 10),
    userIsLoggedIn: true
  };
  const response = await persistedQuery(
    session,
    "ReserveTimeslot",
    variables
  );
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  const result = response.data?.reserveTimeslotV3;
  if (!result) {
    throw new Error("No data returned from reserveTimeslotV3");
  }
  if (result.__typename === "ReserveTimeslotErrorV3") {
    throw new Error(result.message || "Failed to reserve slot");
  }
  const timeslot = result.timeslot;
  const expiresAt = timeslot?.expiry || timeslot?.expiryDateTime;
  const expiresAtFormatted = expiresAt ? formatExpiryTime(expiresAt) : void 0;
  const deadlineMessage = expiresAtFormatted ? `Place your order by ${expiresAtFormatted} to keep this time` : void 0;
  return {
    success: true,
    orderId: result.id,
    expiresAt,
    expiresAtFormatted,
    deadlineMessage,
    raw: result
  };
}

// src/delivery.ts
async function getDeliverySlots(session, options = {}) {
  const { address, days = 14 } = options;
  if (!address) {
    throw new Error("Address is required to fetch delivery slots");
  }
  const response = await persistedQuery(
    session,
    "listDeliveryTimeslotsV2",
    {
      address,
      limit: days
    }
  );
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  const slotsByDay = response.data?.listDeliveryTimeslotsV2?.slotsByDay;
  if (!slotsByDay || !Array.isArray(slotsByDay)) {
    return [];
  }
  const slots = [];
  for (const day of slotsByDay) {
    if (day.slots && Array.isArray(day.slots)) {
      for (const slot of day.slots) {
        slots.push({
          slotId: slot.id,
          date: new Date(day.date),
          startTime: slot.startTime || slot.start,
          endTime: slot.endTime || slot.end,
          fee: slot.totalPrice?.amount || 0,
          isAvailable: !slot.isFull,
          raw: slot
        });
      }
    }
  }
  return slots;
}
async function reserveSlot(session, slotId, date, address, storeId) {
  const variables = {
    id: slotId,
    date,
    fulfillmentType: "DELIVERY",
    deliveryAddress: address,
    ignoreCartConflicts: false,
    storeId: parseInt(storeId, 10),
    userIsLoggedIn: true
  };
  const response = await persistedQuery(
    session,
    "ReserveTimeslot",
    variables
  );
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  const result = response.data?.reserveTimeslotV3;
  if (!result) {
    throw new Error("No data returned from reserveTimeslotV3");
  }
  const timeslot = result.timeslot;
  const expiresAt = timeslot?.expiry || timeslot?.expiryDateTime;
  const expiresAtFormatted = expiresAt ? formatExpiryTime(expiresAt) : void 0;
  const deadlineMessage = expiresAtFormatted ? `Place your order by ${expiresAtFormatted} to keep this time` : void 0;
  return {
    success: true,
    orderId: result.id,
    expiresAt,
    expiresAtFormatted,
    deadlineMessage,
    raw: result
  };
}

// src/orders.ts
async function getOrders(session, options = {}) {
  const page = options.page || 1;
  const path = `/en/my-account/your-orders.json?page=${page}`;
  const data = await nextDataRequest(session, path);
  const rawOrders = data.pageProps.orders;
  return rawOrders.map((o) => ({
    orderId: o.orderId,
    orderDate: new Date(o.orderTimeslot.startTime),
    status: o.orderStatusMessageShort,
    items: [],
    // Details not available in list view
    subtotal: 0,
    // Not available in list view
    total: parseFloat(o.totalPrice.formattedAmount.replace("$", "")),
    storeName: o.store.name,
    fulfillmentType: o.fulfillmentType
  }));
}
async function getOrder(session, orderId) {
  const response = await persistedQuery(
    session,
    "ModifiableOrderDetailsRequest",
    { orderId }
  );
  const orderData = response.data?.orderDetailsRequest?.order;
  if (!orderData) {
    throw new Error(`Order ${orderId} not found`);
  }
  return {
    orderId: orderData.orderId,
    orderDate: /* @__PURE__ */ new Date(),
    // Date not readily available in this query, would need to fetch from list or other field
    status: orderData.status,
    subtotal: parseFloat(orderData.priceDetails.subtotal.formattedAmount.replace("$", "")),
    total: parseFloat(orderData.priceDetails.total.formattedAmount.replace("$", "")),
    items: orderData.orderItems.map((item) => ({
      productId: item.product.id,
      skuId: item.product.SKUs[0]?.id || "",
      name: item.product.fullDisplayName,
      quantity: item.quantity,
      price: item.totalUnitPrice.amount,
      imageUrl: item.product.thumbnailImageUrls.find((img) => img.size === "SMALL")?.url
    }))
  };
}

// src/product.ts
function parseBrand(brand) {
  if (!brand) return {};
  if (typeof brand === "string") return { name: brand };
  if (typeof brand === "object" && brand !== null) {
    const b = brand;
    return { name: b.name, isOwnBrand: b.isOwnBrand };
  }
  return {};
}
function parseNutrition(labels) {
  if (!labels || labels.length === 0) return void 0;
  const label = labels[0];
  const info = {
    servingSize: label.servingSize,
    servingsPerContainer: label.servingsPerContainer,
    calories: label.calories ? parseInt(label.calories) : void 0
  };
  for (const nutrient of label.nutrients ?? []) {
    switch (nutrient.title) {
      case "Total Fat":
        info.totalFat = nutrient.unit;
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
async function getProductDetails(session, productId) {
  const path = `/en/product-detail/${productId}.json`;
  const data = await nextDataRequest(session, path);
  const p = data.pageProps?.product;
  if (!p) {
    throw new Error(`Product ${productId} not found`);
  }
  const brandInfo = parseBrand(p.brand);
  const skuId = p.SKUs?.[0]?.id ?? p.skuId ?? p.masterSkuId ?? p.id ?? productId;
  const name = p.fullDisplayName ?? p.name ?? "";
  const description = p.productDescription ?? p.description;
  const images = p.carouselImageUrls ?? p.images?.map((img) => img.url).filter((u) => Boolean(u)) ?? (p.image?.url ? [p.image.url] : void 0);
  const categoryPath = p.breadcrumbs?.filter((b) => b.title && b.title !== "H-E-B")?.map((b) => b.title);
  const skuPrice = p.SKUs?.[0]?.contextPrices?.find((cp) => cp.context === "CURBSIDE") ?? p.SKUs?.[0]?.contextPrices?.[0];
  const price = p.price ? {
    amount: p.price.amount ?? 0,
    formatted: p.price.formatted ?? "",
    wasPrice: p.price.wasPrice ? {
      amount: p.price.wasPrice.amount ?? 0,
      formatted: p.price.wasPrice.formatted ?? ""
    } : void 0,
    unitPrice: p.price.unitPrice ? {
      amount: p.price.unitPrice.amount ?? 0,
      unit: p.price.unitPrice.unit ?? "",
      formatted: p.price.unitPrice.formatted ?? ""
    } : void 0
  } : skuPrice ? {
    amount: skuPrice.listPrice?.amount ?? 0,
    formatted: skuPrice.listPrice?.formattedAmount ?? ""
  } : void 0;
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
      protein: p.nutrition.protein
    } : void 0),
    fulfillment: p.fulfillment ? {
      curbside: p.fulfillment.curbsideEligible ?? false,
      delivery: p.fulfillment.deliveryEligible ?? false,
      inStore: p.fulfillment.inStoreOnly ?? false,
      aisleLocation: p.fulfillment.aisleLocation
    } : void 0,
    ingredients: p.ingredientStatement ?? p.ingredients,
    upc: p.upc,
    size: p.SKUs?.[0]?.customerFriendlySize ?? p.size,
    category: categoryPath?.at(-1),
    categoryPath,
    isAvailable: p.isAvailable ?? p.inAssortment,
    inStock: p.inventory?.inventoryState === "IN_STOCK",
    maxQuantity: p.maximumOrderQuantity,
    productUrl: p.productPageURL
  };
}
async function getProductSkuId(session, productId) {
  const product = await getProductDetails(session, productId);
  if (!product.skuId) {
    throw new Error(`SKU ID not found for product ${productId}`);
  }
  return product.skuId;
}
function getProductImageUrl(productId, size = 360) {
  return `https://images.heb.com/is/image/HEBGrocery/${productId}?hei=${size}&wid=${size}`;
}

// src/search.ts
async function searchProducts(session, query, options = {}) {
  const { page = 1, filters = [] } = options;
  const payload = {
    operationName: "searchProductQuery",
    variables: {
      query,
      page,
      filters
    },
    extensions: {
      persistedQuery: {
        version: 1,
        // This hash changes per build - may need to be updated
        sha256Hash: "DYNAMIC_HASH_REQUIRED"
      }
    }
  };
  const response = await graphqlRequest(session, payload);
  if (response.errors) {
    const notFoundError = response.errors.find(
      (e) => e.message?.includes("PersistedQueryNotFound")
    );
    if (notFoundError) {
      throw new Error(
        "Search query hash not found. The hash changes per site build. Use searchSSR() instead for reliable search functionality."
      );
    }
    throw new Error(`Search failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const data = response.data?.searchProducts;
  return {
    products: (data?.products ?? []).map((p) => ({
      productId: p.productId ?? "",
      name: p.name ?? "",
      brand: p.brand,
      description: p.description,
      imageUrl: p.image?.url,
      price: p.price ? {
        amount: p.price.amount ?? 0,
        formatted: p.price.formatted ?? ""
      } : void 0,
      unitPrice: p.unitPrice ? {
        amount: p.unitPrice.amount ?? 0,
        unit: p.unitPrice.unit ?? "",
        formatted: p.unitPrice.formatted ?? ""
      } : void 0,
      skuId: p.skuId,
      isAvailable: p.isAvailable,
      fulfillmentOptions: p.fulfillment
    })),
    totalCount: data?.totalCount ?? 0,
    page,
    hasNextPage: data?.pageInfo?.hasNextPage ?? false,
    facets: data?.facets?.map((f) => ({
      key: f.key ?? "",
      label: f.label ?? "",
      values: (f.values ?? []).map((v) => ({
        value: v.value ?? "",
        count: v.count ?? 0
      }))
    }))
  };
}
async function searchSSR(session, query, limit = 20) {
  const searchUrl = `${ENDPOINTS.home}search?q=${encodeURIComponent(query)}`;
  const response = await fetch(searchUrl, {
    method: "GET",
    headers: {
      ...session.headers,
      "accept": "text/html,application/xhtml+xml"
    }
  });
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const pattern = /product-detail\/([^"\/]+)\/(\d+)/g;
  const matches = [...html.matchAll(pattern)];
  const seen = /* @__PURE__ */ new Set();
  const products = [];
  for (const match of matches) {
    const [, slug, productId] = match;
    if (seen.has(productId)) continue;
    seen.add(productId);
    const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/Nbsp/gi, "");
    products.push({
      productId,
      name,
      slug,
      imageUrl: `https://images.heb.com/is/image/HEBGrocery/${productId}?hei=360&wid=360`
    });
    if (products.length >= limit) break;
  }
  return products;
}
async function typeahead(session, query) {
  const response = await persistedQuery(
    session,
    "typeaheadContent",
    { query }
  );
  if (response.errors) {
    throw new Error(`Typeahead failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const data = response.data?.typeaheadContent;
  const recentSearches = [];
  const trendingSearches = [];
  if (data?.verticalStack) {
    for (const item of data.verticalStack) {
      if (item.recentSearchTerms) {
        recentSearches.push(...item.recentSearchTerms);
      }
      if (item.trendingSearches) {
        trendingSearches.push(...item.trendingSearches);
      }
    }
  }
  if (data?.suggestions) {
    for (const s of data.suggestions) {
      if (s.term) {
        trendingSearches.push(s.term);
      }
    }
  }
  return {
    recentSearches,
    trendingSearches,
    allTerms: [...recentSearches, ...trendingSearches]
  };
}
async function typeaheadTerms(session, query) {
  const result = await typeahead(session, query);
  return result.allTerms;
}

// src/session.ts
var CLIENT_NAME = "WebPlatform-Solar (Production)";
function formatCookieHeader(cookies) {
  return Object.entries(cookies).filter(([_, value]) => value !== void 0).map(([name, value]) => `${name}=${value}`).join("; ");
}
function buildHeaders(cookies, buildId) {
  return {
    "apollographql-client-name": CLIENT_NAME,
    "apollographql-client-version": buildId ?? "unknown",
    cookie: formatCookieHeader(cookies),
    "content-type": "application/json"
  };
}
function parseJwtExpiry(sat) {
  try {
    const [, payload] = sat.split(".");
    if (!payload) return void 0;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );
    if (typeof decoded.exp === "number") {
      return new Date(decoded.exp * 1e3);
    }
  } catch {
  }
  return void 0;
}
function isSessionValid(session) {
  if (!session.expiresAt) {
    return Boolean(session.cookies.sat);
  }
  const bufferMs = 60 * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() < session.expiresAt.getTime() - bufferMs;
}
function createSession(cookies, buildId) {
  return {
    cookies,
    headers: buildHeaders(cookies, buildId),
    expiresAt: parseJwtExpiry(cookies.sat),
    buildId
  };
}
async function fetchBuildId(cookies) {
  const response = await fetch(ENDPOINTS.home, {
    method: "GET",
    headers: {
      ...buildHeaders(cookies),
      "accept": "text/html,application/xhtml+xml"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch homepage for buildId: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  if (!match || !match[1]) {
    throw new Error("Could not find __NEXT_DATA__ in homepage HTML");
  }
  try {
    const data = JSON.parse(match[1]);
    if (typeof data.buildId === "string") {
      return data.buildId;
    }
    throw new Error("buildId not found in __NEXT_DATA__");
  } catch (e) {
    throw new Error(`Failed to parse __NEXT_DATA__ JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// src/stores.ts
async function searchStores(session, query, radius = 100) {
  const payload = {
    operationName: "StoreSearch",
    variables: {
      address: query,
      radius,
      fulfillmentChannels: [],
      includeEcommInactive: false,
      retailFormatCodes: ["P", "NP"]
    },
    extensions: {
      persistedQuery: {
        version: 1,
        // Hash from types.ts or hardcoded if necessary, but prefer importing if possible or using the one found
        sha256Hash: "e01fa39e66c3a2c7881322bc48af6a5af97d49b1442d433f2d09d273de2db4b6"
      }
    }
  };
  const response = await graphqlRequest(session, payload);
  if (response.errors) {
    throw new Error(`Store search failed: ${response.errors.map((e) => e.message).join(", ")}`);
  }
  const stores = response.data?.searchStoresByAddress?.stores || [];
  return stores.map((s) => ({
    storeNumber: String(s.store.storeNumber),
    name: s.store.name,
    address: {
      streetAddress: s.store.address.streetAddress,
      city: s.store.address.locality,
      state: s.store.address.region,
      zip: s.store.address.postalCode
    },
    distanceMiles: s.distanceMiles
  }));
}
async function setStore(session, storeId) {
  session.cookies.CURR_SESSION_STORE = storeId;
  const payload = {
    operationName: "SelectPickupFulfillment",
    variables: {
      fulfillmentType: "PICKUP",
      pickupStoreId: storeId,
      ignoreCartConflicts: false,
      storeId: Number(storeId),
      userIsLoggedIn: true
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: "8fa3c683ee37ad1bab9ce22b99bd34315b2a89cfc56208d63ba9efc0c49a6323"
      }
    }
  };
  try {
    const response = await graphqlRequest(session, payload);
    if (response.errors) {
      console.warn("Set store server request failed, but cookie was updated:", response.errors);
    }
  } catch (error) {
    console.warn("Set store server request failed, but cookie was updated:", error);
  }
}

// src/client.ts
var HEBClient = class {
  constructor(session) {
    this.session = session;
  }
  /**
   * Check if the session is still valid.
   */
  isValid() {
    return isSessionValid(this.session);
  }
  /**
   * Ensure the session has a valid buildId.
   * Fetches it if missing.
   */
  async ensureBuildId() {
    if (this.session.buildId) {
      return;
    }
    try {
      const buildId = await fetchBuildId(this.session.cookies);
      if (buildId) {
        this.session.buildId = buildId;
        this.session.headers = buildHeaders(this.session.cookies, buildId);
      }
    } catch (error) {
      console.warn("Failed to fetch buildId, continuing with unknown version:", error);
    }
  }
  // ─────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────
  /**
   * Search for products using SSR (Server-Side Rendered) search.
   * 
   * This is the most reliable search method as it doesn't require
   * dynamic GraphQL hashes. Parses product URLs from HTML results.
   * 
   * @param query - Search query
   * @param limit - Max results (default: 20)
   * 
   * @example
   * const products = await heb.searchSSR('cinnamon rolls');
   * console.log(`Found ${products.length} products`);
   * products.forEach(p => console.log(`${p.name} (${p.productId})`));
   */
  async searchSSR(query, limit) {
    return searchSSR(this.session, query, limit);
  }
  /**
   * Search for products using GraphQL.
   * 
   * Note: Requires dynamic hash - may fail if hash is outdated.
   * Use `searchSSR()` for more reliable results.
   * 
   * @deprecated Prefer searchSSR() for reliability
   */
  async search(query, options) {
    return searchProducts(this.session, query, options);
  }
  /**
   * Get typeahead/autocomplete suggestions.
   * 
   * Returns recent searches and trending searches.
   * Note: These are search terms, not product results.
   * 
   * @example
   * const result = await heb.typeahead('milk');
   * console.log('Recent:', result.recentSearches);
   * console.log('Trending:', result.trendingSearches);
   */
  async typeahead(query) {
    return typeahead(this.session, query);
  }
  /**
   * Get typeahead terms as a flat array.
   * 
   * @deprecated Use typeahead() for categorized results.
   */
  async typeaheadTerms(query) {
    return typeaheadTerms(this.session, query);
  }
  // ─────────────────────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────────────────────
  /**
   * Get full product details.
   * 
   * @example
   * const product = await heb.getProduct('1875945');
   * console.log(product.name);        // H-E-B Bakery Two-Bite Cinnamon Rolls
   * console.log(product.brand);       // H-E-B
   * console.log(product.inStock);     // true
   * console.log(product.nutrition);   // { calories: 210, ... }
   */
  async getProduct(productId) {
    return getProductDetails(this.session, productId);
  }
  /**
   * Get SKU ID for a product.
   */
  async getSkuId(productId) {
    return getProductSkuId(this.session, productId);
  }
  /**
   * Get product image URL.
   */
  getImageUrl(productId, size) {
    return getProductImageUrl(productId, size);
  }
  // ─────────────────────────────────────────────────────────────
  // Cart
  // ─────────────────────────────────────────────────────────────
  /**
   * Add or update item in cart.
   * 
   * @param productId - Product ID
   * @param skuId - SKU ID (get from getProduct or getSkuId)
   * @param quantity - Quantity to set (not add)
   * 
   * @example
   * const product = await heb.getProduct('1875945');
   * await heb.addToCart(product.productId, product.skuId, 2);
   */
  async addToCart(productId, skuId, quantity) {
    return addToCart(this.session, productId, skuId, quantity);
  }
  /**
   * Update cart item quantity.
   */
  async updateCartItem(productId, skuId, quantity) {
    return updateCartItem(this.session, productId, skuId, quantity);
  }
  /**
   * Remove item from cart.
   */
  async removeFromCart(productId, skuId) {
    return removeFromCart(this.session, productId, skuId);
  }
  /**
   * Quick add - set quantity to 1.
   */
  async quickAdd(productId, skuId) {
    return quickAdd(this.session, productId, skuId);
  }
  /**
   * Add to cart by product ID only.
   * Fetches SKU ID automatically.
   * 
   * @example
   * // Simplest way to add a product
   * await heb.addToCartById('1875945', 2);
   */
  async addToCartById(productId, quantity) {
    const skuId = await this.getSkuId(productId);
    return this.addToCart(productId, skuId, quantity);
  }
  // ─────────────────────────────────────────────────────────────
  // Orders
  // ─────────────────────────────────────────────────────────────
  /**
   * Get order history.
   * 
   * @example
   * const orders = await heb.getOrders({ page: 1 });
   * console.log(`Found ${orders.length} orders`);
   */
  async getOrders(options = {}) {
    return getOrders(this.session, options);
  }
  /**
   * Get filtered order history.
   * 
   * @param orderId - Order ID
   * @returns Order details
   */
  async getOrder(orderId) {
    return getOrder(this.session, orderId);
  }
  // ─────────────────────────────────────────────────────────────
  // Delivery
  // ─────────────────────────────────────────────────────────────
  /**
   * Get available delivery slots.
   */
  async getDeliverySlots(options = {}) {
    return getDeliverySlots(this.session, options);
  }
  /**
   * Reserve a delivery slot.
   */
  async reserveSlot(slotId, date, address, storeId) {
    return reserveSlot(this.session, slotId, date, address, storeId);
  }
  // ─────────────────────────────────────────────────────────────
  // Curbside Pickup
  // ─────────────────────────────────────────────────────────────
  /**
   * Get available curbside pickup slots for a store.
   * 
   * @param options - Options with storeNumber (required)
   * @example
   * const slots = await heb.getCurbsideSlots({ storeNumber: 790 });
   * slots.forEach(s => console.log(`${s.date.toLocaleDateString()} ${s.startTime}-${s.endTime}`));
   */
  async getCurbsideSlots(options) {
    return getCurbsideSlots(this.session, options);
  }
  /**
   * Reserve a curbside pickup slot.
   * 
   * @param slotId - Slot ID from getCurbsideSlots
   * @param date - Date (YYYY-MM-DD)
   * @param storeId - Store ID
   */
  async reserveCurbsideSlot(slotId, date, storeId) {
    return reserveCurbsideSlot(this.session, slotId, date, storeId);
  }
  // ─────────────────────────────────────────────────────────────
  // Stores
  // ─────────────────────────────────────────────────────────────
  /**
   * Search for H-E-B stores.
   * 
   * @param query - Address, zip, or city (e.g. "78701", "Austin")
   * @example
   * const stores = await heb.searchStores('78701');
   * console.log(`Found ${stores.length} stores`);
   */
  async searchStores(query) {
    return searchStores(this.session, query);
  }
  /**
   * Set the active store for the session.
   * 
   * This updates the session cookie and makes a server request to
   * set the fulfillment context.
   * 
   * @param storeId - Store ID (e.g. "790")
   */
  async setStore(storeId) {
    return setStore(this.session, storeId);
  }
};

// src/auth.ts
import { chromium } from "playwright";
var DEFAULT_TIMEOUT = 6e4;
function getCredentialsFromEnv() {
  const email = process.env.HEB_EMAIL;
  const password = process.env.HEB_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}
async function extractCookies(context) {
  const allCookies = await context.cookies();
  const cookies = {
    sat: "",
    reese84: "",
    incap_ses: ""
  };
  for (const cookie of allCookies) {
    if (cookie.name === "sat") {
      cookies.sat = cookie.value;
    } else if (cookie.name === "reese84") {
      cookies.reese84 = cookie.value;
    } else if (cookie.name.startsWith("incap_ses")) {
      cookies.incap_ses = cookie.value;
      cookies[cookie.name] = cookie.value;
    } else if (cookie.name === "CURR_SESSION_STORE") {
      cookies.CURR_SESSION_STORE = cookie.value;
    } else {
      cookies[cookie.name] = cookie.value;
    }
  }
  return cookies;
}
async function extractBuildId(page) {
  try {
    const buildId = await page.evaluate(() => {
      const nextData = document.getElementById("__NEXT_DATA__");
      if (nextData) {
        const data = JSON.parse(nextData.textContent || "{}");
        return data.buildId;
      }
      return void 0;
    });
    return buildId;
  } catch {
    return void 0;
  }
}
async function login(credentials, options = {}) {
  const creds = credentials ?? getCredentialsFromEnv();
  if (!creds) {
    throw new Error(
      "Credentials required. Pass { email, password } or set HEB_EMAIL and HEB_PASSWORD env vars."
    );
  }
  const { headless = true, timeout = DEFAULT_TIMEOUT, storeId, userDataDir } = options;
  let browser;
  let context;
  let page;
  if (userDataDir) {
    console.log("[HEB SDK] Using persistent context with user profile...");
    context = await chromium.launchPersistentContext(userDataDir, {
      headless,
      channel: "chrome",
      viewport: { width: 1280, height: 720 },
      locale: "en-US",
      timezoneId: "America/Chicago"
    });
    page = context.pages()[0] || await context.newPage();
    browser = null;
  } else {
    console.log("[HEB SDK] Launching browser...");
    browser = await chromium.launch({
      headless,
      channel: "chrome"
    });
    context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
      locale: "en-US",
      timezoneId: "America/Chicago"
    });
    page = await context.newPage();
  }
  try {
    console.log("[HEB SDK] Visiting homepage to establish session...");
    await page.goto(ENDPOINTS.home, { timeout, waitUntil: "networkidle" });
    await page.waitForTimeout(2e3);
    console.log("[HEB SDK] Navigating to login page...");
    await page.goto(ENDPOINTS.login, { timeout, waitUntil: "networkidle" });
    console.log("[HEB SDK] Waiting for login form...");
    await page.waitForSelector('input[name="login"], input[type="email"], input#login', { timeout });
    console.log("[HEB SDK] Entering email...");
    const emailInput = page.locator('input[name="login"], input[type="email"], input#login').first();
    await emailInput.fill(creds.email);
    await page.click('button[type="submit"]');
    console.log("[HEB SDK] Waiting for password field...");
    await page.waitForSelector('input[name="password"], input[type="password"]', { timeout });
    await page.waitForTimeout(500);
    console.log("[HEB SDK] Entering password...");
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(creds.password);
    await page.click('button[type="submit"]');
    console.log("[HEB SDK] Waiting for login completion...");
    await page.waitForURL((url) => url.hostname.includes("heb.com") && !url.hostname.includes("accounts.heb.com"), { timeout });
    await page.waitForTimeout(1e3);
    if (storeId) {
      await context.addCookies([{
        name: "CURR_SESSION_STORE",
        value: storeId,
        domain: ".heb.com",
        path: "/"
      }]);
    }
    const cookies = await extractCookies(context);
    const buildId = await extractBuildId(page);
    if (!cookies.sat) {
      throw new Error("Login succeeded but sat cookie not found. Auth may have failed.");
    }
    console.log("[HEB SDK] Login successful!");
    return createSession(cookies, buildId);
  } finally {
    if (browser) {
      await browser.close();
    } else {
      await context.close();
    }
  }
}
async function extractSession(context, page) {
  const cookies = await extractCookies(context);
  const buildId = page ? await extractBuildId(page) : void 0;
  if (!cookies.sat) {
    throw new Error("No sat cookie found. User may not be logged in.");
  }
  return createSession(cookies, buildId);
}

// src/cookies.ts
function parseCookies(input) {
  const cookies = {
    sat: "",
    reese84: "",
    incap_ses: ""
  };
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      for (const cookie of parsed) {
        const name = cookie.name || cookie.Name;
        const value = cookie.value || cookie.Value;
        if (!name || !value) continue;
        assignCookie(cookies, name, value);
      }
      return cookies;
    }
  } catch {
  }
  const pairs = input.split(/;\s*/);
  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const name = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    assignCookie(cookies, name, value);
  }
  return cookies;
}
function assignCookie(cookies, name, value) {
  if (name === "sat") {
    cookies.sat = value;
  } else if (name === "reese84") {
    cookies.reese84 = value;
  } else if (name.startsWith("incap_ses")) {
    cookies.incap_ses = value;
    cookies[name] = value;
  } else if (name === "CURR_SESSION_STORE") {
    cookies.CURR_SESSION_STORE = value;
  } else {
    cookies[name] = value;
  }
}
function createSessionFromCookies(cookieInput, buildId) {
  const cookies = parseCookies(cookieInput);
  if (!cookies.sat) {
    throw new Error("No sat cookie found in input. Make sure you are logged in.");
  }
  return createSession(cookies, buildId);
}

// src/errors.ts
var HEBError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "HEBError";
  }
};
var HEBAuthError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBAuthError";
  }
};
var HEBSessionError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBSessionError";
  }
};
var HEBCartError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBCartError";
  }
};
var HEBProductError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBProductError";
  }
};
var HEBSearchError = class extends HEBError {
  constructor(message, code) {
    super(message, code);
    this.name = "HEBSearchError";
  }
};
export {
  ENDPOINTS,
  ERROR_CODES,
  GRAPHQL_HASHES,
  HEBAuthError,
  HEBCartError,
  HEBClient,
  HEBError,
  HEBProductError,
  HEBSearchError,
  HEBSessionError,
  addToCart,
  buildHeaders,
  createSession,
  createSessionFromCookies,
  extractSession,
  formatCookieHeader,
  getCredentialsFromEnv,
  getCurbsideSlots,
  getDeliverySlots,
  getErrorMessages,
  getOrder,
  getOrders,
  getProductDetails,
  getProductImageUrl,
  getProductSkuId,
  graphqlRequest,
  hasErrorCode,
  isSessionValid,
  login,
  nextDataRequest,
  parseCookies,
  parseJwtExpiry,
  persistedQuery,
  quickAdd,
  removeFromCart,
  reserveCurbsideSlot,
  reserveSlot,
  searchProducts,
  searchSSR,
  searchStores,
  setStore,
  typeahead,
  typeaheadTerms,
  updateCartItem
};
