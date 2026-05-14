import { useState, useEffect } from 'react';
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

function App() {
  const [isPro, setIsPro] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [freeDownloadsUsed, setFreeDownloadsUsed] = useState(0);

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [options, setOptions] = useState<SplitOptions>({
    mode: 'rows',
    rowsPerFile: 10000,
    mbPerFile: 5,
    includeHeader: true,
    delimiter: 'auto',
  });

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  useEffect(() => {
    setIsPro(getIsProFromStorage());
    setFreeDownloadsUsed(getFreeDownloadCount());
  }, []);

  async function handleFile(file: File) {
    const sizeMB = file.size / (1024 * 1024);
    if (!canProcessFile(sizeMB, isPro)) {
      toast.error(
        `File is ${sizeMB.toFixed(1)} MB. Free tier supports up to ${FREE_TIER_LIMIT_MB} MB.`,
        { duration: 5000 }
      );
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
      toast.error(`Free users get ${FREE_DOWNLOAD_LIMIT} download. Upgrade to Pro for unlimited.`, {
        duration: 5000,
      });
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

  const downloadsLeft = Math.max(0, FREE_DOWNLOAD_LIMIT - freeDownloadsUsed);
  const limitReached = !isPro && freeDownloadsUsed >= FREE_DOWNLOAD_LIMIT;

  return (
    <div className="flex flex-col min-h-screen bg-animated text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1b4b',
            color: '#e0e7ff',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#a78bfa', secondary: '#1e1b4b' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#1e1b4b' } },
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 glass border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5  flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className=" rounded-xl flex-shrink-0">
              <img
                src="/logo.png"
                alt="CSV Splitter"
                className="h-18 w-auto"
              />
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!isPro && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300/80 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {downloadsLeft} free download{downloadsLeft !== 1 ? 's' : ''} left
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
              ) : (
                '✦ Upgrade — $9'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero (only when no file loaded) ────────────────────────────── */}
      {!fileInfo && (
        <section className="max-w-5xl w-full mx-auto px-5 pt-14 pb-6 text-center fade-up">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            No upload · No server · Fully private
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 leading-tight">
            Split any CSV file
            <br />
            <span className="gradient-text">in seconds</span>
          </h2>
          <p className="text-indigo-200/60 text-base max-w-md mx-auto">
            Drag in your file, choose how to split it, and download a ZIP — all without leaving your browser.
          </p>
        </section>
      )}

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 pt-8 pb-12 space-y-5">

        {/* Dropzone */}
        {!fileInfo && <Dropzone onFile={handleFile} isPro={isPro} />}

        {/* File info card */}
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
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Remove
            </button>
          </div>
        )}

        {/* Preview table */}
        {preview && (
          <div className="fade-up">
            <PreviewTable
              headers={preview.headers}
              rows={preview.rows}
              detectedDelimiter={preview.detectedDelimiter}
            />
          </div>
        )}

        {/* Split controls */}
        {preview && (
          <div className="fade-up">
            <SplitControls options={options} onChange={setOptions} />
          </div>
        )}

        {/* Progress */}
        {processing && (
          <div className="fade-up">
            <ProgressBar progress={progress} label={progressLabel} />
          </div>
        )}

        {/* CTA button */}
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

        {/* Trust badges */}
        {!fileInfo && (
          <div className="fade-up flex flex-wrap items-center justify-center gap-6 pt-2 pb-4">
            {[
              { icon: '🔒', label: 'Files never leave your browser' },
              { icon: '⚡', label: 'Instant processing' },
              { icon: '🗜️', label: 'ZIP download' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-indigo-300/50">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <Footer />

      {/* ── License modal ──────────────────────────────────────────────── */}
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
