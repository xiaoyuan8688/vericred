/**
 * Security Shield Service
 * Provides access throttling, browser/header validation, dynamic temporary token generation,
 * and random request delay (jitter) to protect APIs against automated scrapers.
 */

const PROTECT_MSG = "当前访问频次较高，请稍候重新访问。";

/**
 * Generates a dynamic, short-lived temporary token on the frontend.
 */
export function generateTemporaryToken(): string {
  const timestamp = Date.now();
  const payload = {
    t: timestamp,
    s: "dynamic_shield_salt_xyz123",
    r: Math.random().toString(36).substring(2)
  };
  return btoa(JSON.stringify(payload));
}

/**
 * Validates a temporary token. Rejects if invalid or older than 5 seconds.
 */
export function validateTemporaryToken(token: string): void {
  if (!token) {
    triggerViolation();
  }
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.s !== "dynamic_shield_salt_xyz123") {
      triggerViolation();
    }
    const age = Date.now() - decoded.t;
    // Token is valid for 5 seconds
    if (age < 0 || age > 5000) {
      triggerViolation();
    }
  } catch (e) {
    triggerViolation();
  }
}

/**
 * Standard violation handler. Alerts and throws the uniform message.
 */
function triggerViolation(): never {
  try {
    window.alert(PROTECT_MSG);
  } catch (e) {
    console.warn("window.alert blocked:", e);
  }
  throw new Error(PROTECT_MSG);
}

/**
 * Main security shield function.
 * Must be awaited at the start of every protected API request.
 */
export async function applySecurityShield(): Promise<void> {
  // 1. Basic client/browser header validation
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
  const hasValidUserAgent = isBrowser && navigator.userAgent && navigator.userAgent.trim() !== '';
  const isPureScript = !isBrowser || 
                        !hasValidUserAgent || 
                        !!(navigator as any).webdriver || 
                        /curl|wget|python|httpclient|postman|insomnia|scrapy|headless/i.test(navigator.userAgent || '');
  
  if (isPureScript) {
    triggerViolation();
  }

  // 2. Access throttling: max 8 requests per 60s
  let timestamps: number[] = [];
  try {
    const stored = localStorage.getItem('api_request_timestamps');
    if (stored) {
      timestamps = JSON.parse(stored);
    }
  } catch (e) {
    console.warn("localStorage read failed:", e);
  }

  const now = Date.now();
  // Filter for requests within the last 60 seconds
  timestamps = timestamps.filter(t => now - t < 60000);

  if (timestamps.length >= 8) {
    triggerViolation();
  }

  // Record this request
  timestamps.push(now);
  try {
    localStorage.setItem('api_request_timestamps', JSON.stringify(timestamps));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }

  // 3. Dynamic temporary token generation and simulation validation
  const token = generateTemporaryToken();
  console.log(`[SHIELD] Dynamic temporary token generated: ${token}`);
  validateTemporaryToken(token);

  // 4. Random request delay (jitter): 200ms to 600ms
  const jitterMs = Math.floor(Math.random() * (600 - 200 + 1)) + 200;
  console.log(`[SHIELD] Adding random request delay (jitter): ${jitterMs}ms`);
  await new Promise(resolve => setTimeout(resolve, jitterMs));
}
