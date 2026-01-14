/**
 * Account profile operations.
 * 
 * @module account
 */

import { persistedQuery } from './api.js';
import type { HEBSession } from './types.js';

/**
 * Raw profile data from Me GraphQL query.
 * 
 * These field names match the mobile GraphQL API response structure.
 * The `Me` query returns user profile info including name, email, and phone.
 */
interface RawProfile {
  firstName?: string;
  givenName?: string;
  given_name?: string;
  lastName?: string;
  familyName?: string;
  family_name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  memberSince?: string;
  loyaltyNumber?: string;
  hPlusNumber?: string;
}

/**
 * Raw address from pageProps.
 */
interface RawAddress {
  addressId?: string;
  id?: string;
  nickname?: string;
  address1?: string;
  addressLine1?: string;
  address2?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  zip?: string;
  zipCode?: string;
  isDefault?: boolean;
  default?: boolean;
}

/**
 * User address.
 */
export interface AccountAddress {
  id: string;
  nickname?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

/**
 * Account profile details.
 */
export interface AccountDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  memberSince?: string;
  loyaltyNumber?: string;
  addresses: AccountAddress[];
}

type MobileMeResponse = {
  me?: RawProfile;
  profile?: RawProfile;
  user?: RawProfile;
  customer?: RawProfile;
  account?: RawProfile;
  [key: string]: unknown;
};

type MobileAddressesResponse = {
  myAddresses?: RawAddress[] | { addresses?: RawAddress[] };
  addresses?: RawAddress[];
  savedAddresses?: RawAddress[];
  deliveryAddresses?: RawAddress[];
  [key: string]: unknown;
};

/**
 * Parse a raw address into AccountAddress.
 */
function parseAddress(raw: RawAddress): AccountAddress {
  return {
    id: raw.addressId ?? raw.id ?? '',
    nickname: raw.nickname,
    address1: raw.address1 ?? raw.addressLine1 ?? '',
    address2: raw.address2 ?? raw.addressLine2,
    city: raw.city ?? '',
    state: raw.state ?? '',
    postalCode: raw.postalCode ?? raw.zip ?? raw.zipCode ?? '',
    isDefault: raw.isDefault ?? raw.default ?? false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function extractProfile(payload?: MobileMeResponse): RawProfile {
  if (!payload || !isRecord(payload)) {
    return {};
  }

  const candidates = [
    payload.me,
    payload.profile,
    payload.user,
    payload.customer,
    payload.account,
    isRecord(payload.me) ? (payload.me as Record<string, unknown>)['profile'] : undefined,
    isRecord(payload.user) ? (payload.user as Record<string, unknown>)['profile'] : undefined,
    isRecord(payload.customer) ? (payload.customer as Record<string, unknown>)['profile'] : undefined,
  ];

  for (const candidate of candidates) {
    if (isRecord(candidate)) {
      return candidate as RawProfile;
    }
  }

  return {};
}

function extractAddresses(payload?: MobileAddressesResponse): RawAddress[] {
  if (!payload || !isRecord(payload)) {
    return [];
  }

  const candidates = [
    payload.myAddresses,
    payload.addresses,
    payload.savedAddresses,
    payload.deliveryAddresses,
    isRecord(payload.myAddresses) ? (payload.myAddresses as Record<string, unknown>)['addresses'] : undefined,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as RawAddress[];
    }
  }

  return [];
}

/**
 * Get account profile details.
 * 
 * Fetches the user's profile information including name, email, phone,
 * and saved addresses.
 * Requires a bearer session for the mobile GraphQL API.
 * 
 * @param session - Active HEB session
 * @returns Account details
 * 
 * @example
 * const details = await getAccountDetails(session);
 * console.log(`Welcome, ${details.firstName}!`);
 * console.log(`Email: ${details.email}`);
 */
export async function getAccountDetails(
  session: HEBSession
): Promise<AccountDetails> {
  if (session.authMode !== 'bearer') {
    throw new Error('Account details require a bearer session (mobile GraphQL).');
  }

  const [meResponse, addressesResponse] = await Promise.all([
    persistedQuery<MobileMeResponse>(session, 'Me', {}),
    persistedQuery<MobileAddressesResponse>(session, 'MyAddresses', {}),
  ]);

  if (meResponse.errors?.length) {
    throw new Error(`Account profile fetch failed: ${meResponse.errors.map(e => e.message).join(', ')}`);
  }
  if (addressesResponse.errors?.length) {
    throw new Error(`Account addresses fetch failed: ${addressesResponse.errors.map(e => e.message).join(', ')}`);
  }

  const profile = extractProfile(meResponse.data);
  const rawAddresses = extractAddresses(addressesResponse.data);

  return {
    firstName: profile.firstName ?? profile.givenName ?? profile.given_name ?? '',
    lastName: profile.lastName ?? profile.familyName ?? profile.family_name ?? '',
    email: profile.email ?? '',
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth,
    memberSince: profile.memberSince,
    loyaltyNumber: profile.loyaltyNumber ?? profile.hPlusNumber,
    addresses: rawAddresses.map(parseAddress),
  };
}
