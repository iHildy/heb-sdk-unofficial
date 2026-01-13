/**
 * Delivery slot operations.
 * 
 * @module delivery
 */

import { persistedQuery } from './api.js';
import type { Address, HEBSession, ReserveTimeslotVariables } from './types.js';
import { formatExpiryTime } from './utils.js';

/**
 * A delivery time slot.
 */
export interface DeliverySlot {
  slotId: string;
  date: Date;
  startTime: string;
  endTime: string;
  fee: number;
  isAvailable: boolean;
  raw?: any; // To store extra data if needed for reservation
}

/**
 * Options for fetching delivery slots.
 */
export interface GetDeliverySlotsOptions {
  /** Store ID (defaults to session store) */
  storeId?: string;
  /** Delivery address */
  address?: Address;
  /** Number of days to fetch (default: 14) */
  days?: number;
}

/**
 * Result of a reservation attempt.
 */
export interface ReserveSlotResult {
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
 * Get available delivery slots.
 * 
 * @param session - Active HEB session
 * @param options - Slot options
 * @returns Available delivery slots
 */
export async function getDeliverySlots(
  session: HEBSession,
  options: GetDeliverySlotsOptions = {}
): Promise<DeliverySlot[]> {
  const { address, days = 14 } = options;

  if (!address) {
    throw new Error('Address is required to fetch delivery slots');
  }



  const response = await persistedQuery<{ listDeliveryTimeslotsV2: any }>(
    session,
    'listDeliveryTimeslotsV2',
    {
      address,
      limit: days, 
    }
  );

  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }

  const slotsByDay = response.data?.listDeliveryTimeslotsV2?.slotsByDay;
  if (!slotsByDay || !Array.isArray(slotsByDay)) {
    return [];
  }

  const slots: DeliverySlot[] = [];
  
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

/**
 * Reserve a delivery slot.
 * 
 * @param session - Active HEB session
 * @param slotId - Slot ID to reserve
 * @param date - Date of the slot (YYYY-MM-DD)
 * @param address - Delivery address
 * @param storeId - Store ID
 * @returns Whether reservation succeeded
 */
export async function reserveSlot(
  session: HEBSession,
  slotId: string,
  date: string,
  address: Address,
  storeId: string
): Promise<ReserveSlotResult> {
  
  const variables: ReserveTimeslotVariables = {
    id: slotId,
    date,
    fulfillmentType: 'DELIVERY',
    deliveryAddress: address,
    ignoreCartConflicts: false,
    storeId: parseInt(storeId, 10),
    userIsLoggedIn: true,
  };

  const response = await persistedQuery<{ reserveTimeslotV3: any }>(
    session,
    'ReserveTimeslot',
    variables as any
  );
  
  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }
  
  const result = response.data?.reserveTimeslotV3;
  if (!result) {
      throw new Error('No data returned from reserveTimeslotV3');
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
