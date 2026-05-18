import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFile: (file: File) => void;
}

export function Dropzone({ onFile }: DropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.csv'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      aria-label="Upload CSV file"
      className={`
        relative group cursor-pointer rounded-2xl transition-all duration-300 outline-none
        ${isDragActive && !isDragReject
          ? 'dropzone-active border-2 border-[#3F7FBC] bg-[#3F7FBC]/5'
          : isDragReject
          ? 'border-2 border-red-400 bg-red-50'
          : 'border-2 border-dashed border-slate-300 bg-white hover:border-[#3F7FBC] hover:bg-[#3F7FBC]/[0.03]'
        }
      `}
    >
      <input {...getInputProps()} />

      <div
        className="absolute inset-0 rounded-2xl opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(63,127,188,.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(63,127,188,.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex flex-col items-center gap-5 px-6 sm:px-8 py-12 sm:py-16">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive && !isDragReject
              ? 'gradient-brand text-white scale-110 shadow-lg'
              : isDragReject
              ? 'bg-red-100 text-red-500'
              : 'gradient-brand-soft text-[#3F7FBC] group-hover:scale-105'
          }`}
        >
          {isDragReject ? (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : isDragActive ? (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          )}
        </div>

        <div className="text-center space-y-1.5">
          <p className={`text-lg font-semibold transition-colors ${
            isDragActive && !isDragReject ? 'text-[#3F7FBC]' : isDragReject ? 'text-red-600' : 'text-slate-900'
          }`}>
            {isDragReject
              ? 'Only CSV files are supported'
              : isDragActive
              ? 'Release to load your file'
              : 'Drop your CSV file here'}
          </p>
          {!isDragActive && (
            <p className="text-sm text-slate-500">
              or{' '}
              <span className="text-[#3F7FBC] underline underline-offset-2 decoration-dotted group-hover:text-[#51B9BC] transition-colors">
                click to browse
              </span>
            </p>
          )}
        </div>

        {!isDragActive && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#51B9BC]" />
              CSV 
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F7FBC]" />
              No size limits
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% private
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
