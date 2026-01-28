type ClerkDiscovery = {
  device_authorization_endpoint?: string;
  token_endpoint?: string;
};

type DeviceFlowResult = {
  status: number;
  body: unknown;
};

const DEFAULT_SCOPES = ['openid', 'profile', 'email', 'offline_access'];
const DISCOVERY_TTL_MS = 5 * 60 * 1000;

let discoveryCache: { value: ClerkDiscovery | null; fetchedAt: number } = {
  value: null,
  fetchedAt: 0,
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} for Clerk OAuth device flow.`);
  }
  return value;
}

function normalizeScopes(input?: string | string[]): string {
  let raw = '';
  if (Array.isArray(input)) {
    raw = input.join(' ');
  } else if (typeof input === 'string') {
    raw = input;
  } else {
    raw = process.env.CLERK_OAUTH_SCOPES ?? DEFAULT_SCOPES.join(' ');
  }

  const scopes = raw
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);

  return Array.from(new Set(scopes)).join(' ');
}

async function loadDiscovery(): Promise<ClerkDiscovery> {
  const now = Date.now();
  if (discoveryCache.value && now - discoveryCache.fetchedAt < DISCOVERY_TTL_MS) {
    return discoveryCache.value;
  }

  const discoveryUrl = requireEnv('CLERK_OAUTH_DISCOVERY_URL');
  const res = await fetch(discoveryUrl, { method: 'GET' });
  const payload = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(`Clerk discovery failed with status ${res.status}`);
  }
  const discovery = payload as ClerkDiscovery;
  discoveryCache = { value: discovery, fetchedAt: now };
  return discovery;
}

async function resolveDeviceAuthorizationEndpoint(): Promise<string> {
  const discovery = await loadDiscovery();
  if (!discovery.device_authorization_endpoint) {
    throw new Error('Missing device_authorization_endpoint in Clerk discovery document.');
  }
  return discovery.device_authorization_endpoint;
}

async function resolveTokenEndpoint(): Promise<string> {
  const override = process.env.CLERK_OAUTH_TOKEN_URL;
  if (override) return override;
  const discovery = await loadDiscovery();
  if (!discovery.token_endpoint) {
    throw new Error('Missing token_endpoint in Clerk discovery document.');
  }
  return discovery.token_endpoint;
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'invalid_response', error_description: text };
  }
}

async function postForm(url: string, params: Record<string, string>): Promise<DeviceFlowResult> {
  const body = new URLSearchParams(params);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const payload = await parseJsonResponse(res);
  return { status: res.status, body: payload };
}

export async function startClerkDeviceFlow(scopeInput?: string | string[]): Promise<DeviceFlowResult> {
  const clientId = requireEnv('CLERK_OAUTH_CLIENT_ID');
  const clientSecret = process.env.CLERK_OAUTH_CLIENT_SECRET;
  const scope = normalizeScopes(scopeInput);
  const endpoint = await resolveDeviceAuthorizationEndpoint();

  const params: Record<string, string> = {
    client_id: clientId,
    scope,
  };
  if (clientSecret) {
    params.client_secret = clientSecret;
  }

  return postForm(endpoint, params);
}

export async function pollClerkDeviceToken(deviceCode: string): Promise<DeviceFlowResult> {
  const clientId = requireEnv('CLERK_OAUTH_CLIENT_ID');
  const clientSecret = process.env.CLERK_OAUTH_CLIENT_SECRET;
  const endpoint = await resolveTokenEndpoint();

  const params: Record<string, string> = {
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    device_code: deviceCode,
    client_id: clientId,
  };
  if (clientSecret) {
    params.client_secret = clientSecret;
  }

  return postForm(endpoint, params);
}
