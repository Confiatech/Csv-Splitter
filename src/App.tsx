import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Dropzone } from './components/Dropzone';
import { PreviewTable } from './components/PreviewTable';
import { SplitControls } from './components/SplitControls';
import { ProgressBar } from './components/ProgressBar';
import { LicenseModal } from './components/LicenseModal';
import { Footer } from './components/Footer';
import { parsePreview, splitByRows, splitBySize } from './utils/csvSplitter';
import { downloadAsZip } from './utils/zipDownloader';
import {
  getIsProFromStorage,
  canProcessFile,
  canDownload,
  incrementFreeDownloadCount,
  getFreeDownloadCount,
  FREE_TIER_LIMIT_MB,
  FREE_DOWNLOAD_LIMIT,
} from './utils/license';
import type { FileInfo, PreviewData, SplitOptions } from './types';

// ── initialise from localStorage directly (avoids setState-in-effect warning) ──
const initialIsPro           = getIsProFromStorage();
const initialDownloadsUsed   = getFreeDownloadCount();

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    title: 'Split by Rows or Size',
    desc: 'Choose exactly how to divide your CSV — by a fixed number of rows or by a target file size in MB.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '100% Private & Secure',
    desc: 'Your files never leave your browser. All processing happens locally — no uploads, no servers, no data leaks.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    title: 'Instant ZIP Download',
    desc: 'All split files are bundled into a single ZIP archive and downloaded instantly — no waiting, no email.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
    title: 'Smart Header Handling',
    desc: 'Automatically repeats the header row in every split file so each chunk is a valid, self-contained CSV.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
      </svg>
    ),
    title: 'Multiple Delimiter Support',
    desc: 'Auto-detects commas, tabs, semicolons, and pipes. Or override manually — full control over your data format.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Live Data Preview',
    desc: 'See the first 100 rows of your CSV before splitting so you can verify the data and delimiter are correct.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Drop your CSV', desc: 'Drag & drop or click to select any CSV, TSV, or TXT file up to 50 MB (free) or 2 GB (Pro).' },
  { step: '02', title: 'Configure the split', desc: 'Choose to split by row count or file size, set your delimiter, and toggle header repetition.' },
  { step: '03', title: 'Download the ZIP', desc: 'Hit the button and get all your split files bundled in a ZIP — downloaded straight to your device.' },
];

function App() {
  const [isPro, setIsPro]                       = useState(initialIsPro);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [freeDownloadsUsed, setFreeDownloadsUsed] = useState(initialDownloadsUsed);

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [preview,  setPreview]  = useState<PreviewData | null>(null);
  const [options,  setOptions]  = useState<SplitOptions>({
    mode: 'rows',
    rowsPerFile: 10000,
    mbPerFile: 5,
    includeHeader: true,
    delimiter: 'auto',
  });

  const [processing,     setProcessing]     = useState(false);
  const [progress,       setProgress]       = useState(0);
  const [progressLabel,  setProgressLabel]  = useState('');

  async function handleFile(file: File) {
    const sizeMB = file.size / (1024 * 1024);
    if (!canProcessFile(sizeMB, isPro)) {
      toast.error(`File is ${sizeMB.toFixed(1)} MB. Free tier supports up to ${FREE_TIER_LIMIT_MB} MB.`, { duration: 5000 });
      setShowLicenseModal(true);
      return;
    }
    setFileInfo({ file, name: file.name, sizeMB });
    setPreview(null);
    setProgress(0);
    try {
      const result = await parsePreview(file, 100);
      setPreview(result);
      setOptions((prev) => ({ ...prev, delimiter: result.detectedDelimiter }));
      toast.success(`Loaded ${file.name} (${sizeMB.toFixed(2)} MB)`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to parse CSV');
    }
  }

  function handleClear() {
    setFileInfo(null);
    setPreview(null);
    setProgress(0);
    setProgressLabel('');
  }

  async function handleSplit() {
    if (!fileInfo) return;
    if (!canDownload(isPro)) {
      toast.error(`Free users get ${FREE_DOWNLOAD_LIMIT} download per day. Upgrade to Pro for unlimited.`, { duration: 5000 });
      setShowLicenseModal(true);
      return;
    }
    setProcessing(true);
    setProgress(0);
    setProgressLabel('Splitting CSV…');
    try {
      const chunks =
        options.mode === 'rows'
          ? await splitByRows(fileInfo.file, options, setProgress)
          : await splitBySize(fileInfo.file, options, setProgress);
      if (chunks.length === 0) { toast.error('No data to split'); return; }
      setProgressLabel('Creating ZIP…');
      setProgress(0);
      await downloadAsZip(chunks, fileInfo.name, setProgress);
      if (!isPro) {
        incrementFreeDownloadCount();
        setFreeDownloadsUsed(getFreeDownloadCount());
      }
      toast.success(`Downloaded ${chunks.length} files as ZIP!`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to split CSV');
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressLabel('');
    }
  }

  const downloadsLeft  = Math.max(0, FREE_DOWNLOAD_LIMIT - freeDownloadsUsed);
  const limitReached   = !isPro && freeDownloadsUsed >= FREE_DOWNLOAD_LIMIT;

  return (
    <div className="flex flex-col min-h-screen bg-animated text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e1b4b', color: '#e0e7ff', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#a78bfa', secondary: '#1e1b4b' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#1e1b4b' } },
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 glass border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl flex-shrink-0">
              <img src="/logo.png" alt="CSV Splitter" className="h-18 w-auto" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">
                <span className="gradient-text">CSV</span>
                <span className="text-white"> Splitter</span>
              </h1>
              <p className="text-[11px] text-indigo-300/70 mt-0.5 leading-none">
                Split large CSV files · 100% in-browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isPro && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300/80 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {downloadsLeft} free download{downloadsLeft !== 1 ? 's' : ''} left today
              </span>
            )}
            <button
              onClick={() => setShowLicenseModal(true)}
              className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isPro
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                  : 'gradient-brand text-white shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isPro ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Pro Active
                </span>
              ) : '✦ Upgrade — $9'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      {!fileInfo && (
        <section className="max-w-5xl w-full mx-auto px-5 pt-16 pb-8 text-center fade-up">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            No upload · No server · Fully private
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Split any CSV file
            <br />
            <span className="gradient-text">in seconds</span>
          </h2>
          <p className="text-indigo-200/60 text-base max-w-lg mx-auto mb-8">
            CSV Splitter is a free, browser-based tool that lets you break large CSV files into smaller, manageable chunks — instantly, privately, and without any installation.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            {[
              { value: '2 GB', label: 'Max file size (Pro)' },
              { value: '100%', label: 'Private — no uploads' },
              { value: 'Free', label: '1 download / day' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold gradient-text">{value}</p>
                <p className="text-xs text-white/30 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Main tool area ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 pt-8 pb-12 space-y-5">

        {!fileInfo && <Dropzone onFile={handleFile} isPro={isPro} />}

        {fileInfo && (
          <div className="fade-up card flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white text-sm leading-tight">{fileInfo.name}</p>
                <p className="text-xs text-indigo-300/60 mt-0.5">{fileInfo.sizeMB.toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={handleClear} className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Remove
            </button>
          </div>
        )}

        {preview && (
          <div className="fade-up">
            <PreviewTable headers={preview.headers} rows={preview.rows} detectedDelimiter={preview.detectedDelimiter} />
          </div>
        )}

        {preview && (
          <div className="fade-up">
            <SplitControls options={options} onChange={setOptions} />
          </div>
        )}

        {processing && (
          <div className="fade-up">
            <ProgressBar progress={progress} label={progressLabel} />
          </div>
        )}

        {preview && !processing && (
          <div className="fade-up">
            <button
              onClick={limitReached ? () => setShowLicenseModal(true) : handleSplit}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-3 ${
                limitReached
                  ? 'bg-white/5 border border-white/10 text-white/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300 cursor-pointer'
                  : 'gradient-brand text-white shadow-xl glow hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {limitReached ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Upgrade to Pro to Download More
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Split CSV &amp; Download ZIP
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Features section (homepage only) ───────────────────────── */}
        {!fileInfo && (
          <>
            {/* Features grid */}
            <section className="pt-10 pb-4 fade-up">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Everything you need to split CSVs</h3>
                <p className="text-sm text-white/30 max-w-md mx-auto">
                  Powerful features packed into a simple, no-install tool that works entirely in your browser.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map(({ icon, title, desc }) => (
                  <div key={title} className="card p-5 space-y-3 hover:border-indigo-500/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      {icon}
                    </div>
                    <h4 className="font-semibold text-white text-sm">{title}</h4>
                    <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* How it works */}
            <section className="py-6 fade-up">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">How it works</h3>
                <p className="text-sm text-white/30">Three steps, no sign-up required.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {HOW_IT_WORKS.map(({ step, title, desc }) => (
                  <div key={step} className="relative card p-5 space-y-3">
                    <span className="text-4xl font-black text-white/5 absolute top-4 right-4 leading-none select-none">
                      {step}
                    </span>
                    <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-xs font-bold text-white">
                      {step}
                    </div>
                    <h4 className="font-semibold text-white text-sm">{title}</h4>
                    <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Free vs Pro */}
            <section className="py-6 fade-up">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free vs Pro</h3>
                <p className="text-sm text-white/30">Start free, upgrade when you need more.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Free */}
                <div className="card p-5 space-y-4">
                  <div>
                    <p className="font-bold text-white">Free</p>
                    <p className="text-2xl font-extrabold text-white/50 mt-1">$0</p>
                  </div>
                  <ul className="space-y-2 text-sm text-white/40">
                    {[
                      '1 download per day',
                      'Files up to 50 MB',
                      'All split modes',
                      'Browser-only processing',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Pro */}
                <div className="relative rounded-2xl p-5 space-y-4 overflow-hidden"
                     style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <div className="absolute top-3 right-3 text-xs font-bold gradient-brand text-white px-2 py-0.5 rounded-full">
                    POPULAR
                  </div>
                  <div>
                    <p className="font-bold text-white">Pro</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-2xl font-extrabold gradient-text">$9</p>
                      <p className="text-xs text-white/30">one-time</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-indigo-200/70">
                    {[
                      'Unlimited downloads',
                      'Files up to 2 GB',
                      'All split modes',
                      'Browser-only processing',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setShowLicenseModal(true)}
                    className="w-full gradient-brand text-white font-semibold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
                  >
                    Get Pro — $9
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />

      {showLicenseModal && (
        <LicenseModal
          onClose={() => setShowLicenseModal(false)}
          onActivated={() => {
            setIsPro(true);
            setShowLicenseModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
