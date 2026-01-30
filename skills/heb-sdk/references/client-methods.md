# HEBClient method map

Use this to choose auth mode and required context.

## Search
- `search(query, options?)`: bearer only; store required.
- `getBuyItAgain(options?)`: bearer only; store required.
- `typeahead(query)`: cookie or bearer; no store required.

## Products
- `getProduct(productId, options?)`: bearer only; store required.
- `getSkuId(productId)`: bearer only; store required.
- `getImageUrl(productId, size?)`: local helper, no session required.

## Cart
- `getCart()`: cookie or bearer.
- `addToCart(productId, skuId, qty)`: cookie or bearer. Sets quantity (does not increment).
- `updateCartItem(...)`: alias of `addToCart`.
- `removeFromCart(productId, skuId)`: sets quantity to 0.
- `quickAdd(productId, skuId)`: sets quantity to 1.
- `addToCartById(productId, qty)`: fetches SKU and calls `addToCart`.

## Orders (bearer)
- `getOrders({ page?, size? })`
- `getOrder(orderId)`

## Account (bearer)
- `getAccountDetails()`

## Homepage (bearer)
- `getHomepage(options?)`: store required.

## Weekly ad (bearer)
- `getWeeklyAdProducts(options?)`: store required.

## Shopping lists (cookie recommended)
- `getShoppingLists()`
- `getShoppingList(listId, options?)`

## Fulfillment
- `getDeliverySlots({ address, days? })`: requires address.
- `getCurbsideSlots({ storeNumber, days? })`: requires store number.
- `reserveSlot(slotId, date, address, storeId)`: reserve delivery.
- `reserveCurbsideSlot(slotId, date, storeId)`: reserve pickup.

## Stores
- `searchStores(query)`
- `setStore(storeId)`: updates cookie; for cookie sessions also sets server context.
- `setShoppingContext(context)`
