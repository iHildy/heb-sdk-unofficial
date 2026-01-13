const DEFAULT_SERVER_URL = 'http://localhost:4321';
const COOKIE_ENDPOINT_PATH = '/api/cookies';
let configCache = null;

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

async function getSettings() {
  const config = await loadConfig();
  const { serverUrl, clerkToken } = await storageGet(['serverUrl', 'clerkToken']);
  return {
    serverUrl: serverUrl || config.serverUrl || DEFAULT_SERVER_URL,
    clerkToken: clerkToken || null,
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
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

async function sendCookies(cause) {
  try {
    const { serverUrl, clerkToken } = await getSettings();

    if (!(await hasHostPermission(serverUrl))) {
      console.warn('Missing host permissions for server URL. Open the popup to grant permissions.');
      setBadge('PERM', '#9E9E9E');
      return;
    }

    const allCookies = await chrome.cookies.getAll({ domain: 'heb.com' });
    const cookieMap = {};
    allCookies.forEach((c) => {
      cookieMap[c.name] = c.value;
    });

    if (!cookieMap.sat || !cookieMap.reese84) {
      console.log('Exiting sync: Missing key cookies (sat/reese84).');
      setBadge('WAIT', '#FFC107');
      return;
    }

    if (!isLocalServer(serverUrl) && !clerkToken) {
      console.warn('Missing Clerk token. Sign in via the extension popup.');
      setBadge('AUTH', '#F44336');
      return;
    }

    const endpoint = new URL(COOKIE_ENDPOINT_PATH, serverUrl).toString();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (!isLocalServer(serverUrl)) {
      headers.Authorization = `Bearer ${clerkToken}`;
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
      return;
    }

    if (response.status === 401) {
      console.error('Server rejected cookies: unauthorized');
      setBadge('AUTH', '#F44336');
      return;
    }

    console.error('Server rejected cookies:', response.status);
    setBadge('ERR', '#F44336');
  } catch (error) {
    console.error('Failed to sync cookies (Server likely down):', error);
    setBadge('OFF', '#9E9E9E');
  }
}

// Monitor changes to key cookies
chrome.cookies.onChanged.addListener((changeInfo) => {
  const { cookie } = changeInfo;
  if (cookie.domain.includes('heb.com') && (cookie.name === 'sat' || cookie.name === 'reese84')) {
    sendCookies('onChanged');
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
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }
});
