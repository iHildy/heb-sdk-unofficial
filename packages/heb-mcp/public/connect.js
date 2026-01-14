const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const authHint = document.getElementById('authHint');
const exchangeStatus = document.getElementById('exchangeStatus');
const codeInput = document.getElementById('codeInput');
const openAuth = document.getElementById('openAuth');
const copyAuth = document.getElementById('copyAuth');
const exchangeBtn = document.getElementById('exchangeBtn');
const refreshStatus = document.getElementById('refreshStatus');
const pasteClipboard = document.getElementById('pasteClipboard');
const clerkSignIn = document.getElementById('clerkSignIn');
const clerkSignOut = document.getElementById('clerkSignOut');
const clerkStatus = document.getElementById('clerkStatus');
const clerkHint = document.getElementById('clerkHint');
const clerkLinkRow = document.getElementById('clerkLinkRow');
const clerkSignInLink = document.getElementById('clerkSignInLink');
const clerkInlineWrap = document.getElementById('clerkInlineWrap');
const clerkInline = document.getElementById('clerkInline');

const connectConfig = window.__connectConfig || {};

let codeVerifier = sessionStorage.getItem('heb_code_verifier');
let authUrl = sessionStorage.getItem('heb_auth_url');
let clerkInlineMounted = false;

function base64Url(bytes) {
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

function randomString(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64Url(data);
}

function extractCode(raw) {
  if (!raw) return null;
  let trimmed = raw.trim();
  if (trimmed.toLowerCase().startsWith('location:')) {
    trimmed = trimmed.slice('location:'.length).trim();
  }
  if (trimmed.includes('code=')) {
    try {
      const url = new URL(trimmed);
      return url.searchParams.get('code');
    } catch {
      const match = trimmed.match(/code=([^&\s]+)/);
      return match ? match[1] : null;
    }
  }
  return trimmed.length > 4 ? trimmed : null;
}

async function waitForClerkLoad() {
  if (!connectConfig.clerkPublishableKey) return null;
  if (window.Clerk) return window.Clerk;
  const script = document.getElementById('clerkScript');
  if (!script) return null;
  await new Promise((resolve) => {
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', resolve, { once: true });
  });
  return window.Clerk || null;
}

async function loadClerk() {
  const clerk = await waitForClerkLoad();
  if (!clerk) return null;
  if (typeof clerk.load === 'function') {
    await clerk.load();
  }
  return clerk;
}

async function getClerkToken() {
  const clerk = await loadClerk();
  if (!clerk || !clerk.session || typeof clerk.session.getToken !== 'function') return null;
  try {
    return await clerk.session.getToken({ template: connectConfig.clerkJwtTemplate || undefined });
  } catch (err) {
    return null;
  }
}

async function fetchWithAuth(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = await getClerkToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers, credentials: 'include' });
}

function setSignedInState(signedIn) {
  const enforce = Boolean(connectConfig.clerkPublishableKey);
  const ready = signedIn || !enforce;
  openAuth.disabled = !ready;
  copyAuth.disabled = !ready;
  exchangeBtn.disabled = !ready;
  if (!ready) {
    authHint.textContent = 'Sign in to continue.';
  } else if (authHint.textContent === 'Sign in to continue.') {
    authHint.textContent = '';
  }

  clerkSignOut.classList.toggle('hidden', !signedIn);
  clerkSignIn.classList.toggle('hidden', signedIn);
  statusBadge.classList.toggle('warn', enforce && !signedIn);
}

async function refreshClerkUi() {
  const clerk = await loadClerk();
  const signedIn = Boolean(clerk && clerk.session);
  setSignedInState(signedIn);
  clerkLinkRow.classList.toggle('hidden', signedIn || !connectConfig.signInUrl);
  if (signedIn) {
    clerkInlineWrap.classList.add('hidden');
  }

  if (!connectConfig.clerkPublishableKey) {
    clerkStatus.textContent = 'Clerk not configured. Set CLERK_PUBLISHABLE_KEY.';
    clerkStatus.className = 'error';
    if (connectConfig.signInUrl) {
      clerkSignInLink.href = connectConfig.signInUrl;
    }
    return signedIn;
  }

  if (signedIn) {
    const label = clerk.user ? (clerk.user.primaryEmailAddress?.emailAddress || clerk.user.username || clerk.user.id || 'Signed in') : 'Signed in';
    clerkStatus.textContent = label;
    clerkStatus.className = 'status';
    clerkHint.textContent = 'You are signed in. Continue to H‑E‑B login below.';
  } else {
    clerkStatus.textContent = 'Not signed in';
    clerkStatus.className = 'error';
    clerkHint.textContent = connectConfig.signInUrl ? 'Sign in to continue. A new tab may open for authentication.' : 'Sign in to continue.';
    if (connectConfig.signInUrl) {
      clerkSignInLink.href = connectConfig.signInUrl;
    }
    if (!clerkInlineMounted && clerkInline && clerkInlineWrap && clerk && typeof clerk.mountSignIn === 'function') {
      clerkInlineWrap.classList.remove('hidden');
      clerkInlineMounted = true;
      clerk.mountSignIn(clerkInline, { redirectUrl: window.location.href });
    }
  }

  return signedIn;
}

async function loadConfig() {
  const res = await fetch('/api/heb/oauth/config', { credentials: 'include' });
  if (!res.ok) throw new Error('Unable to load OAuth config');
  return res.json();
}

async function prepareAuth() {
  const config = await loadConfig();
  codeVerifier = randomString(32);
  const challengeBytes = await sha256(codeVerifier);
  const codeChallenge = base64Url(challengeBytes);

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: config.scope,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: randomString(16),
    nonce: randomString(16),
    client_request_id: crypto.randomUUID(),
    clientAmpDeviceId: crypto.randomUUID(),
    clientAmpSessionId: String(Date.now()),
    prompt: 'login',
  });

  authUrl = config.authUrl + '?' + params.toString();
  sessionStorage.setItem('heb_code_verifier', codeVerifier);
  sessionStorage.setItem('heb_auth_url', authUrl);
  authHint.textContent = 'Ready';
}

async function refreshStatusUi() {
  try {
    const res = await fetchWithAuth('/api/heb/oauth/status');
    if (res.status === 401) {
      statusBadge.textContent = 'Sign in required';
      statusBadge.classList.add('warn');
      statusText.textContent = 'Sign in to check connection status.';
      return;
    }
    const data = await res.json();
    if (data.connected) {
      statusBadge.classList.remove('warn');
      statusBadge.textContent = 'Linked';
      statusText.textContent = data.expiresAt ? 'Connected · expires ' + new Date(data.expiresAt).toLocaleString() : 'Connected';
      statusBadge.className = 'inline-block bg-accent-soft text-accent px-3 py-1 rounded-full font-semibold text-xs tracking-wider uppercase';
    } else {
      statusBadge.classList.remove('warn');
      statusBadge.textContent = 'Not linked';
      statusText.textContent = 'Not connected yet.';
      statusBadge.className = 'inline-block warn px-3 py-1 rounded-full font-semibold text-xs tracking-wider uppercase border';
    }
  } catch (err) {
    statusBadge.textContent = 'Unknown';
    statusText.textContent = 'Unable to check status.';
  }
}

openAuth.addEventListener('click', async () => {
  exchangeStatus.textContent = '';
  const signedIn = await refreshClerkUi();
  if (!signedIn && connectConfig.clerkPublishableKey) {
    exchangeStatus.textContent = 'Please sign in to HEB MCP first.';
    exchangeStatus.className = 'error';
    return;
  }
  if (!authUrl) await prepareAuth();
  window.open(authUrl, '_blank', 'noopener');
});

copyAuth.addEventListener('click', async () => {
  const signedIn = await refreshClerkUi();
  if (!signedIn && connectConfig.clerkPublishableKey) {
    exchangeStatus.textContent = 'Please sign in to HEB MCP first.';
    exchangeStatus.className = 'error';
    return;
  }
  if (!authUrl) await prepareAuth();
  await navigator.clipboard.writeText(authUrl);
  authHint.textContent = 'Copied login URL';
  setTimeout(() => authHint.textContent = '', 1500);
});

exchangeBtn.addEventListener('click', async () => {
  exchangeStatus.textContent = '';
  const signedIn = await refreshClerkUi();
  if (!signedIn && connectConfig.clerkPublishableKey) {
    exchangeStatus.textContent = 'Please sign in to HEB MCP first.';
    exchangeStatus.className = 'error';
    return;
  }
  const code = extractCode(codeInput.value);
  if (!code) {
    exchangeStatus.textContent = 'Please paste a valid code or redirect URL.';
    exchangeStatus.className = 'error';
    return;
  }
  if (!codeVerifier) {
    exchangeStatus.textContent = 'Missing code verifier. Please click “Open H‑E‑B Login” again.';
    exchangeStatus.className = 'error';
    return;
  }
  exchangeBtn.disabled = true;
  exchangeStatus.textContent = 'Linking…';
  exchangeStatus.className = 'status';

  try {
    const res = await fetchWithAuth('/api/heb/oauth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: codeVerifier }),
    });
    if (!res.ok) {
      throw new Error('Exchange failed');
    }
    exchangeStatus.textContent = 'Linked successfully!';
    exchangeStatus.className = 'success';
    await refreshStatusUi();
  } catch (err) {
    exchangeStatus.textContent = 'Failed to link. Try again or re-open login.';
    exchangeStatus.className = 'error';
  } finally {
    exchangeBtn.disabled = false;
  }
});

pasteClipboard.addEventListener('click', async () => {
  exchangeStatus.textContent = '';
  if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
    exchangeStatus.textContent = 'Clipboard access is not available in this browser.';
    exchangeStatus.className = 'error';
    return;
  }
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      exchangeStatus.textContent = 'Clipboard is empty.';
      exchangeStatus.className = 'error';
      return;
    }
    codeInput.value = text;
    exchangeStatus.textContent = 'Pasted from clipboard.';
    exchangeStatus.className = 'status';
  } catch (err) {
    exchangeStatus.textContent = 'Unable to read clipboard. Paste manually.';
    exchangeStatus.className = 'error';
  }
});

clerkSignIn.addEventListener('click', async () => {
  exchangeStatus.textContent = '';
  const clerk = await loadClerk();
  if (clerk && typeof clerk.openSignIn === 'function') {
    try {
      await clerk.openSignIn({ redirectUrl: window.location.href });
      return;
    } catch (err) {
      // Fall through to sign-in link
    }
  }
  if (connectConfig.signInUrl) {
    window.open(connectConfig.signInUrl, '_blank', 'noopener');
  } else {
    clerkStatus.textContent = 'Missing Clerk sign-in URL.';
    clerkStatus.className = 'error';
  }
});

clerkSignOut.addEventListener('click', async () => {
  const clerk = await loadClerk();
  if (clerk && typeof clerk.signOut === 'function') {
    await clerk.signOut();
  }
  await refreshClerkUi();
  await refreshStatusUi();
});

refreshStatus.addEventListener('click', refreshStatusUi);
window.addEventListener('focus', () => {
  refreshClerkUi();
  refreshStatusUi();
});

refreshClerkUi().then(() => refreshStatusUi());
