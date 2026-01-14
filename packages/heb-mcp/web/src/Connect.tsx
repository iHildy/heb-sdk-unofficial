import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { clsx, type ClassValue } from 'clsx';
import { Clipboard, ExternalLink, Loader2, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(message: string) {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

function randomString(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64Url(data);
}

function extractCode(raw: string) {
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

export default function Connect() {
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { openSignIn, signOut } = useClerk();
  const { user, isLoaded: userLoaded } = useUser();
  
  const [status, setStatus] = useState<'Linked' | 'Not linked' | 'Checking status…' | 'Unknown' | 'Sign in required'>('Checking status…');
  const [statusText, setStatusText] = useState('Checking…');
  const [exchangeStatus, setExchangeStatus] = useState({ text: '', type: '' });
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);

  const connectConfig = useMemo(() => window.__connectConfig || {
    clerkJwtTemplate: null,
    clerkPublishableKey: null,
    signInUrl: null,
    clerkFrontendApi: null
  }, []);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken({ template: connectConfig.clerkJwtTemplate || undefined });
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers, credentials: 'include' });
  }, [getToken, connectConfig.clerkJwtTemplate]);

  const refreshStatus = useCallback(async () => {
    if (!authLoaded) return;
    
    try {
      const res = await fetchWithAuth('/api/heb/oauth/status');
      if (res.status === 401) {
        setStatus('Sign in required');
        setStatusText('Sign in to check connection status.');
        return;
      }
      const data = await res.json();
      if (data.connected) {
        setStatus('Linked');
        setStatusText(data.expiresAt ? `Connected · expires ${new Date(data.expiresAt).toLocaleString()}` : 'Connected');
      } else {
        setStatus('Not linked');
        setStatusText('Not connected yet.');
      }
    } catch (err) {
      setStatus('Unknown');
      setStatusText('Unable to check status.');
    }
  }, [authLoaded, fetchWithAuth]);

  useEffect(() => {
    if (authLoaded) {
      refreshStatus();
    }
  }, [authLoaded, refreshStatus]);

  const prepareAuth = async () => {
    try {
      const res = await fetch('/api/heb/oauth/config', { credentials: 'include' });
      if (!res.ok) throw new Error('Unable to load OAuth config');
      const config = await res.json();
      
      const verifier = randomString(32);
      const challengeBytes = await sha256(verifier);
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

      const url = config.authUrl + '?' + params.toString();
      setCodeVerifier(verifier);
      setAuthUrl(url);
      sessionStorage.setItem('heb_code_verifier', verifier);
      return url;
    } catch (err) {
      console.error(err);
      setExchangeStatus({ text: 'Failed to prepare auth. Please refresh.', type: 'error' });
      return null;
    }
  };

  const handleOpenAuth = async () => {
    setExchangeStatus({ text: '', type: '' });
    if (!user && connectConfig.clerkPublishableKey) {
      setExchangeStatus({ text: 'Please sign in to HEB MCP first.', type: 'error' });
      return;
    }
    let currentAuthUrl = authUrl;
    if (!currentAuthUrl) {
      currentAuthUrl = await prepareAuth();
    }
    if (currentAuthUrl) {
      window.open(currentAuthUrl, '_blank', 'noopener');
    }
  };

  const handleCopyAuth = async () => {
    if (!user && connectConfig.clerkPublishableKey) {
      setExchangeStatus({ text: 'Please sign in to HEB MCP first.', type: 'error' });
      return;
    }
    let currentAuthUrl = authUrl;
    if (!currentAuthUrl) {
      currentAuthUrl = await prepareAuth();
    }
    if (currentAuthUrl) {
      await navigator.clipboard.writeText(currentAuthUrl);
      setExchangeStatus({ text: 'Copied login URL', type: 'status' });
      setTimeout(() => setExchangeStatus({ text: '', type: '' }), 1500);
    }
  };

  const handleExchange = async () => {
    setExchangeStatus({ text: '', type: '' });
    if (!user && connectConfig.clerkPublishableKey) {
      setExchangeStatus({ text: 'Please sign in to HEB MCP first.', type: 'error' });
      return;
    }
    const code = extractCode(codeInput);
    if (!code) {
      setExchangeStatus({ text: 'Please paste a valid code or redirect URL.', type: 'error' });
      return;
    }
    const verifier = codeVerifier || sessionStorage.getItem('heb_code_verifier');
    if (!verifier) {
      setExchangeStatus({ text: 'Missing code verifier. Please click “Open H‑E‑B Login” again.', type: 'error' });
      return;
    }
    
    setLoading(true);
    setExchangeStatus({ text: 'Linking…', type: 'status' });

    try {
      const res = await fetchWithAuth('/api/heb/oauth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, code_verifier: verifier }),
      });
      if (!res.ok) {
        throw new Error('Exchange failed');
      }
      setExchangeStatus({ text: 'Linked successfully!', type: 'success' });
      await refreshStatus();
    } catch (err) {
      setExchangeStatus({ text: 'Failed to link. Try again or re-open login.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
      setExchangeStatus({ text: 'Clipboard access is not available in this browser.', type: 'error' });
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setExchangeStatus({ text: 'Clipboard is empty.', type: 'error' });
        return;
      }
      setCodeInput(text);
      setExchangeStatus({ text: 'Pasted from clipboard.', type: 'status' });
    } catch (err) {
    }
  };

  return (
    <div className="max-w-[960px] mx-auto grid gap-6 p-4 md:p-8">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="inline-block bg-accent-soft text-accent px-3 py-1 rounded-full font-semibold text-xs tracking-wider uppercase">HEB MCP</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">Connect your H‑E‑B account</h1>
          <p className="text-muted text-lg mt-1">Link H‑E‑B once to enable shopping, cart, and pickup actions.</p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full font-semibold text-xs tracking-wider uppercase",
          status === 'Linked' ? "bg-accent-soft text-accent" : "warn"
        )}>
          {status}
        </div>
      </header>

      <div className="bg-card rounded-[24px] border border-border-main p-6 md:p-8 shadow-xl shadow-black/5">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm">0</span>
          Sign in to HEB MCP
        </h2>
        <p className="text-muted mb-6">We store your H‑E‑B tokens securely in your account so you can use HEB MCP from any client.</p>
        <div className="flex flex-wrap gap-3 items-center">
          {!user ? (
            <button 
              onClick={() => openSignIn({ forceRedirectUrl: window.location.href })}
              className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </button>
          ) : (
            <button 
              onClick={() => signOut()}
              className="bg-transparent text-ink border border-border-main px-6 py-2.5 rounded-full font-semibold hover:bg-black/5 transition-all cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
          <span className={cn("text-sm", user ? "status" : "text-muted italic")}>
            {userLoaded ? (user ? user.primaryEmailAddress?.emailAddress || user.username || 'Signed in' : 'Not signed in') : 'Checking sign-in…'}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-[24px] border border-border-main p-6 md:p-8 shadow-xl shadow-black/5">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm">1</span>
          Sign in with H‑E‑B
        </h2>
        <p className="text-muted mb-6">We’ll open the H‑E‑B mobile login in a new tab. Complete login and OTP, then return here.</p>
        <div className="flex flex-wrap gap-3 items-center">
          <button 
            disabled={!user}
            onClick={handleOpenAuth} 
            className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-4 h-4" /> Open H‑E‑B Login
          </button>
          <button 
            disabled={!user}
            onClick={handleCopyAuth}
            className="bg-white text-accent border border-accent px-6 py-2.5 rounded-full font-semibold hover:bg-accent/5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clipboard className="w-4 h-4" /> Copy Login URL
          </button>
        </div>
      </div>

      <div className="bg-card rounded-[24px] border border-border-main p-6 md:p-8 shadow-xl shadow-black/5">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm">2</span>
          Paste the redirect code
        </h2>
        <p className="text-muted mb-6">After login, your browser will attempt to open <code>com.heb.myheb://oauth2redirect</code>. Copy the full URL or just the <code>code</code> value and paste it below.</p>
        <div className="grid gap-4">
          <textarea 
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border-main text-sm font-mono min-h-[100px] focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/50 transition-all bg-white" 
            placeholder="Paste redirect URL or code here"
          />
          <div className="flex flex-wrap gap-3 items-center">
            <button 
              disabled={!user || loading}
              onClick={handleExchange}
              className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Link H‑E‑B
            </button>
            <button 
              onClick={handlePaste}
              className="bg-white text-accent border border-accent px-6 py-2.5 rounded-full font-semibold hover:bg-accent/5 transition-all cursor-pointer"
            >
              Paste from clipboard
            </button>
            <span className={cn("font-semibold text-sm", exchangeStatus.type === 'error' ? 'text-danger' : 'text-accent')}>
              {exchangeStatus.text}
            </span>
          </div>
          <details className="text-muted text-sm border border-dashed border-[#d7c8b3] rounded-xl p-3 bg-[#fffdf9]">
            <summary className="cursor-pointer font-bold select-none">Stuck on “Allow”? Here’s how to find the code.</summary>
            <p className="mt-2 leading-relaxed">After you click Allow, H‑E‑B responds with a redirect to <code>com.heb.myheb://oauth2redirect?code=…</code>. Some browsers hang when the app isn’t installed. Open the Network tab for the H‑E‑B login page and look for a <code>303</code> response with a <code>Location</code> header that starts with <code>com.heb.myheb://oauth2redirect</code>. Paste that URL or just the <code>code</code> value here.</p>
          </details>
        </div>
      </div>

      <div className="bg-card rounded-[24px] border border-border-main p-6 md:p-8 shadow-xl shadow-black/5">
        <h2 className="text-xl font-bold mb-2">Status</h2>
        <p className="text-muted mb-6">{statusText}</p>
        <div className="flex gap-3">
          <button 
            onClick={refreshStatus}
            className="bg-white text-accent border border-accent px-6 py-2.5 rounded-full font-semibold hover:bg-accent/5 transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh status
          </button>
        </div>
      </div>
    </div>
  );
}
