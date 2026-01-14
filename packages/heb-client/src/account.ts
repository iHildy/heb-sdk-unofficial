/**
 * Account profile operations.
 * 
 * @module account
 */

import { nextDataRequest } from './api.js';
import type { HEBSession } from './types.js';

/**
 * Raw profile data from pageProps.
 */
interface RawProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  dob?: string;
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

/**
 * Get account profile details.
 * 
 * Fetches the user's profile information including name, email, phone,
 * and saved addresses.
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
  const data = await nextDataRequest<{
    pageProps: {
      profile?: RawProfile;
      user?: RawProfile;
      customer?: RawProfile;
      addresses?: RawAddress[];
      savedAddresses?: RawAddress[];
      deliveryAddresses?: RawAddress[];
    };
  }>(session, '/en/my-account/profile.json');

  const pageProps = data.pageProps;
  
  // Profile data may be under different keys
  const profile = pageProps.profile ?? pageProps.user ?? pageProps.customer ?? {};
  
  // Addresses may be under different keys
  const rawAddresses = pageProps.addresses ?? pageProps.savedAddresses ?? pageProps.deliveryAddresses ?? [];

  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? profile.phoneNumber,
    dateOfBirth: profile.dateOfBirth ?? profile.dob,
    memberSince: profile.memberSince,
    loyaltyNumber: profile.loyaltyNumber ?? profile.hPlusNumber,
    addresses: rawAddresses.map(parseAddress),
  };
}
