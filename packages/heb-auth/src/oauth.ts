import crypto from 'crypto';

export type HebOAuthConfig = {
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
  userAgent?: string;
};

export type HebOAuthContext = {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  state: string;
  nonce: string;
  clientRequestId: string;
  clientAmpDeviceId: string;
  clientAmpSessionId: string;
};

export type HebTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
};

export const DEFAULT_HEB_OAUTH_CONFIG: HebOAuthConfig = {
  clientId: 'myheb-ios-prd',
  redirectUri: 'com.heb.myheb://oauth2redirect',
  scope: 'openid profile email',
  authUrl: 'https://accounts.heb.com/oidc/auth',
  tokenUrl: 'https://accounts.heb.com/oidc/token',
  userAgent: 'MyHEB/5.9.0.60733 (iOS 18.7.2; iPhone16,2) CFNetwork/1.0 Darwin/24.6.0',
};

function base64Url(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function randomString(bytes = 32): string {
  return base64Url(crypto.randomBytes(bytes));
}

export function createPkceVerifier(): string {
  // 32 bytes -> 43 char base64url string (valid PKCE length)
  return randomString(32);
}

export function createPkceChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64Url(hash);
}

export function createPkcePair(): { verifier: string; challenge: string; method: 'S256' } {
  const verifier = createPkceVerifier();
  return { verifier, challenge: createPkceChallenge(verifier), method: 'S256' };
}

export function createOAuthContext(): HebOAuthContext {
  const { verifier, challenge } = createPkcePair();
  return {
    codeVerifier: verifier,
    codeChallenge: challenge,
    codeChallengeMethod: 'S256',
    state: randomString(32),
    nonce: randomString(32),
    clientRequestId: crypto.randomUUID(),
    clientAmpDeviceId: crypto.randomUUID(),
    clientAmpSessionId: `${Date.now()}`,
  };
}

export function buildAuthUrl(
  context: Pick<HebOAuthContext, 'codeChallenge' | 'codeChallengeMethod' | 'state' | 'nonce' | 'clientRequestId' | 'clientAmpDeviceId' | 'clientAmpSessionId'>,
  options?: {
    config?: Partial<HebOAuthConfig>;
    prompt?: 'login' | 'consent' | 'none';
  }
): URL {
  const config = { ...DEFAULT_HEB_OAUTH_CONFIG, ...(options?.config ?? {}) };
  const url = new URL(config.authUrl);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('code_challenge', context.codeChallenge);
  url.searchParams.set('code_challenge_method', context.codeChallengeMethod);
  url.searchParams.set('state', context.state);
  url.searchParams.set('nonce', context.nonce);
  url.searchParams.set('client_request_id', context.clientRequestId);
  url.searchParams.set('clientAmpDeviceId', context.clientAmpDeviceId);
  url.searchParams.set('clientAmpSessionId', context.clientAmpSessionId);
  url.searchParams.set('prompt', options?.prompt ?? 'login');
  return url;
}

async function postForm<T>(url: string, body: Record<string, string>, userAgent?: string): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...(userAgent ? { 'user-agent': userAgent } : {}),
    },
    body: new URLSearchParams(body).toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HEB OAuth request failed: ${response.status} ${response.statusText} - ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function exchangeCode(options: {
  code: string;
  codeVerifier: string;
  config?: Partial<HebOAuthConfig>;
}): Promise<HebTokenResponse> {
  const config = { ...DEFAULT_HEB_OAUTH_CONFIG, ...(options.config ?? {}) };

  return postForm<HebTokenResponse>(
    config.tokenUrl,
    {
      grant_type: 'authorization_code',
      code: options.code,
      code_verifier: options.codeVerifier,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
    },
    config.userAgent
  );
}

export async function refreshTokens(options: {
  refreshToken: string;
  config?: Partial<HebOAuthConfig>;
}): Promise<HebTokenResponse> {
  const config = { ...DEFAULT_HEB_OAUTH_CONFIG, ...(options.config ?? {}) };

  return postForm<HebTokenResponse>(
    config.tokenUrl,
    {
      grant_type: 'refresh_token',
      refresh_token: options.refreshToken,
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
    },
    config.userAgent
  );
}

export const HEB_UPSERT_USER_HASH = 'db87505e0d471206a40c253e556188420436af4a479545760c55396ef70dde31';

export async function upsertUser(options: {
  accessToken: string;
  idToken: string;
  endpoint?: string;
  userAgent?: string;
}): Promise<{ ok: boolean; errors?: unknown }>{
  const endpoint = options.endpoint ?? 'https://api-edge.heb-ecom-api.hebdigital-prd.com/graphql';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      'content-type': 'application/json',
      ...(options.userAgent ? { 'user-agent': options.userAgent } : {}),
    },
    body: JSON.stringify({
      operationName: 'UpsertUserMutation',
      variables: {
        idToken: options.idToken,
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: HEB_UPSERT_USER_HASH,
        },
      },
    }),
  });

  if (!response.ok) {
    return { ok: false, errors: await response.text() };
  }

  const json = (await response.json()) as { errors?: Array<{ message: string }> };
  if (json?.errors) {
    return { ok: false, errors: json.errors };
  }
  return { ok: true };
}
