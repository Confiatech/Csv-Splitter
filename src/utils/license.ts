const LICENSE_KEY = 'csvstream_license';
const IS_PRO_KEY = 'csvstream_is_pro';

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

export const FREE_TIER_LIMIT_MB = 50;

export function canProcessFile(fileSizeMB: number, isPro: boolean): boolean {
  if (isPro) return true;
  return fileSizeMB <= FREE_TIER_LIMIT_MB;
}
