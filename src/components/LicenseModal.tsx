import { useState } from 'react';
import { validateLicense, storeLicense } from '../utils/license';
import toast from 'react-hot-toast';

interface LicenseModalProps {
  onClose: () => void;
  onActivated: () => void;
}

const FEATURES = [
  { icon: '∞', label: 'Unlimited downloads' },
  { icon: '📦', label: 'Files up to 2 GB' },
  { icon: '⚡', label: 'Priority processing' },
  { icon: '🔒', label: 'Always 100% private' },
];

export function LicenseModal({ onClose, onActivated }: LicenseModalProps) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    const trimmed = key.trim();
    if (!trimmed) { toast.error('Please enter a license key'); return; }
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 3, 20, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
           style={{ background: 'linear-gradient(160deg, #13103a 0%, #0d0b2a 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>

        {/* Top accent line */}
        <div className="h-0.5 w-full gradient-brand" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white">Upgrade to Pro</h2>
              </div>
              <p className="text-sm text-indigo-300/50">
                Free plan includes 1 download. Go Pro for unlimited.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Pricing card */}
          <div className="rounded-xl p-4 space-y-4"
               style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">CSV Stream Pro</p>
                <p className="text-xs text-indigo-300/50 mt-0.5">One-time payment · No subscription</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold gradient-text">$9</p>
                <p className="text-xs text-indigo-400/50">forever</p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-indigo-200/70">
                  <span className="text-base leading-none">{icon}</span>
                  {label}
                </div>
              ))}
            </div>

            <a
              href="https://gumroad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center gradient-brand text-white font-semibold py-2.5 rounded-xl text-sm transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] shadow-lg"
            >
              Buy on Gumroad →
            </a>
          </div>

          {/* License key */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Already have a license key?
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
              />
              <button
                onClick={handleActivate}
                disabled={loading}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 disabled:opacity-40 text-emerald-300 text-sm font-semibold rounded-xl transition-all"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
