import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Dropzone } from './components/Dropzone';
import { PreviewTable } from './components/PreviewTable';
import { SplitControls } from './components/SplitControls';
import { ProgressBar } from './components/ProgressBar';
import { LicenseModal } from './components/LicenseModal';
import { parsePreview, splitByRows, splitBySize } from './utils/csvSplitter';
import { downloadAsZip } from './utils/zipDownloader';
import { getIsProFromStorage, canProcessFile, FREE_TIER_LIMIT_MB } from './utils/license';
import type { FileInfo, PreviewData, SplitOptions } from './types';

function App() {
  const [isPro, setIsPro] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

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
  }, []);

  async function handleFile(file: File) {
    const sizeMB = file.size / (1024 * 1024);

    if (!canProcessFile(sizeMB, isPro)) {
      toast.error(
        `File is ${sizeMB.toFixed(1)}MB. Free tier supports up to ${FREE_TIER_LIMIT_MB}MB. Upgrade to Pro for unlimited size.`,
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

    setProcessing(true);
    setProgress(0);
    setProgressLabel('Splitting CSV...');

    try {
      const chunks =
        options.mode === 'rows'
          ? await splitByRows(fileInfo.file, options, setProgress)
          : await splitBySize(fileInfo.file, options, setProgress);

      if (chunks.length === 0) {
        toast.error('No data to split');
        return;
      }

      setProgressLabel('Creating ZIP...');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📊</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">CSV Stream</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Split large CSV files instantly. Your data stays private.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLicenseModal(true)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              isPro
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPro ? '✓ Pro' : 'Upgrade $9'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Dropzone */}
        {!fileInfo && <Dropzone onFile={handleFile} isPro={isPro} />}

        {/* File info */}
        {fileInfo && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📄</div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{fileInfo.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {fileInfo.sizeMB.toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <PreviewTable
            headers={preview.headers}
            rows={preview.rows}
            detectedDelimiter={preview.detectedDelimiter}
          />
        )}

        {/* Split controls */}
        {preview && <SplitControls options={options} onChange={setOptions} />}

        {/* Progress */}
        {processing && <ProgressBar progress={progress} label={progressLabel} />}

        {/* Split button */}
        {preview && !processing && (
          <button
            onClick={handleSplit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-lg hover:shadow-xl"
          >
            Split CSV → Download ZIP
          </button>
        )}

        {/* Privacy notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4">
          <span className="text-lg">🔒</span>
          <p>Your file never leaves this browser. All processing happens locally.</p>
        </div>
      </main>

      {/* License modal */}
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
