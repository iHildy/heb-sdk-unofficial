const statusEl = document.getElementById('status');
const serverUrlEl = document.getElementById('serverUrl');
const clerkKeyEl = document.getElementById('clerkKey');
const jwtTemplateEl = document.getElementById('jwtTemplate');
const saveBtn = document.getElementById('saveBtn');
const syncBtn = document.getElementById('syncBtn');
const authStatusEl = document.getElementById('authStatus');
const signOutBtn = document.getElementById('signOutBtn');
const clerkMountEl = document.getElementById('clerk-signin');

const DEFAULT_SERVER_URL = 'http://localhost:4321';

function setStatus(message) {
  statusEl.textContent = message;
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

function permissionsRequest(origins) {
  return new Promise((resolve) => {
    chrome.permissions.request({ origins }, resolve);
  });
}

async function loadSettings() {
  const config = await loadConfig();
  const { serverUrl, clerkPublishableKey, jwtTemplate, clerkToken } = await storageGet([
    'serverUrl',
    'clerkPublishableKey',
    'jwtTemplate',
    'clerkToken',
  ]);

  const resolvedServerUrl = serverUrl || config.serverUrl || DEFAULT_SERVER_URL;
  const resolvedClerkKey = clerkPublishableKey || config.clerkPublishableKey || '';
  const resolvedTemplate = jwtTemplate || config.jwtTemplate || '';

  serverUrlEl.value = resolvedServerUrl;
  clerkKeyEl.value = resolvedClerkKey;
  jwtTemplateEl.value = resolvedTemplate;

  const shouldPersist = !serverUrl || !clerkPublishableKey || !jwtTemplate;
  if (shouldPersist && (config.serverUrl || config.clerkPublishableKey || config.jwtTemplate)) {
    await storageSet({
      serverUrl: resolvedServerUrl,
      clerkPublishableKey: resolvedClerkKey || null,
      jwtTemplate: resolvedTemplate || null,
    });
  }

  return {
    serverUrl: resolvedServerUrl,
    clerkPublishableKey: resolvedClerkKey,
    jwtTemplate: resolvedTemplate,
    clerkToken,
  };
}

async function requestHostPermission(serverUrl) {
  try {
    const origin = new URL(serverUrl).origin;
    const granted = await permissionsRequest([`${origin}/*`]);
    return granted;
  } catch (error) {
    console.error('Failed to request host permission:', error);
    return false;
  }
}

async function saveSettings() {
  const serverUrl = serverUrlEl.value.trim() || DEFAULT_SERVER_URL;
  const clerkPublishableKey = clerkKeyEl.value.trim();
  const jwtTemplate = jwtTemplateEl.value.trim();

  const granted = await requestHostPermission(serverUrl);
  if (!granted) {
    setStatus('Permission denied for server URL.');
    return;
  }

  await storageSet({
    serverUrl,
    clerkPublishableKey,
    jwtTemplate: jwtTemplate || null,
  });

  setStatus('Settings saved.');

  if (clerkPublishableKey) {
    await initClerk(clerkPublishableKey, jwtTemplate || null);
  }
}

async function refreshToken(jwtTemplate) {
  if (!window.Clerk || !window.Clerk.session) return;

  try {
    const token = await window.Clerk.session.getToken(
      jwtTemplate ? { template: jwtTemplate } : undefined
    );

    if (token) {
      await storageSet({ clerkToken: token });
      authStatusEl.textContent = `Signed in as ${window.Clerk.user?.primaryEmailAddress?.emailAddress ?? window.Clerk.user?.id}`;
    }
  } catch (error) {
    console.error('Failed to refresh Clerk token:', error);
    setStatus('Failed to refresh token.');
  }
}

async function initClerk(publishableKey, jwtTemplate) {
  if (!window.Clerk) {
    setStatus('Clerk SDK failed to load.');
    return;
  }

  await window.Clerk.load({ publishableKey });

  const updateUi = async () => {
    if (window.Clerk.user) {
      authStatusEl.textContent = `Signed in as ${window.Clerk.user.primaryEmailAddress?.emailAddress ?? window.Clerk.user.id}`;
      signOutBtn.style.display = 'block';
      clerkMountEl.innerHTML = '';
      await refreshToken(jwtTemplate);
    } else {
      authStatusEl.textContent = 'Not signed in';
      signOutBtn.style.display = 'none';
      clerkMountEl.innerHTML = '';
      window.Clerk.mountSignIn(clerkMountEl, { routing: 'virtual' });
    }
  };

  window.Clerk.addListener(() => {
    updateUi().catch(console.error);
  });

  await updateUi();
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
    setStatus('Sync triggered. Check badge.');
  });
});

signOutBtn.addEventListener('click', async () => {
  if (!window.Clerk) return;
  await window.Clerk.signOut();
  await storageRemove(['clerkToken']);
  authStatusEl.textContent = 'Not signed in';
  signOutBtn.style.display = 'none';
  clerkMountEl.innerHTML = '';
  window.Clerk.mountSignIn(clerkMountEl, { routing: 'virtual' });
});

(async () => {
  const { clerkPublishableKey, jwtTemplate } = await loadSettings();
  if (clerkPublishableKey) {
    await initClerk(clerkPublishableKey, jwtTemplate || null);
  } else {
    authStatusEl.textContent = 'Add Clerk key to enable sign-in';
  }
})();
