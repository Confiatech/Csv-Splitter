import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Dropzone } from './components/Dropzone';
import { PreviewTable } from './components/PreviewTable';
import { SplitControls } from './components/SplitControls';
import { ProgressBar } from './components/ProgressBar';
import { Footer } from './components/Footer';
import { parsePreview, splitByRows, splitBySize } from './utils/csvSplitter';
import { downloadAsZip } from './utils/zipDownloader';
import type { FileInfo, PreviewData, SplitOptions } from './types';

const BMC_URL = 'https://www.buymeacoffee.com/confiatech';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    title: 'Split by Rows or Size',
    desc: 'Divide your CSV exactly how you need — by a fixed row count or a target file size in megabytes.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '100% Private & Secure',
    desc: 'Files never leave your browser. All parsing and splitting runs locally — no uploads, no servers, no leaks.',
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
    title: 'Multi-Delimiter Support',
    desc: 'Auto-detects commas, tabs, semicolons, and pipes — or override manually for full control over your format.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Live Data Preview',
    desc: 'Inspect the first 100 rows before splitting to verify the delimiter and column structure look right.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Drop your CSV', desc: 'Drag & drop or click to select any CSV, file from your device.' },
  { step: '02', title: 'Configure the split', desc: 'Choose to split by row count or file size, set your delimiter, and toggle header repetition.' },
  { step: '03', title: 'Download the ZIP', desc: 'Hit the button and get all your split files bundled in a ZIP — downloaded straight to your device.' },
];

const FAQ = [
  { q: 'Is the CSV splitter really free?', a: 'Yes. The tool is fully free with no signup and no daily limit. If you find it useful, you can buy us a coffee — but it is never required.' },
  { q: 'Are my files uploaded to a server?', a: 'No. All CSV parsing and splitting runs locally in your browser using Web Workers. Your data never leaves your device.' },
  { q: 'What is the maximum file size?', a: "There is no hard limit. Processing speed depends on your device's memory and CPU. Most modern laptops handle files of several hundred megabytes without issue." },
  { q: 'Can I split by file size instead of row count?', a: "Choose 'By size' and set a target megabytes-per-file. The splitter packs rows until each chunk reaches that target size." },
  { q: 'Does every split file keep the header row?', a: "Yes, by default. Toggle 'Include header in every file' off if you want the header only in the first chunk." },
];

function AdSlot({ label = 'Advertisement', className = '' }: { label?: string; className?: string }) {
  return (
    <aside className={`ad-slot ${className}`} aria-label={label} role="complementary">
      <span>{label}</span>
    </aside>
  );
}

function App() {
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
      toast.success(`Downloaded ${chunks.length} files as ZIP!`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to split CSV');
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressLabel('');
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen text-slate-900">
      <div className="page-glow" aria-hidden />

      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxShadow: '0 10px 30px -10px rgba(15,23,42,0.15)' },
          success: { iconTheme: { primary: '#3F7FBC', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between h-20 sm:h-24">
          <a href="/" className="flex items-center gap-3" aria-label="CSV Splitter home">
            <img
              src="/favicon.png"
              alt="CSV Splitter — split large CSV files online"
              width="200"
              height="64"
              className="h-14 sm:h-16 w-auto"
              loading="eager"
              fetchPriority="high"
            />
            <div className="leading-tight hidden sm:block">
              <h1 className="text-base font-bold tracking-tight">
                <span className="gradient-text">CSV</span>
                <span className="text-slate-900"> Splitter</span>
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Split large CSVs · 100% in-browser</p>
            </div>
            <h1 className="sr-only sm:hidden">CSV Splitter — Split large CSV files online</h1>
          </a>

          <a
            href={BMC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 11h14a2 2 0 010 4h-1M3 11v6a2 2 0 002 2h9a2 2 0 002-2v-2M3 11V7a2 2 0 012-2h9a2 2 0 012 2v4M7 3v2M11 3v2" />
            </svg>
            <span className="hidden sm:inline">Buy me a coffee</span>
            <span className="sm:hidden">Coffee</span>
          </a>
        </div>
      </header>

      {/* 3-col layout: side ad / content / side ad */}
      <div className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[160px_minmax(0,1fr)_160px] gap-6 lg:gap-10">

        {/* Left side ad rail (desktop only) */}
        <div className="hidden lg:flex sticky top-24 self-start h-fit">
          <AdSlot className="side" label="Ad" />
        </div>

        {/* Center column */}
        <div className="min-w-0">

          {/* Hero */}
          {!fileInfo && (
            <section className="pt-12 sm:pt-16 pb-6 text-center fade-up">
              <span className="chip">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F7FBC]" />
                No upload · No server · Fully private
              </span>
              <h2 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                Split any CSV file
                <br />
                <span className="gradient-text">in seconds</span>
              </h2>
              <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
                A free, browser-based tool to break large CSV files into smaller, manageable chunks — instantly, privately, and without any installation.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
                {[
                  { value: 'No limits', label: 'File size or downloads' },
                  { value: '100%',      label: 'Private — no uploads' },
                  { value: 'Free',      label: 'Forever, no signup' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-xl sm:text-2xl font-extrabold gradient-text">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tool area */}
          <main className="pt-4 pb-12 space-y-5">
            {!fileInfo && <Dropzone onFile={handleFile} />}

            {fileInfo && (
              <div className="fade-up card flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl gradient-brand-soft border border-[#3F7FBC]/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#3F7FBC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-tight truncate">{fileInfo.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{fileInfo.sizeMB.toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={handleClear} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors font-medium">
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
                  onClick={handleSplit}
                  className="btn-brand w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl glow"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Split CSV &amp; Download ZIP
                </button>
              </div>
            )}
          </main>

          {/* Horizontal ad — between tool and features */}
          {!fileInfo && (
            <div className="my-6">
              <AdSlot label="Advertisement" />
            </div>
          )}

          {/* Homepage sections */}
          {!fileInfo && (
            <>
              <section id="features" className="py-10 fade-up">
                <header className="text-center mb-10">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Everything you need to split CSVs</h3>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
                    Powerful features packed into a simple, no-install tool that works entirely in your browser.
                  </p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {FEATURES.map(({ icon, title, desc }) => (
                    <article key={title} className="card p-5 sm:p-6 space-y-3 hover:-translate-y-0.5 transition-transform">
                      <div className="w-11 h-11 rounded-xl gradient-brand text-white flex items-center justify-center shadow-md">
                        {icon}
                      </div>
                      <h4 className="font-semibold text-slate-900">{title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                    </article>
                  ))}
                </div>
              </section>

              <div className="my-6">
                <AdSlot label="Advertisement" />
              </div>

              <section id="how-it-works" className="py-10 fade-up">
                <header className="text-center mb-10">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">How it works</h3>
                  <p className="mt-2 text-sm text-slate-600">Three steps. No sign-up. No upload.</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  {HOW_IT_WORKS.map(({ step, title, desc }) => (
                    <article key={step} className="relative card p-6 space-y-3">
                      <span className="text-5xl font-black text-slate-100 absolute top-3 right-4 leading-none select-none">
                        {step}
                      </span>
                      <div className="w-9 h-9 rounded-lg gradient-brand text-white flex items-center justify-center text-xs font-bold shadow-md">
                        {step}
                      </div>
                      <h4 className="font-semibold text-slate-900">{title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                    </article>
                  ))}
                </div>
              </section>

              <div className="my-6">
                <AdSlot label="Advertisement" />
              </div>

              {/* Buy Me a Coffee */}
              <section id="support" className="py-12 fade-up">
                <div
                  className="relative card overflow-hidden text-center px-6 py-10 sm:px-10 sm:py-14"
                  style={{ background: 'linear-gradient(135deg, rgba(63,127,188,0.06) 0%, rgba(81,185,188,0.10) 100%)' }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand text-white shadow-lg mb-5">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11h14a2 2 0 010 4h-1M3 11v6a2 2 0 002 2h9a2 2 0 002-2v-2M3 11V7a2 2 0 012-2h9a2 2 0 012 2v4M7 3v2M11 3v2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Enjoying the tool?</h3>
                  <p className="mt-3 text-slate-600 max-w-xl mx-auto">
                    CSV Splitter is free, forever — no signup, no limits, no ads in your face. If it saved you time, a small coffee keeps the lights on.
                  </p>
                  <a
                    href={BMC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-brand inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-xl text-sm sm:text-base shadow-lg"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11h14a2 2 0 010 4h-1M3 11v6a2 2 0 002 2h9a2 2 0 002-2v-2M3 11V7a2 2 0 012-2h9a2 2 0 012 2v4M7 3v2M11 3v2" />
                    </svg>
                    Buy me a coffee
                  </a>
                </div>
              </section>

              <section id="faq" className="py-10 fade-up">
                <header className="text-center mb-10">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently asked questions</h3>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQ.map(({ q, a }) => (
                    <details key={q} className="card p-5 group">
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-900">{q}</span>
                        <svg className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Right side ad rail (desktop only) */}
        <div className="hidden lg:flex sticky top-24 self-start h-fit">
          <AdSlot className="side" label="Ad" />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
