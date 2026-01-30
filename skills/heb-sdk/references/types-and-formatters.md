# Types and formatters

## Key types
- Session and auth: `HEBSession`, `HEBCookies`, `HEBHeaders`, `HEBAuthTokens`, `HEBAuthMode`.
- Context: `ShoppingContext`, `FulfillmentType`, `Address`.
- Search: `SearchOptions`, `SearchResult`, `TypeaheadResult`.
- Products: `Product`, `ProductPrice`, `NutritionInfo`, `FulfillmentInfo`.
- Cart: `Cart`, `CartItem`, `CartResponse`, `DisplayPrice`, `PaymentGroup`, `CartFee`.
- Orders: `OrderHistoryResponse`, `OrderDetailsResponse`, `OrderDetailsItem`.
- Lists: `ShoppingListsResult`, `ShoppingListDetails`, `ShoppingListItem`.
- Fulfillment: `FulfillmentSlot`, `ReserveSlotResult`.
- Homepage: `HomepageData`, `HomepageSection`, `HomepageItem`.
- Weekly ad: `WeeklyAdResult`, `WeeklyAdProduct`, `WeeklyAdCategory`.

## Formatters
Use either `formatter` or the individual `formatX` helpers:
- `formatter.cart`, `formatter.productDetails`, `formatter.productListItem`
- `formatter.orderHistory`, `formatter.orderDetails`
- `formatter.shoppingLists`, `formatter.shoppingList`
- `formatter.weeklyAd`, `formatter.weeklyAdCategories`
- `formatter.homepage`, `formatter.storeSearch`
- `formatter.deliverySlots`, `formatter.curbsideSlots`
