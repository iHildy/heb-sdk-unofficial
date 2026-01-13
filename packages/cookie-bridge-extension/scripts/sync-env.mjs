import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const envPath = path.join(repoRoot, '.env');
const outputPath = path.join(repoRoot, 'packages', 'cookie-bridge-extension', 'config.json');

function parseEnv(content) {
  const env = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

let env = {};
if (fs.existsSync(envPath)) {
  env = parseEnv(fs.readFileSync(envPath, 'utf8'));
}

const serverUrl = env.MCP_SERVER_URL || '';

const clerkPublishableKey = env.CLERK_PUBLISHABLE_KEY || '';

const jwtTemplate = env.CLERK_JWT_TEMPLATE_NAME || '';
const clerkSignInUrl = env.CLERK_SIGN_IN_URL || '';

const config = {};
if (serverUrl) config.serverUrl = serverUrl;
if (clerkPublishableKey) config.clerkPublishableKey = clerkPublishableKey;
if (jwtTemplate) config.jwtTemplate = jwtTemplate;
if (clerkSignInUrl) config.clerkSignInUrl = clerkSignInUrl;

fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
console.log(`Wrote ${outputPath}`);
