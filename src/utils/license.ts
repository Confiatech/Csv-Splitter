const LICENSE_KEY = 'csvstream_license';
const IS_PRO_KEY = 'csvstream_is_pro';
const DOWNLOAD_COUNT_KEY = 'csvstream_download_count';
const DOWNLOAD_DATE_KEY  = 'csvstream_download_date';

/** How many free downloads a non-Pro user gets per day. */
export const FREE_DOWNLOAD_LIMIT = 1;

export const FREE_TIER_LIMIT_MB = 50;

// ─── License storage ────────────────────────────────────────────────────────

export function getStoredLicense(): string | null {
  return localStorage.getItem(LICENSE_KEY);
}

export function getIsProFromStorage(): boolean {
  return localStorage.getItem(IS_PRO_KEY) === 'true';
}

export function storeLicense(key: string, valid: boolean): void {
  localStorage.setItem(LICENSE_KEY, key);
  localStorage.setItem(IS_PRO_KEY, valid ? 'true' : 'false');
}

export function clearLicense(): void {
  localStorage.removeItem(LICENSE_KEY);
  localStorage.removeItem(IS_PRO_KEY);
}

// ─── Download counter (resets daily) ────────────────────────────────────────

/** Returns today's date as a YYYY-MM-DD string. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Resets the counter if the stored date is not today,
 * then returns how many downloads have been used today.
 */
export function getFreeDownloadCount(): number {
  const storedDate = localStorage.getItem(DOWNLOAD_DATE_KEY);
  if (storedDate !== today()) {
    // New day — reset counter
    localStorage.setItem(DOWNLOAD_DATE_KEY, today());
    localStorage.setItem(DOWNLOAD_COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(DOWNLOAD_COUNT_KEY) ?? '0', 10);
}

/** Increments today's download counter by 1. */
export function incrementFreeDownloadCount(): void {
  // Ensure date is current before incrementing
  const current = getFreeDownloadCount();
  localStorage.setItem(DOWNLOAD_DATE_KEY, today());
  localStorage.setItem(DOWNLOAD_COUNT_KEY, String(current + 1));
}

/**
 * Returns true if the user is allowed to perform a download right now.
 * Pro users always pass. Free users get FREE_DOWNLOAD_LIMIT per day.
 */
export function canDownload(isPro: boolean): boolean {
  if (isPro) return true;
  return getFreeDownloadCount() < FREE_DOWNLOAD_LIMIT;
}

// ─── File-size gate ──────────────────────────────────────────────────────────

/**
 * Validates a license key against Gumroad API.
 * NOTE: Replace PRODUCT_ID with your actual Gumroad product permalink.
 */
export async function validateLicense(key: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'YOUR_PRODUCT_ID', // Replace with your Gumroad product ID
        license_key: key,
      }),
    });
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export function canProcessFile(fileSizeMB: number, isPro: boolean): boolean {
  if (isPro) return true;
  return fileSizeMB <= FREE_TIER_LIMIT_MB;
}
