import { useState } from 'react';
import { validateLicense, storeLicense } from '../utils/license';
import toast from 'react-hot-toast';

interface LicenseModalProps {
  onClose: () => void;
  onActivated: () => void;
}

export function LicenseModal({ onClose, onActivated }: LicenseModalProps) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    const trimmed = key.trim();
    if (!trimmed) {
      toast.error('Please enter a license key');
      return;
    }
    setLoading(true);
    try {
      const valid = await validateLicense(trimmed);
      if (valid) {
        storeLicense(trimmed, true);
        toast.success('Pro license activated! 🎉');
        onActivated();
      } else {
        toast.error('Invalid license key. Please check and try again.');
        storeLicense(trimmed, false);
      }
    } catch {
      toast.error('Could not verify license. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upgrade to Pro</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">One-time payment, no subscription</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Pricing */}
        <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">CSV Stream Pro</p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-0.5">
                <li>✓ Files up to 2GB</li>
                <li>✓ No watermarks</li>
                <li>✓ Priority features</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">$9</p>
              <p className="text-xs text-blue-500">one-time</p>
            </div>
          </div>
          <a
            href="https://gumroad.com" // Replace with your Gumroad product URL
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Buy on Gumroad →
          </a>
        </div>

        {/* License key input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Already have a license key?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
            />
            <button
              onClick={handleActivate}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? '...' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
