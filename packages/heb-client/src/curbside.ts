/**
 * Curbside pickup slot operations.
 * 
 * @module curbside
 */

import { persistedQuery } from './api.js';
import type { HEBSession, ReserveTimeslotVariables } from './types.js';
import { formatExpiryTime } from './utils.js';

/**
 * A curbside pickup time slot.
 */
export interface CurbsideSlot {
  slotId: string;
  date: Date;
  startTime: string;
  endTime: string;
  fee: number;
  isAvailable: boolean;
  raw?: any;
}

/**
 * Options for fetching curbside slots.
 */
export interface GetCurbsideSlotsOptions {
  /** Store number (e.g. 790 for Plano) */
  storeNumber: number;
  /** Number of days to fetch (default: 14) */
  days?: number;
}

/**
 * Result of a curbside reservation attempt.
 */
export interface ReserveCurbsideSlotResult {
  success: boolean;
  /** Cart/order ID from the reservation */
  orderId?: string;
  /** ISO 8601 timestamp when the reservation expires */
  expiresAt?: string;
  /** Formatted expiry time (e.g., "3:40pm") */
  expiresAtFormatted?: string;
  /** User-friendly deadline message (e.g., "Place your order by 3:40pm to keep this time") */
  deadlineMessage?: string;
  raw?: any;
}

/**
 * Get available curbside pickup slots for a store.
 * 
 * @param session - Active HEB session
 * @param options - Slot options with storeNumber
 * @returns Available curbside pickup slots
 */
export async function getCurbsideSlots(
  session: HEBSession,
  options: GetCurbsideSlotsOptions
): Promise<CurbsideSlot[]> {
  const { storeNumber, days = 14 } = options;

  const response = await persistedQuery<{ listPickupTimeslotsV2: any }>(
    session,
    'listPickupTimeslotsV2',
    {
      storeNumber: Number(storeNumber),
      limit: days > 0 ? 2147483647 : 14, // HEB uses max int for "all slots"
    }
  );

  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }

  const result = response.data?.listPickupTimeslotsV2;
  
  // Handle different response types
  if (result?.__typename === 'TimeslotsStandardErrorV2') {
    throw new Error(result.message || 'Failed to fetch curbside slots');
  }

  const slotsByDay = result?.slotsByDay;
  if (!slotsByDay || !Array.isArray(slotsByDay)) {
    return [];
  }

  const slots: CurbsideSlot[] = [];
  
  for (const day of slotsByDay) {
    // Each day has slotsByGroup which contains groups like "Morning", "Afternoon", etc.
    const slotsByGroup = day.slotsByGroup || [];
    
    for (const group of slotsByGroup) {
      if (group.slots && Array.isArray(group.slots)) {
        for (const slot of group.slots) {
          const isFull = typeof slot.isFull === 'boolean' ? slot.isFull : day.isFull;
          slots.push({
            slotId: slot.id,
            date: new Date(day.date),
            startTime: slot.start || '',
            endTime: slot.end || '',
            fee: slot.totalPrice?.amount || 0,
            isAvailable: isFull === undefined ? true : !isFull,
            raw: slot
          });
        }
      }
    }
  }

  return slots;
}

/**
 * Reserve a curbside pickup slot.
 * 
 * @param session - Active HEB session
 * @param slotId - Slot ID to reserve
 * @param date - Date of the slot (YYYY-MM-DD)
 * @param storeId - Store ID
 * @returns Whether reservation succeeded
 */
export async function reserveCurbsideSlot(
  session: HEBSession,
  slotId: string,
  date: string,
  storeId: string
): Promise<ReserveCurbsideSlotResult> {
  
  const variables: ReserveTimeslotVariables = {
    id: slotId,
    date,
    fulfillmentType: 'PICKUP',
    pickupStoreId: storeId,
    ignoreCartConflicts: false,
    storeId: parseInt(storeId, 10),
    userIsLoggedIn: true,
  };

  const response = await persistedQuery<{ reserveTimeslotV3: any }>(
    session,
    'ReserveTimeslot',
    session.authMode === 'bearer'
      ? {
          fulfillmentPickup: { pickupStoreId: String(storeId) },
          fulfillmentType: 'PICKUP',
          ignoreCartConflicts: false,
          includeTax: false,
          isAuthenticated: true,
          storeId: parseInt(storeId, 10),
          timeslot: { date, id: slotId },
        }
      : (variables as any)
  );
  
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  
  const result = response.data?.reserveTimeslotV3;
  if (!result) {
    throw new Error('No data returned from reserveTimeslotV3');
  }

  // Check for error response type
  if (result.__typename === 'ReserveTimeslotErrorV3') {
    throw new Error(result.message || 'Failed to reserve slot');
  }

  // Extract expiry from the timeslot in the response
  const timeslot = result.timeslot;
  const expiresAt = timeslot?.expiry || timeslot?.expiryDateTime;
  const expiresAtFormatted = expiresAt ? formatExpiryTime(expiresAt) : undefined;
  const deadlineMessage = expiresAtFormatted 
    ? `Place your order by ${expiresAtFormatted} to keep this time` 
    : undefined;

  return {
    success: true,
    orderId: result.id,
    expiresAt,
    expiresAtFormatted,
    deadlineMessage,
    raw: result
  };
}
