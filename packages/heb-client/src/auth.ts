import { chromium, type BrowserContext, type Page } from 'playwright';
import { createSession } from './session.js';
import type { HEBCookies, HEBCredentials, HEBSession, LoginOptions } from './types.js';
import { ENDPOINTS } from './types.js';

const DEFAULT_TIMEOUT = 60000;

/**
 * Get credentials from environment variables.
 */
export function getCredentialsFromEnv(): HEBCredentials | null {
  const email = process.env.HEB_EMAIL;
  const password = process.env.HEB_PASSWORD;
  
  if (!email || !password) {
    return null;
  }
  
  return { email, password };
}

/**
 * Extract cookies from browser context into HEBCookies format.
 */
async function extractCookies(context: BrowserContext): Promise<HEBCookies> {
  const allCookies = await context.cookies();
  
  const cookies: HEBCookies = {
    sat: '',
    reese84: '',
    incap_ses: '',
  };
  
  for (const cookie of allCookies) {
    if (cookie.name === 'sat') {
      cookies.sat = cookie.value;
    } else if (cookie.name === 'reese84') {
      cookies.reese84 = cookie.value;
    } else if (cookie.name.startsWith('incap_ses')) {
      // Store full name since it has dynamic suffix
      cookies.incap_ses = cookie.value;
      cookies[cookie.name] = cookie.value;
    } else if (cookie.name === 'CURR_SESSION_STORE') {
      cookies.CURR_SESSION_STORE = cookie.value;
    } else {
      // Capture other potentially useful cookies
      cookies[cookie.name] = cookie.value;
    }
  }
  
  return cookies;
}

/**
 * Extract Next.js build ID from page.
 */
async function extractBuildId(page: Page): Promise<string | undefined> {
  try {
    const buildId = await page.evaluate(() => {
      // @ts-expect-error document exists in browser context
      const nextData = document.getElementById('__NEXT_DATA__');
      if (nextData) {
        const data = JSON.parse(nextData.textContent || '{}');
        return data.buildId as string | undefined;
      }
      return undefined;
    });
    return buildId;
  } catch {
    return undefined;
  }
}

/**
 * Complete the HEB login flow and return a session.
 * 
 * @param credentials - Email and password (or reads from HEB_EMAIL/HEB_PASSWORD env vars)
 * @param options - Login options (headless, timeout, storeId)
 * @returns HEB session with cookies and headers
 */
export async function login(
  credentials?: HEBCredentials,
  options: LoginOptions = {}
): Promise<HEBSession> {
  const creds = credentials ?? getCredentialsFromEnv();
  
  if (!creds) {
    throw new Error(
      'Credentials required. Pass { email, password } or set HEB_EMAIL and HEB_PASSWORD env vars.'
    );
  }
  
  const { headless = true, timeout = DEFAULT_TIMEOUT, storeId, userDataDir } = options;
  
  let browser;
  let context;
  let page;
  
  if (userDataDir) {
    // Use persistent context with user's existing Chrome profile (bypasses Imperva)
    console.log('[HEB SDK] Using persistent context with user profile...');
    context = await chromium.launchPersistentContext(userDataDir, {
      headless,
      channel: 'chrome',
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezoneId: 'America/Chicago',
    });
    page = context.pages()[0] || await context.newPage();
    browser = null; // Context manages its own cleanup
  } else {
    // Regular launch (may be blocked by Imperva)
    console.log('[HEB SDK] Launching browser...');
    browser = await chromium.launch({ 
      headless,
      channel: 'chrome',
    });
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezoneId: 'America/Chicago',
    });
    page = await context.newPage();
  }
  
  try {
    // Step 1: Visit homepage first to establish Imperva cookies
    console.log('[HEB SDK] Visiting homepage to establish session...');
    await page.goto(ENDPOINTS.home, { timeout, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow Imperva scripts to run
    
    // Step 2: Navigate to login
    console.log('[HEB SDK] Navigating to login page...');
    await page.goto(ENDPOINTS.login, { timeout, waitUntil: 'networkidle' });
    
    // Step 3: Wait for either redirect to accounts.heb.com OR the login form
    console.log('[HEB SDK] Waiting for login form...');
    await page.waitForSelector('input[name="login"], input[type="email"], input#login', { timeout });
    
    // Step 4: Enter email (first step)
    console.log('[HEB SDK] Entering email...');
    const emailInput = page.locator('input[name="login"], input[type="email"], input#login').first();
    await emailInput.fill(creds.email);
    await page.click('button[type="submit"]');
    
    // Step 5: Wait for password field (second step)
    console.log('[HEB SDK] Waiting for password field...');
    await page.waitForSelector('input[name="password"], input[type="password"]', { timeout });
    await page.waitForTimeout(500); // Small delay for form transition
    
    console.log('[HEB SDK] Entering password...');
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(creds.password);
    await page.click('button[type="submit"]');
    
    // Step 6: Wait for redirect back to heb.com after successful login
    console.log('[HEB SDK] Waiting for login completion...');
    await page.waitForURL(url => url.hostname.includes('heb.com') && !url.hostname.includes('accounts.heb.com'), { timeout });
    await page.waitForTimeout(1000); // Allow cookies to be set
    
    // Optionally set store
    if (storeId) {
      await context.addCookies([{
        name: 'CURR_SESSION_STORE',
        value: storeId,
        domain: '.heb.com',
        path: '/',
      }]);
    }
    
    // Extract data
    const cookies = await extractCookies(context);
    const buildId = await extractBuildId(page);
    
    if (!cookies.sat) {
      throw new Error('Login succeeded but sat cookie not found. Auth may have failed.');
    }
    
    console.log('[HEB SDK] Login successful!');
    return createSession(cookies, buildId);
  } finally {
    if (browser) {
      await browser.close();
    } else {
      await context.close();
    }
  }
}

/**
 * Extract session from an existing browser page/context.
 * Useful when you already have a logged-in browser session.
 */
export async function extractSession(
  context: BrowserContext,
  page?: Page
): Promise<HEBSession> {
  const cookies = await extractCookies(context);
  const buildId = page ? await extractBuildId(page) : undefined;
  
  if (!cookies.sat) {
    throw new Error('No sat cookie found. User may not be logged in.');
  }
  
  return createSession(cookies, buildId);
}
