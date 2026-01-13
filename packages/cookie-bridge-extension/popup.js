const statusEl = document.getElementById('status');
const serverUrlEl = document.getElementById('serverUrl');
const clerkSessionUrlEl = document.getElementById('clerkSessionUrl');
const jwtTemplateEl = document.getElementById('jwtTemplate');
const saveBtn = document.getElementById('saveBtn');
const syncBtn = document.getElementById('syncBtn');
const authStatusEl = document.getElementById('authStatus');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const clerkMountEl = document.getElementById('clerk-signin');
const debugEl = document.getElementById('debug');

const DEFAULT_SERVER_URL = 'http://localhost:4321';

function setStatus(message) {
  statusEl.textContent = message;
}

function setDebug(lines) {
  if (!debugEl) return;
  debugEl.innerHTML = Array.isArray(lines) ? lines.join('<br />') : String(lines || '');
}

function isValidPublishableKey(key) {
  return typeof key === 'string' && (key.startsWith('pk_live_') || key.startsWith('pk_test_'));
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
  const { serverUrl, clerkSessionUrl, jwtTemplate } = await storageGet([
    'serverUrl',
    'clerkSessionUrl',
    'jwtTemplate',
  ]);

  const resolvedServerUrl = serverUrl || config.serverUrl || DEFAULT_SERVER_URL;
  const configSessionUrl = config.clerkSignInUrl
    || config.clerkSignInURL
    || config.clerkSessionUrl
    || (typeof config.clerkPublishableKey === 'string' && config.clerkPublishableKey.startsWith('http') ? config.clerkPublishableKey : '');
  const resolvedSessionUrl = normalizeSignInUrl(clerkSessionUrl || configSessionUrl, resolvedServerUrl);
  const resolvedTemplate = jwtTemplate || config.jwtTemplate || '';

  serverUrlEl.value = resolvedServerUrl;
  clerkSessionUrlEl.value = resolvedSessionUrl;
  jwtTemplateEl.value = resolvedTemplate;

  const shouldPersist = !serverUrl || !clerkSessionUrl || !jwtTemplate;
  if (shouldPersist && (config.serverUrl || config.clerkSessionUrl || config.jwtTemplate)) {
    await storageSet({
      serverUrl: resolvedServerUrl,
      clerkSessionUrl: resolvedSessionUrl || null,
      jwtTemplate: resolvedTemplate || null,
    });
  }

  let permissionStatus = 'unknown';
  let sessionPermissionStatus = 'unknown';
  try {
    const origin = new URL(resolvedServerUrl).origin;
    const hasPermission = await permissionsContains([`${origin}/*`]);
    permissionStatus = hasPermission ? 'granted' : 'missing';
  } catch {
    permissionStatus = 'invalid-server-url';
  }

  try {
    const sessionOrigin = new URL(resolvedSessionUrl).origin;
    const hasPermission = await permissionsContains([`${sessionOrigin}/*`]);
    sessionPermissionStatus = hasPermission ? 'granted' : 'missing';
  } catch {
    sessionPermissionStatus = 'invalid-session-url';
  }

  setDebug([
    `Server: ${resolvedServerUrl}`,
    `Sign-in URL: ${resolvedSessionUrl || 'missing'}`,
    `JWT template: ${resolvedTemplate || 'none'}`,
    `Server permission: ${permissionStatus}`,
    `Sign-in permission: ${sessionPermissionStatus}`,
  ]);

  return {
    serverUrl: resolvedServerUrl,
    clerkSessionUrl: resolvedSessionUrl,
    jwtTemplate: resolvedTemplate,
    permissionStatus,
    sessionPermissionStatus,
  };
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

async function saveSettings() {
  const serverUrl = serverUrlEl.value.trim() || DEFAULT_SERVER_URL;
  const clerkSessionUrl = normalizeSignInUrl(clerkSessionUrlEl.value, serverUrl);
  const jwtTemplate = jwtTemplateEl.value.trim();

  const serverGranted = await requestHostPermission(serverUrl);
  if (!serverGranted) {
    setStatus('Permission denied for server URL. Check site access.');
    return;
  }

  if (clerkSessionUrl) {
    const sessionGranted = await requestHostPermission(clerkSessionUrl);
    if (!sessionGranted) {
      setStatus('Permission denied for sign-in URL. Check site access.');
      return;
    }
  }

  await storageSet({
    serverUrl,
    clerkSessionUrl: clerkSessionUrl || null,
    jwtTemplate: jwtTemplate || null,
  });

  setStatus('Settings saved. Host permissions granted.');

  authStatusEl.textContent = 'Sign in via browser.';
  signOutBtn.style.display = 'block';
}

function buildSignInUrl(raw, serverUrl) {
  const fallback = normalizeSignInUrl('', serverUrl);
  if (!raw) return fallback;
  try {
    const parsed = new URL(raw);
    if (parsed.pathname === '/' || parsed.pathname === '') {
      parsed.pathname = '/sign-in';
    }
    return parsed.toString();
  } catch {
    return normalizeSignInUrl(raw, serverUrl) || fallback;
  }
}

saveBtn.addEventListener('click', () => {
  saveSettings().catch(console.error);
});

syncBtn.addEventListener('click', () => {
  setStatus('Syncing...');
  chrome.runtime.sendMessage({ action: 'sync' }, (response) => {
    if (chrome.runtime.lastError) {
      setStatus('Error calling background');
      return;
    }
    const status = response?.status || 'UNKNOWN';
    const message = {
      ON: 'Cookies synced successfully.',
      WAIT: 'Waiting for HEB cookies (sat/reese84).',
      AUTH: 'Sign in required. Use Open Sign-In Page.',
      PERM: 'Host permission missing. Click Save Settings.',
      ERR: 'Server rejected cookies.',
      OFF: 'Server offline or unreachable.',
      UNKNOWN: 'Sync triggered. Check badge.',
    }[status] || 'Sync triggered. Check badge.';
    setStatus(message);
  });
});

signInBtn.addEventListener('click', async () => {
  const { serverUrl, clerkSessionUrl } = await loadSettings();
  const signInUrl = buildSignInUrl(clerkSessionUrl, serverUrl);
  if (!signInUrl) {
    setStatus('Missing sign-in URL. Update settings first.');
    return;
  }
  chrome.tabs.create({ url: signInUrl });
});

signOutBtn.addEventListener('click', async () => {
  const { serverUrl, clerkSessionUrl } = await loadSettings();
  const baseUrl = normalizeSignInUrl(clerkSessionUrl, serverUrl).replace(/\/sign-in$/, '');
  if (baseUrl) {
    chrome.tabs.create({ url: `${baseUrl}/sign-out` });
  }
  await storageRemove(['clerkToken']);
  authStatusEl.textContent = 'Not signed in';
  signOutBtn.style.display = 'block';
});

(async () => {
  const { permissionStatus, sessionPermissionStatus } = await loadSettings();
  if (permissionStatus === 'missing' || sessionPermissionStatus === 'missing') {
    setStatus('Host permission missing. Click Save Settings.');
  }
  authStatusEl.textContent = 'Sign in via browser.';
  signOutBtn.style.display = 'block';
})();
