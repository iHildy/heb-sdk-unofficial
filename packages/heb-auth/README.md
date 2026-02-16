# heb-auth-unofficial

OAuth/PKCE helpers for H-E-B mobile authentication. Generates bearer tokens for use with `heb-sdk-unofficial`.

📖 [Full Documentation](https://heb-sdk-unofficial.hildy.io/docs/sessions/)

## Install

```bash
npm install heb-auth-unofficial
# or
pnpm add heb-auth-unofficial
```

---

## Quick Start

Create a PKCE context and build the auth URL.

```typescript
import { buildAuthUrl, createOAuthContext } from 'heb-auth-unofficial';

const context = createOAuthContext();
const authUrl = buildAuthUrl(context);

console.log(authUrl.toString());
// Open this URL in a browser, sign in, and capture the `code` from the redirect
```

Exchange the code for tokens and upsert the mobile profile.

```typescript
import { exchangeCode, upsertUser } from 'heb-auth-unofficial';

const tokens = await exchangeCode({
  code: 'code-from-redirect',
  codeVerifier: context.codeVerifier,
});

// Optional: register the user profile with H-E-B's mobile API
if (tokens.id_token) {
  await upsertUser({
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
  });
}

console.log(tokens.access_token, tokens.refresh_token);
```

---

## Token Refresh

Access tokens expire in ~30 minutes. Use the refresh token to get new tokens.

```typescript
import { refreshTokens } from 'heb-auth-unofficial';

const tokens = await refreshTokens({
  refreshToken: 'your-refresh-token',
});

console.log(tokens.access_token); // new access token
console.log(tokens.refresh_token); // new refresh token (if rotated)
```

---

## Integration with heb-sdk-unofficial

Use tokens to create a bearer session for the SDK.

```typescript
import { createTokenSession, HEBClient, updateTokenSession } from 'heb-sdk-unofficial';
import { refreshTokens } from 'heb-auth-unofficial';

const session = createTokenSession({
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
  idToken: tokens.id_token,
  expiresIn: tokens.expires_in,
});

// Enable automatic token refresh
session.refresh = async () => {
  const newTokens = await refreshTokens({ refreshToken: session.refreshToken! });
  updateTokenSession(session, newTokens);
};

const heb = new HEBClient(session);
await heb.setStore('790');
const results = await heb.search('milk');
```

---

## API Reference

### PKCE

| Function | Description |
|----------|-------------|
| `createPkceVerifier()` | Generate a random PKCE code verifier |
| `createPkceChallenge(verifier)` | Create S256 challenge from verifier |
| `createPkcePair()` | Generate both verifier and challenge |
| `createOAuthContext()` | Full OAuth context with state, nonce, and device IDs |

### OAuth Flow

| Function | Description |
|----------|-------------|
| `buildAuthUrl(context, options?)` | Build the H-E-B authorization URL |
| `exchangeCode(options)` | Exchange authorization code for tokens |
| `refreshTokens(options)` | Refresh access token using refresh token |
| `upsertUser(options)` | Register user profile with mobile API |

### Types

- `HebOAuthConfig` - OAuth client configuration
- `HebOAuthContext` - PKCE context with state and device IDs
- `HebTokenResponse` - Token response from H-E-B

---

## Configuration

Override default config by passing a partial config to any function.

```typescript
const authUrl = buildAuthUrl(context, {
  config: {
    clientId: 'custom-client-id',
    redirectUri: 'com.myapp://oauth2redirect',
  },
});
```

Default config:

```typescript
const DEFAULT_HEB_OAUTH_CONFIG = {
  clientId: 'myheb-ios-prd',
  redirectUri: 'com.heb.myheb://oauth2redirect',
  scope: 'openid profile email',
  authUrl: 'https://accounts.heb.com/oidc/auth',
  tokenUrl: 'https://accounts.heb.com/oidc/token',
  userAgent: 'MyHEB/5.9.0.60733 (iOS 18.7.2; iPhone16,2) CFNetwork/1.0 Darwin/24.6.0',
};
```

---

## Why heb-auth-unofficial?

Bearer tokens from this package enable:

- **Mobile GraphQL API access** - Required for search, orders, account, and weekly ad
- **Server-side token refresh** - No active browser session needed
- **Better bot protection resilience** - Tokens don't rely on cookies that can go stale

Cookie sessions from the browser work for cart operations but require an active browser session and can be blocked by bot protection.

---

## License

MIT
