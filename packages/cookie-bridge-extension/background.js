const DEFAULT_SERVER_URL = 'http://localhost:4321';
const COOKIE_ENDPOINT_PATH = '/api/cookies';
let configCache = null;
let lastBadgeText = '';

async function loadConfig() {
  if (configCache) return configCache;
  try {
    const url = chrome.runtime.getURL('config.json');
    const response = await fetch(url);
    if (!response.ok) {
      configCache = {};
      return configCache;
    }
    const data = await response.json();
    configCache = data && typeof data === 'object' ? data : {};
    return configCache;
  } catch {
    configCache = {};
    return configCache;
  }
}

function isLocalServer(serverUrl) {
  return serverUrl.startsWith('http://localhost') || serverUrl.startsWith('http://127.0.0.1');
}

function storageGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

function permissionsContains(origins) {
  return new Promise((resolve) => {
    chrome.permissions.contains({ origins }, resolve);
  });
}

function normalizeSessionUrl(value, serverUrl) {
  const trimmed = (value || '').trim();
  if (trimmed) return trimmed;
  try {
    const host = new URL(serverUrl).host;
    return `https://accounts.${host}`;
  } catch {
    return '';
  }
}

async function getSettings() {
  const config = await loadConfig();
  const { serverUrl, clerkToken, clerkSessionUrl } = await storageGet([
    'serverUrl',
    'clerkToken',
    'clerkSessionUrl',
  ]);
  const resolvedServerUrl = serverUrl || config.serverUrl || DEFAULT_SERVER_URL;
  const configSessionUrl = config.clerkSessionUrl || (typeof config.clerkPublishableKey === 'string' && config.clerkPublishableKey.startsWith('http') ? config.clerkPublishableKey : '');
  return {
    serverUrl: resolvedServerUrl,
    clerkToken: clerkToken || null,
    clerkSessionUrl: normalizeSessionUrl(clerkSessionUrl || configSessionUrl, resolvedServerUrl),
  };
}

async function hasHostPermission(serverUrl) {
  try {
    const origin = new URL(serverUrl).origin;
    return await permissionsContains([`${origin}/*`]);
  } catch {
    return false;
  }
}

function setBadge(text, color) {
  lastBadgeText = text;
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

async function getCookieValue(url, name) {
  return new Promise((resolve) => {
    chrome.cookies.get({ url, name }, (cookie) => resolve(cookie?.value || null));
  });
}

async function resolveClerkTokenFromCookies(clerkSessionUrl) {
  if (!clerkSessionUrl) return null;
  try {
    const origin = new URL(clerkSessionUrl).origin;
    const names = ['__session', '__clerk_session'];
    const origins = new Set([origin]);

    if (origin.includes('://accounts.')) {
      origins.add(origin.replace('://accounts.', '://'));
      origins.add(origin.replace('://accounts.', '://clerk.'));
    }

    if (origin.includes('://clerk.')) {
      origins.add(origin.replace('://clerk.', '://accounts.'));
      origins.add(origin.replace('://clerk.', '://'));
    }

    if (!origin.includes('://accounts.') && !origin.includes('://clerk.')) {
      const base = origin.replace('://', '://accounts.');
      const clerk = origin.replace('://', '://clerk.');
      origins.add(base);
      origins.add(clerk);
    }

    for (const currentOrigin of origins) {
      for (const name of names) {
        const value = await getCookieValue(currentOrigin, name);
        if (value) return value;
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function sendCookies(cause) {
  try {
    const { serverUrl, clerkToken, clerkSessionUrl } = await getSettings();

    if (!(await hasHostPermission(serverUrl))) {
      console.warn('Missing host permissions for server URL. Open the popup to grant permissions.');
      setBadge('PERM', '#9E9E9E');
      return 'PERM';
    }

    const allCookies = await chrome.cookies.getAll({ domain: 'heb.com' });
    const cookieMap = {};
    allCookies.forEach((c) => {
      cookieMap[c.name] = c.value;
    });

    if (!cookieMap.sat || !cookieMap.reese84) {
      console.log('Exiting sync: Missing key cookies (sat/reese84).');
      setBadge('WAIT', '#FFC107');
      return 'WAIT';
    }

    let resolvedToken = clerkToken;
    if (!isLocalServer(serverUrl) && !resolvedToken) {
      resolvedToken = await resolveClerkTokenFromCookies(clerkSessionUrl);
    }

    if (!isLocalServer(serverUrl) && !resolvedToken) {
      console.warn('Missing Clerk session token. Sign in via the extension popup.');
      setBadge('AUTH', '#F44336');
      return 'AUTH';
    }

    const endpoint = new URL(COOKIE_ENDPOINT_PATH, serverUrl).toString();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (!isLocalServer(serverUrl)) {
      headers.Authorization = `Bearer ${resolvedToken}`;
    }

    console.log(`Sending cookies to ${endpoint}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(cookieMap),
    });

    if (response.ok) {
      console.log(`Cookies synced successfully (${cause})`);
      setBadge('ON', '#4CAF50');
      return 'ON';
    }

    if (response.status === 401) {
      console.error('Server rejected cookies: unauthorized');
      setBadge('AUTH', '#F44336');
      return 'AUTH';
    }

    console.error('Server rejected cookies:', response.status);
    setBadge('ERR', '#F44336');
    return 'ERR';
  } catch (error) {
    console.error('Failed to sync cookies (Server likely down):', error);
    setBadge('OFF', '#9E9E9E');
    return 'OFF';
  }
}

// Monitor changes to key cookies
chrome.cookies.onChanged.addListener((changeInfo) => {
  const { cookie } = changeInfo;
  if (cookie.domain.includes('heb.com') && (cookie.name === 'sat' || cookie.name === 'reese84')) {
    sendCookies('onChanged');
  }
});

// Monitor Clerk auth cookie changes to auto-sync after sign-in
let authSyncDebounceTimer = null;
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const { cookie, removed } = changeInfo;
  // Only care about session cookies being set (not removed)
  if (removed) return;
  if (cookie.name !== '__session' && cookie.name !== '__clerk_session') return;

  // Check if this cookie domain matches our configured clerk session URL
  const { clerkSessionUrl } = await getSettings();
  if (!clerkSessionUrl) return;

  try {
    const sessionHost = new URL(clerkSessionUrl).hostname;
    // Cookie domain may have leading dot, normalize for comparison
    const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
    
    // Match if sessionHost ends with cookieDomain or vice versa (subdomain matching)
    const matches = sessionHost === cookieDomain 
      || sessionHost.endsWith('.' + cookieDomain) 
      || cookieDomain.endsWith('.' + sessionHost);
    
    if (!matches) return;

    // Debounce to avoid multiple syncs during sign-in flow
    if (authSyncDebounceTimer) clearTimeout(authSyncDebounceTimer);
    authSyncDebounceTimer = setTimeout(() => {
      authSyncDebounceTimer = null;
      console.log('Clerk auth cookie detected, triggering sync...');
      sendCookies('auth');
    }, 500);
  } catch {
    // Invalid URL, skip
  }
});

// Sync on startup
chrome.runtime.onStartup.addListener(() => {
  sendCookies('startup');
});

// Sync on install
chrome.runtime.onInstalled.addListener(() => {
  sendCookies('install');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sync') {
    sendCookies('manual')
      .then((status) => sendResponse({ success: true, status: status || lastBadgeText }))
      .catch(() => sendResponse({ success: false, status: lastBadgeText }));
    return true;
  }
});
