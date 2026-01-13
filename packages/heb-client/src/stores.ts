import { graphqlRequest } from './api';
import { HEBSession } from './types.js';

export interface Store {
  storeNumber: string;
  name: string;
  address: {
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
  };
  distanceMiles?: number;
}

export interface StoreSearchResult {
  stores: Store[];
}

/**
 * Search for H-E-B stores by address, zip, or city.
 */
export async function searchStores(
  session: HEBSession,
  query: string,
  radius = 100
): Promise<Store[]> {
  const payload = {
    operationName: 'StoreSearch',
    variables: {
      address: query,
      radius,
      fulfillmentChannels: [],
      includeEcommInactive: false,
      retailFormatCodes: ['P', 'NP'],
    },
    extensions: {
      persistedQuery: {
        version: 1,
        // Hash from types.ts or hardcoded if necessary, but prefer importing if possible or using the one found
        sha256Hash: 'e01fa39e66c3a2c7881322bc48af6a5af97d49b1442d433f2d09d273de2db4b6',
      },
    },
  };

  const response = await graphqlRequest<any>(session, payload);
  
  if (response.errors) {
    throw new Error(`Store search failed: ${response.errors.map(e => e.message).join(', ')}`);
  }

  const stores = response.data?.searchStoresByAddress?.stores || [];
  
  return stores.map((s: any) => ({
    storeNumber: String(s.store.storeNumber),
    name: s.store.name,
    address: {
      streetAddress: s.store.address.streetAddress,
      city: s.store.address.locality,
      state: s.store.address.region,
      zip: s.store.address.postalCode,
    },
    distanceMiles: s.distanceMiles,
  }));
}

/**
 * Set the store context for the session.
 * This sets the CURR_SESSION_STORE cookie and performs a fulfillment selection request to ensure server-side context.
 */
export async function setStore(
  session: HEBSession,
  storeId: string
): Promise<void> {
  // Update the session cookie locally
  session.cookies.CURR_SESSION_STORE = storeId;
  
  // Perform the mutation to set it on the server
  const payload = {
    operationName: 'SelectPickupFulfillment',
    variables: {
      fulfillmentType: 'PICKUP',
      pickupStoreId: storeId,
      ignoreCartConflicts: false,
      storeId: Number(storeId),
      userIsLoggedIn: true,
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: '8fa3c683ee37ad1bab9ce22b99bd34315b2a89cfc56208d63ba9efc0c49a6323',
      },
    },
  };

  try {
    const response = await graphqlRequest<any>(session, payload);
    if (response.errors) {
      console.warn('Set store server request failed, but cookie was updated:', response.errors);
    }
  } catch (error) {
    console.warn('Set store server request failed, but cookie was updated:', error);
  }
}
