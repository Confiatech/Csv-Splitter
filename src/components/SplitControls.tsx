import type { SplitOptions } from '../types';

interface SplitControlsProps {
  options: SplitOptions;
  onChange: (opts: SplitOptions) => void;
}

const DELIMITERS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: ',',   label: 'Comma (,)' },
  { value: '\t',  label: 'Tab (\\t)' },
  { value: ';',   label: 'Semicolon (;)' },
  { value: '|',   label: 'Pipe (|)' },
];

export function SplitControls({ options, onChange }: SplitControlsProps) {
  const set = <K extends keyof SplitOptions>(key: K, value: SplitOptions[K]) =>
    onChange({ ...options, [key]: value });

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md gradient-brand-soft border border-[#3F7FBC]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#3F7FBC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
          Split Options
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => set('mode', 'rows')}
          className={`relative text-left rounded-xl p-4 border-2 transition-all duration-200 ${
            options.mode === 'rows'
              ? 'border-[#3F7FBC] bg-[#3F7FBC]/5'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          {options.mode === 'rows' && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#3F7FBC]" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${options.mode === 'rows' ? 'text-[#3F7FBC]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className={`text-sm font-medium ${options.mode === 'rows' ? 'text-slate-900' : 'text-slate-600'}`}>
              By rows
            </span>
          </div>
          <input
            type="number"
            min={1}
            value={options.rowsPerFile}
            disabled={options.mode !== 'rows'}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => set('rowsPerFile', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#3F7FBC]/30 focus:border-[#3F7FBC] transition"
          />
          <p className="text-xs text-slate-500 mt-1.5">rows per file</p>
        </button>

        <button
          type="button"
          onClick={() => set('mode', 'size')}
          className={`relative text-left rounded-xl p-4 border-2 transition-all duration-200 ${
            options.mode === 'size'
              ? 'border-[#51B9BC] bg-[#51B9BC]/5'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          {options.mode === 'size' && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#51B9BC]" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${options.mode === 'size' ? 'text-[#51B9BC]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className={`text-sm font-medium ${options.mode === 'size' ? 'text-slate-900' : 'text-slate-600'}`}>
              By size
            </span>
          </div>
          <input
            type="number"
            min={1}
            value={options.mbPerFile}
            disabled={options.mode !== 'size'}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => set('mbPerFile', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#51B9BC]/30 focus:border-[#51B9BC] transition"
          />
          <p className="text-xs text-slate-500 mt-1.5">MB per file</p>
        </button>
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <button
            type="button"
            onClick={() => set('includeHeader', !options.includeHeader)}
            aria-pressed={options.includeHeader}
            className={`w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0 ${
              options.includeHeader ? 'gradient-brand' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                options.includeHeader ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
          <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors select-none">
            Include header in every file
          </span>
        </label>

        <div className="flex items-center gap-2.5">
          <span className="text-sm text-slate-600 whitespace-nowrap">Delimiter</span>
          <select
            value={options.delimiter}
            onChange={(e) => set('delimiter', e.target.value)}
            className="text-sm px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3F7FBC]/30 focus:border-[#3F7FBC] transition cursor-pointer"
          >
            {DELIMITERS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
