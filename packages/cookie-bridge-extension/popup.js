const statusEl = document.getElementById('statusMessage');
const settingsMessageEl = document.getElementById('settingsMessage');
const cookieStatusEl = document.getElementById('cookieStatus');
const serverUrlEl = document.getElementById('serverUrl');
const clerkSessionUrlEl = document.getElementById('clerkSessionUrl');
const jwtTemplateEl = document.getElementById('jwtTemplate');

// Views
const viewMain = document.getElementById('view-main');
const viewSettings = document.getElementById('view-settings');

// Buttons
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const saveBtn = document.getElementById('saveBtn');
const syncBtn = document.getElementById('syncBtn');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

// Visuals
const debugEl = document.getElementById('debug');
const syncSection = document.getElementById('syncSection');

const DEFAULT_SERVER_URL = 'http://localhost:4321';
let cookieStatusTimer = null;

// Helpers for Cookies
function getCookieValue(url, name) {
  return new Promise((resolve) => {
    chrome.cookies.get({ url, name }, (cookie) => resolve(cookie?.value || null));
  });
}

function getCookiesForDomain(domain) {
  return new Promise((resolve) => {
    chrome.cookies.getAll({ domain }, resolve);
  });
}

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes <= 0) return 'less than 1m';
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h`;
  if (totalHours > 0) return `${totalHours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatExpiryTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function setCookieStatus(message) {
  if (cookieStatusEl) cookieStatusEl.textContent = message;
}

async function updateCookieStatus() {
  if (!cookieStatusEl) return;
  try {
    const cookies = await getCookiesForDomain('heb.com');
    const requiredNames = ['sat', 'reese84'];
    const matchedCookies = requiredNames.map((name) => cookies.find((cookie) => cookie.name === name));

    if (matchedCookies.some((cookie) => !cookie)) {
      setCookieStatus('Missing HEB cookies.');
      return;
    }

    if (matchedCookies.some((cookie) => cookie.session || !cookie.expirationDate)) {
      setCookieStatus('Session cookies (expire on browser close).');
      return;
    }

    const earliestExpiration = Math.min(...matchedCookies.map((cookie) => cookie.expirationDate));
    const expiresAt = new Date(earliestExpiration * 1000);
    const timeLeftMs = earliestExpiration * 1000 - Date.now();

    if (timeLeftMs <= 0) {
      setCookieStatus('HEB cookies expired.');
      return;
    }

    const timeLeft = formatDuration(timeLeftMs);
    setCookieStatus(`${timeLeft} left, expires ${formatExpiryTime(expiresAt)}`);
  } catch (error) {
    console.error('Failed to read HEB cookie status:', error);
    setCookieStatus('Unable to read cookie status.');
  }
}

function startCookieStatusTimer() {
  if (cookieStatusTimer) clearInterval(cookieStatusTimer);
  cookieStatusTimer = setInterval(updateCookieStatus, 60000);
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

// Navigation
settingsBtn.addEventListener('click', () => {
  viewMain.classList.add('hidden');
  viewSettings.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
  viewSettings.classList.add('hidden');
  viewMain.classList.remove('hidden');
  // Refresh status on back
  loadSettings().then(updateUI);
});

function setStatus(message) {
  if (statusEl) statusEl.textContent = message;
}

function setSettingsStatus(message, isError = false) {
  if (!settingsMessageEl) return;
  settingsMessageEl.textContent = message;
  settingsMessageEl.classList.remove('hidden', 'text-red-600', 'text-green-600', 'text-gray-600');
  settingsMessageEl.classList.add(isError ? 'text-red-600' : 'text-green-600');
}

function setDebug(lines) {
  if (!debugEl) return;
  debugEl.innerHTML = Array.isArray(lines) ? lines.join('<br />') : String(lines || '');
}

function normalizeSignInUrl(value, serverUrl) {
  const trimmed = (value || '').trim();
  if (trimmed) return trimmed;
  try {
    const host = new URL(serverUrl).host;
    return `https://accounts.${host}/sign-in`;
  } catch {
    return '';
  }
}

async function loadConfig() {
  try {
    const url = chrome.runtime.getURL('config.json');
    const response = await fetch(url);
    if (!response.ok) return {};
    const data = await response.json();
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function storageGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

function storageSet(values) {
  return new Promise((resolve) => {
    chrome.storage.local.set(values, resolve);
  });
}

function storageRemove(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, resolve);
  });
}

function permissionsContains(origins) {
  return new Promise((resolve) => {
    chrome.permissions.contains({ origins }, resolve);
  });
}

function permissionsRequest(origins) {
  return new Promise((resolve) => {
    chrome.permissions.request({ origins }, resolve);
  });
}

async function loadSettings() {
  const config = await loadConfig();
  const { serverUrl, clerkSessionUrl, jwtTemplate, clerkToken } = await storageGet([
    'serverUrl',
    'clerkSessionUrl',
    'jwtTemplate',
    'clerkToken' 
  ]);

  const resolvedServerUrl = serverUrl || config.serverUrl || DEFAULT_SERVER_URL;
  const configSessionUrl = config.clerkSignInUrl
    || config.clerkSignInURL
    || config.clerkSessionUrl
    || (typeof config.clerkPublishableKey === 'string' && config.clerkPublishableKey.startsWith('http') ? config.clerkPublishableKey : '');
  const resolvedSessionUrl = normalizeSignInUrl(clerkSessionUrl || configSessionUrl, resolvedServerUrl);
  const resolvedTemplate = jwtTemplate || config.jwtTemplate || '';

  // Populate inputs (if empty)
  if (!serverUrlEl.value) serverUrlEl.value = resolvedServerUrl;
  if (!clerkSessionUrlEl.value) clerkSessionUrlEl.value = resolvedSessionUrl;
  if (!jwtTemplateEl.value) jwtTemplateEl.value = resolvedTemplate;

  // Determine Signed In State
  let isSignedIn = !!clerkToken;
  if (!isSignedIn && resolvedSessionUrl) {
    // Try to find token in cookies
    const cookieToken = await resolveClerkTokenFromCookies(resolvedSessionUrl);
    if (cookieToken) {
      isSignedIn = true;
      // Optionally sync this back to storage so background doesn't have to look it up? 
      // Background does its own lookup. But for consistency we can leave it.
    }
  }

  let permissionStatus = 'unknown';
  let sessionPermissionStatus = 'unknown';
  try {
    const origin = new URL(resolvedServerUrl).origin;
    const hasPermission = await permissionsContains([`${origin}/*`]);
    permissionStatus = hasPermission ? 'granted' : 'missing';
  } catch {
    permissionStatus = 'invalid';
  }

  try {
    const sessionOrigin = new URL(resolvedSessionUrl).origin;
    const hasPermission = await permissionsContains([`${sessionOrigin}/*`]);
    sessionPermissionStatus = hasPermission ? 'granted' : 'missing';
  } catch {
    sessionPermissionStatus = 'invalid';
  }

  return {
    serverUrl: resolvedServerUrl,
    clerkSessionUrl: resolvedSessionUrl,
    jwtTemplate: resolvedTemplate,
    permissionStatus,
    sessionPermissionStatus,
    isSignedIn
  };
}

function updateUI(settings) {
  const { isSignedIn } = settings;
  
  updateCookieStatus();

  if (isSignedIn) {
    // Authenticated State
    signInBtn.classList.add('hidden');
    signOutBtn.classList.remove('hidden');
    syncSection.classList.remove('hidden');
    setStatus('Ready to sync.');
  } else {
    // Unauthenticated State
    signInBtn.classList.remove('hidden');
    signOutBtn.classList.add('hidden');
    syncSection.classList.add('hidden');
    setStatus('Sign in to continue.');
  }
}

async function requestHostPermission(serverUrl) {
  try {
    const origin = new URL(serverUrl).origin;
    const alreadyGranted = await permissionsContains([`${origin}/*`]);
    if (alreadyGranted) return true;
    const granted = await permissionsRequest([`${origin}/*`]);
    return granted;
  } catch (error) {
    console.error('Failed to request host permission:', error);
    return false;
  }
}

async function saveSettingsAction() {
  const serverUrl = serverUrlEl.value.trim() || DEFAULT_SERVER_URL;
  const clerkSessionUrl = normalizeSignInUrl(clerkSessionUrlEl.value, serverUrl);
  const jwtTemplate = jwtTemplateEl.value.trim();

  setSettingsStatus('Validating access...');

  // 1. Validate Server Access (Host Permission)
  const serverGranted = await requestHostPermission(serverUrl);
  if (!serverGranted) {
    setSettingsStatus('Server access permission denied.', true);
    return false;
  }

  // 2. Validate Auth Access (Host Permission + Session)
  if (clerkSessionUrl) {
    const sessionGranted = await requestHostPermission(clerkSessionUrl);
    if (!sessionGranted) {
      setSettingsStatus('Auth access permission denied.', true);
      return false;
    }

    const token = await resolveClerkTokenFromCookies(clerkSessionUrl);
    if (!token) {
      setSettingsStatus('Not signed in. Please sign in first.', true);
      return false;
    }
  }

  await storageSet({
    serverUrl,
    clerkSessionUrl: clerkSessionUrl || null,
    jwtTemplate: jwtTemplate || null,
  });

  setSettingsStatus('All systems green. Saving...');
  return true;
}

function buildSignInUrl(raw, serverUrl) {
  const fallback = normalizeSignInUrl('', serverUrl);
  let signInUrl;
  if (!raw) {
    signInUrl = fallback;
  } else {
    try {
      const parsed = new URL(raw);
      if (parsed.pathname === '/' || parsed.pathname === '') {
        parsed.pathname = '/sign-in';
      }
      signInUrl = parsed.toString();
    } catch {
      signInUrl = normalizeSignInUrl(raw, serverUrl) || fallback;
    }
  }
  
  // Add redirect_url to send user to success page after sign-in
  try {
    const url = new URL(signInUrl);
    const serverOrigin = new URL(serverUrl).origin;
    url.searchParams.set('redirect_url', `${serverOrigin}/extension-auth-success`);
    return url.toString();
  } catch {
    return signInUrl;
  }
}

// Event Listeners

saveBtn.addEventListener('click', async () => {
  const success = await saveSettingsAction();
  if (success) {
    setTimeout(async () => {
      setStatus('Settings saved.');
      // Go back to main view
      viewSettings.classList.add('hidden');
      viewMain.classList.remove('hidden');
      if (settingsMessageEl) settingsMessageEl.classList.add('hidden');
      const settings = await loadSettings();
      updateUI(settings);
    }, 1000);
  }
});

syncBtn.addEventListener('click', () => {
  setStatus('Syncing...');
  chrome.runtime.sendMessage({ action: 'sync' }, (response) => {
    if (chrome.runtime.lastError) {
      setStatus('Error: Background script.');
      return;
    }
    const status = response?.status || 'UNKNOWN';
    const message = {
      ON: 'Cookies synced successfully.',
      WAIT: 'Waiting for HEB cookies.',
      AUTH: 'Sign in required.',
      PERM: 'Permission missing. Check Settings.',
      ERR: 'Server rejected cookies.',
      OFF: 'Server unreachable.',
      UNKNOWN: 'Sync triggered.',
    }[status] || 'Sync triggered.';
    
    setStatus(message);
    updateCookieStatus();
    
    // Auto-refresh UI state in case auth changed
    setTimeout(async () => {
        const settings = await loadSettings();
        updateUI(settings);
    }, 1000);
  });
});

signInBtn.addEventListener('click', async () => {
  const { serverUrl, clerkSessionUrl } = await loadSettings();
  const signInUrl = buildSignInUrl(clerkSessionUrl, serverUrl);
  if (!signInUrl) {
    setStatus('Configure Sign-In URL first.');
    viewMain.classList.add('hidden');
    viewSettings.classList.remove('hidden');
    return;
  }
  chrome.tabs.create({ url: signInUrl });
});

signOutBtn.addEventListener('click', async () => {
  const { serverUrl, clerkSessionUrl } = await loadSettings();
  
  // Clear stored token
  await storageRemove(['clerkToken']);
  
  // Clear Clerk session cookies
  if (clerkSessionUrl) {
    try {
      const origin = new URL(clerkSessionUrl).origin;
      const cookieNames = ['__session', '__clerk_session', '__client'];
      const origins = new Set([origin]);
      
      // Also try related subdomains
      if (origin.includes('://accounts.')) {
        origins.add(origin.replace('://accounts.', '://'));
        origins.add(origin.replace('://accounts.', '://clerk.'));
      }
      
      for (const currentOrigin of origins) {
        for (const name of cookieNames) {
          chrome.cookies.remove({ url: currentOrigin, name });
        }
      }
    } catch (e) {
      console.error('Failed to clear cookies:', e);
    }
  }
  
  setStatus('Signed out.');
  const settings = await loadSettings();
  updateUI(settings);
});

// Initialize
(async () => {
  const settings = await loadSettings();
  updateUI(settings);
  startCookieStatusTimer();
})();
