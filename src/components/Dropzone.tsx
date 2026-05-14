import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFile: (file: File) => void;
  isPro: boolean;
}

export function Dropzone({ onFile, isPro }: DropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.csv', '.tsv', '.txt'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative group cursor-pointer rounded-2xl transition-all duration-300 outline-none
        ${isDragActive && !isDragReject
          ? 'dropzone-active border-2 border-indigo-400 bg-indigo-500/10'
          : isDragReject
          ? 'border-2 border-red-400 bg-red-500/10'
          : 'border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5'
        }
      `}
    >
      <input {...getInputProps()} />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex flex-col items-center gap-5 px-8 py-14">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive && !isDragReject
              ? 'bg-indigo-500/30 scale-110'
              : isDragReject
              ? 'bg-red-500/20'
              : 'bg-white/5 group-hover:bg-indigo-500/15 group-hover:scale-105'
          }`}
        >
          {isDragReject ? (
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : isDragActive ? (
            <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-indigo-400/70 group-hover:text-indigo-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <p className={`text-lg font-semibold transition-colors ${
            isDragActive && !isDragReject ? 'text-indigo-200' : isDragReject ? 'text-red-300' : 'text-white/80'
          }`}>
            {isDragReject
              ? 'Only CSV / TSV files are supported'
              : isDragActive
              ? 'Release to load your file'
              : 'Drop your CSV file here'}
          </p>
          {!isDragActive && (
            <p className="text-sm text-indigo-300/50">
              or{' '}
              <span className="text-indigo-400 underline underline-offset-2 decoration-dotted group-hover:text-indigo-300 transition-colors">
                click to browse
              </span>
            </p>
          )}
        </div>

        {/* Limits */}
        {!isDragActive && (
          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
              Free: up to 50 MB
            </span>
            <span className="text-white/10">·</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
              Pro: up to 2 GB
            </span>
            {!isPro && (
              <>
                <span className="text-white/10">·</span>
                <span className="text-amber-400/60">You're on Free</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
