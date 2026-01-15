/**
 * Fulfillment slot operations (Delivery and Curbside Pickup).
 *
 * @module fulfillment
 */

import { persistedQuery } from "./api.js";
import type {
  Address,
  HEBSession,
  ReserveTimeslotVariables,
  FulfillmentType,
} from "./types.js";
import {
  formatExpiryTime,
  formatSlotTime,
  formatSlotDate,
  getLocalDateString,
} from "./utils.js";

export interface FulfillmentSlot {
  slotId: string;
  date: Date;
  startTime: string;
  endTime: string;
  formattedStartTime: string;
  formattedEndTime: string;
  formattedDate: string;
  localDate: string; // YYYY-MM-DD format
  fee: number;
  isAvailable: boolean;
  raw?: any;
}

/**
 * Options for fetching fulfillment slots.
 */
export interface GetFulfillmentSlotsOptions {
  /** Number of days to fetch (default: 14) */
  days?: number;
  /** Delivery address (required for delivery) */
  address?: Address;
  /** Store number (required for curbside) */
  storeNumber?: number;
}

/**
 * Options for fetching delivery slots.
 */
export interface GetDeliverySlotsOptions {
  /** Delivery address */
  address: Address;
  /** Number of days to fetch (default: 14) */
  days?: number;
}

/**
 * Options for fetching curbside pickup slots.
 */
export interface GetCurbsideSlotsOptions {
  /** Store number */
  storeNumber: number;
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
 * Helper to map a raw slot object to a FulfillmentSlot.
 */
function mapSlot(
  slot: any,
  dayDate: string,
  fallbackIsFull?: boolean,
): FulfillmentSlot {
  const startTimeRaw = slot.startTime || slot.start || "";
  const endTimeRaw = slot.endTime || slot.end || "";

  const localDate = startTimeRaw ? getLocalDateString(startTimeRaw) : dayDate;

  const isFull = slot.isFull ?? fallbackIsFull;

  return {
    slotId: slot.id,
    date: new Date(startTimeRaw || dayDate),
    startTime: startTimeRaw,
    endTime: endTimeRaw,
    formattedStartTime: startTimeRaw ? formatSlotTime(startTimeRaw) : "",
    formattedEndTime: endTimeRaw ? formatSlotTime(endTimeRaw) : "",
    formattedDate: startTimeRaw ? formatSlotDate(startTimeRaw) : "",
    localDate,
    fee: slot.totalPrice?.amount || 0,
    isAvailable: isFull === undefined ? true : !isFull,
    raw: slot,
  };
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
  options: GetDeliverySlotsOptions,
): Promise<FulfillmentSlot[]> {
  const { address, days = 14 } = options;

  if (!address) {
    throw new Error("Address is required to fetch delivery slots");
  }

  const response = await persistedQuery<{ listDeliveryTimeslotsV2: any }>(
    session,
    "listDeliveryTimeslotsV2",
    {
      address,
      limit: days,
    },
  );

  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }

  const slotsByDay = response.data?.listDeliveryTimeslotsV2?.slotsByDay;
  if (!slotsByDay || !Array.isArray(slotsByDay)) {
    return [];
  }

  const slots: FulfillmentSlot[] = [];
  for (const day of slotsByDay) {
    if (day.slots && Array.isArray(day.slots)) {
      for (const slot of day.slots) {
        slots.push(mapSlot(slot, day.date));
      }
    }
  }

  return slots;
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
  options: GetCurbsideSlotsOptions,
): Promise<FulfillmentSlot[]> {
  const { storeNumber, days = 14 } = options;

  const response = await persistedQuery<{ listPickupTimeslotsV2: any }>(
    session,
    "listPickupTimeslotsV2",
    {
      storeNumber: Number(storeNumber),
      limit: days > 0 ? 2147483647 : 14, // HEB uses max int for "all slots"
    },
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

  const slots: FulfillmentSlot[] = [];
  for (const day of slotsByDay) {
    const slotsByGroup = day.slotsByGroup || [];
    for (const group of slotsByGroup) {
      if (group.slots && Array.isArray(group.slots)) {
        for (const slot of group.slots) {
          // Curbside sometimes has isFull on the day level if not on slot. Pass this to the mapper as a fallback.
          slots.push(mapSlot(slot, day.date, day.isFull));
        }
      }
    }
  }

  return slots;
}

/**
 * Reserve a fulfillment slot (Delivery or Curbside).
 *
 * @param session - Active HEB session
 * @param options - Reservation options
 * @returns Whether reservation succeeded
 */
export async function reserveSlot(
  session: HEBSession,
  options: {
    slotId: string;
    date: string;
    fulfillmentType: FulfillmentType;
    storeId: string | number;
    address?: Address;
  },
): Promise<ReserveSlotResult> {
  const { slotId, date, fulfillmentType, storeId, address } = options;
  const numericStoreId =
    typeof storeId === "string" ? parseInt(storeId, 10) : storeId;

  const variables: ReserveTimeslotVariables = {
    id: slotId,
    date,
    fulfillmentType,
    ignoreCartConflicts: false,
    storeId: numericStoreId,
    userIsLoggedIn: true,
  };

  if (fulfillmentType === "PICKUP") {
    variables.pickupStoreId = String(storeId);
  } else if (fulfillmentType === "DELIVERY") {
    if (!address) {
      throw new Error("Address is required for delivery reservation");
    }
    variables.deliveryAddress = address;
  }

  const response = await persistedQuery<{ reserveTimeslotV3: any }>(
    session,
    "ReserveTimeslot",
    session.authMode === "bearer" && fulfillmentType === "PICKUP"
      ? {
          fulfillmentPickup: { pickupStoreId: String(storeId) },
          fulfillmentType: "PICKUP",
          ignoreCartConflicts: false,
          includeTax: false,
          isAuthenticated: true,
          storeId: numericStoreId,
          timeslot: { date, id: slotId },
        }
      : (variables as any),
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
  const expiresAtFormatted = expiresAt
    ? formatExpiryTime(expiresAt)
    : undefined;
  const deadlineMessage = expiresAtFormatted
    ? `Place your order by ${expiresAtFormatted} to keep this time`
    : undefined;

  return {
    success: true,
    orderId: result.id,
    expiresAt,
    expiresAtFormatted,
    deadlineMessage,
    raw: result,
  };
}

/**
 * Format delivery slots for display.
 */
export function formatDeliverySlots(slots: FulfillmentSlot[], debug = false): string {
  if (slots.length === 0) {
    return 'No delivery slots found.';
  }

  const formatted = slots.map((s) => {
    const status = s.isAvailable ? 'AVAILABLE' : 'FULL';
    const fee = s.fee > 0 ? `${s.fee.toFixed(2)}` : 'FREE';
    const timeRange = `${s.formattedStartTime} - ${s.formattedEndTime}`;
    const utc = debug ? ` [UTC: ${s.startTime}]` : '';
    return `- [${status}] ${s.formattedDate} (${s.localDate}) ${timeRange} (${fee}) (ID: ${s.slotId})${utc}`;
  }).join('\n');

  return `Found ${slots.length} slots:\n\n${formatted}`;
}

/**
 * Format curbside slots for display.
 */
export function formatCurbsideSlots(slots: FulfillmentSlot[], debug = false): string {
  if (slots.length === 0) {
    return 'No curbside pickup slots found.';
  }

  const formatted = slots.map((s) => {
    const status = s.isAvailable ? 'AVAILABLE' : 'FULL';
    const fee = s.fee > 0 ? `${s.fee.toFixed(2)}` : 'FREE';
    const timeRange = `${s.formattedStartTime} - ${s.formattedEndTime}`;
    const utc = debug ? ` [UTC: ${s.startTime}]` : '';
    return `- [${status}] ${s.formattedDate} (${s.localDate}) ${timeRange} (${fee}) (ID: ${s.slotId})${utc}`;
  }).join('\n');

  return `Found ${slots.length} curbside slots:\n\n${formatted}`;
}
