import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { clsx, type ClassValue } from 'clsx';
import { AlertCircle, CheckCircle2, Clipboard, ExternalLink, Loader2, LogIn, RefreshCw } from 'lucide-react';
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
  const { user } = useUser();
  
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
        setStatusText(data.expiresAt ? `Connected · Expires ${new Date(data.expiresAt).toLocaleDateString()}` : 'Connected');
      } else {
        setStatus('Not linked');
        setStatusText('Not connected yet.');
      }
    } catch {
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
      setCodeInput('');
    } catch {
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
    } catch {
      setExchangeStatus({ text: 'Unable to read clipboard.', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Intro / Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-heb-gray">Connect Account</h1>
          <p className="text-ink-light mt-1">Link your H‑E‑B account to enable shopping features.</p>
        </div>
        
        {/* Status Badge */}
        <div className={cn(
          "px-4 py-2 rounded-full font-bold text-sm tracking-wide border flex items-center gap-2 w-fit",
          status === 'Linked' 
            ? "bg-[#008148]/10 text-[#008148] border-[#008148]/20" 
            : "bg-gray-100 text-gray-600 border-gray-200"
        )}>
          {status === 'Linked' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status}
        </div>
      </div>

      {/* Step 1: Sign In */}
      <section className="card">
        <h2 className="text-lg font-bold text-heb-red mb-1">Step 1: Sign in to MCP</h2>
        <p className="text-ink-light text-sm mb-4">Authenticate with this MCP server securely.</p>
        
        <div className="flex flex-wrap items-center gap-4">
          {!user ? (
            <button 
              onClick={() => openSignIn({ forceRedirectUrl: window.location.href })}
              className="btn-primary"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
               <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed in as</span>
                  <span className="font-semibold text-heb-gray">
                    {user.primaryEmailAddress?.emailAddress || user.username}
                  </span>
               </div>
               <button 
                  onClick={() => signOut()}
                  className="text-xs text-heb-red hover:underline font-medium"
                >
                  Sign Out
               </button>
            </div>
          )}
        </div>
      </section>

      {/* Step 2: HEB Login */}
      <section className={cn("card transition-opacity duration-300", !user && "opacity-60 pointer-events-none")}>
        <h2 className="text-lg font-bold text-heb-red mb-1">Step 2: Authenticate with H‑E‑B</h2>
        <p className="text-ink-light text-sm mb-4">Open the login page, sign in, and copy the code.</p>
        
        <div className="flex flex-wrap gap-3">
          <button 
            disabled={!user}
            onClick={handleOpenAuth} 
            className="btn-primary"
          >
            <ExternalLink className="w-4 h-4" /> Open H‑E‑B Login
          </button>
          <button 
            disabled={!user}
            onClick={handleCopyAuth}
            className="btn-secondary"
          >
            <Clipboard className="w-4 h-4" /> Copy URL
          </button>
        </div>
      </section>

      {/* Step 3: Exchange Code */}
      <section className={cn("card transition-opacity duration-300", !user && "opacity-60 pointer-events-none")}>
        <h2 className="text-lg font-bold text-heb-red mb-1">Step 3: Complete Connection</h2>
        <p className="text-ink-light text-sm mb-4">Paste the redirect URL or authorization code below.</p>
        
        <div className="flex flex-col gap-3">
            <div className="relative">
                <textarea 
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-heb-red focus:ring-1 focus:ring-heb-red outline-none text-sm font-mono min-h-[80px] bg-gray-50 placeholder:text-gray-400 resize-y" 
                    placeholder="Paste redirect URL or authorization code here"
                />
                 {codeInput && (
                     <button onClick={() => setCodeInput('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                        <span className="sr-only">Clear</span>
                        ×
                     </button>
                 )}
            </div>

          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex gap-3">
                <button 
                disabled={!user || loading || !codeInput}
                onClick={handleExchange}
                className="btn-primary"
                >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Link Account'}
                </button>
                <button 
                onClick={handlePaste}
                className="text-sm font-semibold text-heb-red hover:underline px-2"
                >
                Paste from clipboard
                </button>
            </div>
            
             <span className={cn("text-sm font-medium animate-in fade-in slide-in-from-left-2", exchangeStatus.type === 'error' ? 'text-heb-red' : 'text-[#008148]')}>
              {exchangeStatus.text}
            </span>
          </div>

           <details className="mt-2 text-xs text-gray-500 cursor-pointer group">
            <summary className="font-semibold hover:text-heb-red transition-colors list-none flex items-center gap-1 select-none">
                <span className="group-open:rotate-90 transition-transform">▸</span> Help: Where do I find the code?
            </summary>
            <div className="pl-4 pt-2 leading-relaxed">
                After login/consent, your browser will redirect to a callback URL containing a <code>code</code> query parameter.
                Copy the full redirect URL from the address bar and paste it above, or paste the code value directly.
            </div>
          </details>
        </div>
      </section>

      {/* Network Status */}
       <div className="flex justify-end">
          <button 
            onClick={refreshStatus}
            className="text-xs font-semibold text-gray-400 hover:text-heb-red flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> {statusText}
          </button>
        </div>

    </div>
  );
}
