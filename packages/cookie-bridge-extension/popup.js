const statusEl = document.getElementById('statusMessage');
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
const serverStatusIcon = document.getElementById('serverStatusIcon');
const signInStatusIcon = document.getElementById('signInStatusIcon');

const debugEl = document.getElementById('debug');
const syncSection = document.getElementById('syncSection');

const DEFAULT_SERVER_URL = 'http://localhost:4321';

// Helpers for Cookies
function getCookieValue(url, name) {
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

function updatePermissionVisuals(serverStatus, sessionStatus) {
  // Server Status
  if (serverStatus === 'granted') {
    serverStatusIcon.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]';
  } else {
    serverStatusIcon.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.4)]';
  }

  // Session Status
  if (sessionStatus === 'granted') {
    signInStatusIcon.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]';
  } else {
    signInStatusIcon.className = 'w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.4)]';
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
  const { permissionStatus, sessionPermissionStatus, isSignedIn } = settings;
  
  updatePermissionVisuals(permissionStatus, sessionPermissionStatus);

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

  // Try to request permissions
  const serverGranted = await requestHostPermission(serverUrl);
  if (!serverGranted) {
    setStatus('Permission denied (Server).');
    return false;
  }

  if (clerkSessionUrl) {
    const sessionGranted = await requestHostPermission(clerkSessionUrl);
    if (!sessionGranted) {
      setStatus('Permission denied (Sign-in).');
      return false;
    }
  }

  await storageSet({
    serverUrl,
    clerkSessionUrl: clerkSessionUrl || null,
    jwtTemplate: jwtTemplate || null,
  });

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
    setStatus('Settings saved.');
    // Go back to main view
    viewSettings.classList.add('hidden');
    viewMain.classList.remove('hidden');
    const settings = await loadSettings();
    updateUI(settings);
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
})();
