/**
 * Shopping list operations.
 * 
 * @module shopping-list
 */

import { persistedQuery } from './api.js';
import type { HEBSession } from './types.js';
import { formatSlotDate, formatCurrency } from './utils.js';

// ─────────────────────────────────────────────────────────────
// Raw API Response Types
// ─────────────────────────────────────────────────────────────

interface RawShoppingListsResponse {
  getShoppingListsV2: {
    thisPage: {
      sort: string;
      sortDirection: string;
      totalCount: number;
      page: number;
      size: number;
    };
    nextPage: {
      page: number;
      size: number;
      sort: string;
      sortDirection: string;
      totalCount: number;
    } | null;
    lists: Array<{
      id: string;
      name: string;
      totalItemCount: number;
      created: string;
      updated: string;
      fulfillment: {
        store: {
          storeNumber: number;
          name: string;
        };
      };
    }>;
    header: {
      id: string;
      metadata: {
        role: string;
        shoppingListVisibilityLevel: string;
      };
    };
  };
}

interface RawShoppingListResponse {
  getShoppingListV2: {
    id: string;
    name: string;
    description: string | null;
    metadata: {
      role: string;
      shoppingListVisibilityLevel: string;
    };
    fulfillment: {
      store: {
        storeNumber: number;
        name: string;
      };
    };
    created: string;
    updated: string;
    itemPage: {
      items: Array<{
        id: string;
        checked: boolean;
        quantity: number;
        note: string | null;
        weight: number | null;
        maximumQuantity: number;
        groupHeader: string;
        created: string;
        itemPrice: {
          totalAmount: number;
          listPrice: number;
          salePrice: number;
          onSale: boolean;
          rawTotalPrice: number;
        };
        product: {
          id: string;
          fullDisplayName: string;
          brand: {
            name: string;
            isOwnBrand: boolean;
          } | null;
          inventory: {
            inventoryState: string;
          };
          productImageUrls: Array<{
            size: string;
            url: string;
          }>;
        };
      }>;
    };
  };
}

// ─────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────

/**
 * Shopping list summary (from list of all lists).
 */
export interface ShoppingList {
  /** Unique list ID */
  id: string;
  /** List name */
  name: string;
  /** Number of items in the list */
  itemCount: number;
  /** Store associated with the list */
  store: {
    id: number;
    name: string;
  };
  /** When the list was created */
  createdAt: Date;
  /** When the list was last updated */
  updatedAt: Date;
}

/**
 * Item in a shopping list.
 */
export interface ShoppingListItem {
  /** Unique item ID within the list */
  id: string;
  /** Product ID */
  productId: string;
  /** Product name */
  name: string;
  /** Brand name (if available) */
  brand?: string;
  /** Whether item is checked off */
  checked: boolean;
  /** Quantity */
  quantity: number;
  /** Weight (for weighted items) */
  weight?: number;
  /** Note attached to item */
  note?: string;
  /** Category/group header */
  category: string;
  /** Price information */
  price: {
    /** Total price for quantity */
    total: number;
    /** List price per unit */
    listPrice: number;
    /** Sale price per unit (if on sale) */
    salePrice: number;
    /** Whether item is on sale */
    onSale: boolean;
  };
  /** Inventory status */
  inStock: boolean;
  /** Image URL */
  imageUrl?: string;
}

/**
 * Full shopping list with items.
 */
export interface ShoppingListDetails {
  /** Unique list ID */
  id: string;
  /** List name */
  name: string;
  /** List description */
  description?: string;
  /** User's role for this list (e.g., 'ADMIN') */
  role: string;
  /** Visibility level (e.g., 'PRIVATE') */
  visibility: string;
  /** Store associated with the list */
  store: {
    id: number;
    name: string;
  };
  /** When the list was created */
  createdAt: Date;
  /** When the list was last updated */
  updatedAt: Date;
  /** Items in the list */
  items: ShoppingListItem[];
}

/**
 * Options for fetching a shopping list.
 */
export interface GetShoppingListOptions {
  /** Page number (0-indexed, default: 0) */
  page?: number;
  /** Page size (default: 500) */
  size?: number;
  /** Sort field (default: 'CATEGORY') */
  sort?: 'CATEGORY' | 'LAST_UPDATED' | 'NAME';
  /** Sort direction (default: 'ASC') */
  sortDirection?: 'ASC' | 'DESC';
}

// ─────────────────────────────────────────────────────────────
// Functions
// ─────────────────────────────────────────────────────────────

/**
 * Get all shopping lists for the current user.
 * 
 * @param session - Active HEB session
 * @returns List of shopping lists
 * 
 * @example
 * const lists = await getShoppingLists(session);
 * console.log(`You have ${lists.length} shopping lists`);
 * lists.forEach(list => console.log(`- ${list.name} (${list.itemCount} items)`));
 */
export async function getShoppingLists(session: HEBSession): Promise<ShoppingList[]> {
  const response = await persistedQuery<RawShoppingListsResponse>(
    session,
    'getShoppingListsV2',
    {}
  );

  const data = response.data?.getShoppingListsV2;
  if (!data) {
    throw new Error('Failed to fetch shopping lists');
  }

  return data.lists.map(list => ({
    id: list.id,
    name: list.name,
    itemCount: list.totalItemCount,
    store: {
      id: list.fulfillment.store.storeNumber,
      name: list.fulfillment.store.name,
    },
    createdAt: new Date(list.created),
    updatedAt: new Date(list.updated),
  }));
}

/**
 * Get a specific shopping list with its items.
 * 
 * @param session - Active HEB session
 * @param listId - Shopping list ID
 * @param options - Pagination and sorting options
 * @returns Shopping list with items
 * 
 * @example
 * const list = await getShoppingList(session, '66f00f64-5c8e-4f59-96e9-b3a00f280660');
 * console.log(`${list.name} has ${list.items.length} items`);
 * list.items.forEach(item => {
 *   const status = item.checked ? '[x]' : '[ ]';
 *   console.log(`${status} ${item.name} x${item.quantity} - $${item.price.total.toFixed(2)}`);
 * });
 */
export async function getShoppingList(
  session: HEBSession,
  listId: string,
  options: GetShoppingListOptions = {}
): Promise<ShoppingListDetails> {
  const {
    page = 0,
    size = 500,
    sort = 'CATEGORY',
    sortDirection = 'ASC',
  } = options;

  const response = await persistedQuery<RawShoppingListResponse>(
    session,
    'getShoppingListV2',
    {
      input: {
        id: listId,
        page: {
          page,
          size,
          sort,
          sortDirection,
        },
      },
    }
  );

  const data = response.data?.getShoppingListV2;
  if (!data) {
    throw new Error(`Shopping list ${listId} not found`);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? undefined,
    role: data.metadata.role,
    visibility: data.metadata.shoppingListVisibilityLevel,
    store: {
      id: data.fulfillment.store.storeNumber,
      name: data.fulfillment.store.name,
    },
    createdAt: new Date(data.created),
    updatedAt: new Date(data.updated),
    items: data.itemPage.items.map(item => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.fullDisplayName,
      brand: item.product.brand?.name,
      checked: item.checked,
      quantity: item.quantity,
      weight: item.weight ?? undefined,
      note: item.note ?? undefined,
      category: item.groupHeader,
      price: {
        total: item.itemPrice.totalAmount,
        listPrice: item.itemPrice.listPrice,
        salePrice: item.itemPrice.salePrice,
        onSale: item.itemPrice.onSale,
      },
      inStock: item.product.inventory.inventoryState === 'IN_STOCK',
      imageUrl: item.product.productImageUrls.find(img => img.size === 'SMALL')?.url
        ?? item.product.productImageUrls[0]?.url,
    })),
  };
}

/**
 * Format shopping lists for display.
 */
export function formatShoppingLists(lists: ShoppingList[]): string {
  if (lists.length === 0) {
    return 'No shopping lists found.';
  }

  const formatted = lists.map((list, i) => {
    const itemCount = list.itemCount ?? 0;
    const updated = list.updatedAt ? ` (updated ${formatSlotDate(list.updatedAt.toISOString())})` : '';
    return `${i + 1}. ${list.name} - ${itemCount} items${updated} (ID: ${list.id})`;
  }).join('\n');

  return `Found ${lists.length} shopping lists:\n\n${formatted}\n\nUse get_shopping_list(list_id) to see items.`;
}

/**
 * Format a single shopping list with items for display.
 */
export function formatShoppingList(list: ShoppingListDetails): string {
  if (list.items.length === 0) {
    return `Shopping list "${list.name}" is empty.`;
  }

  const itemsList = list.items.map((item, i) => {
    const priceStr = item.price?.total ? ` - ${formatCurrency(item.price.total)}` : '';
    const checked = item.checked ? ' [x]' : ' [ ]';
    return `${i + 1}.${checked} ${item.name}${priceStr} (ID: ${item.productId})`;
  }).join('\n');

  return `**${list.name}** (${list.items.length} items)\n\n${itemsList}`;
}
