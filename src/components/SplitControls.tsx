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
    <div className="card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white/80 tracking-wide uppercase">
          Split Options
        </h3>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* By rows */}
        <button
          type="button"
          onClick={() => set('mode', 'rows')}
          className={`relative text-left rounded-xl p-4 border transition-all duration-200 ${
            options.mode === 'rows'
              ? 'border-indigo-500/60 bg-indigo-500/10'
              : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
          }`}
        >
          {options.mode === 'rows' && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${options.mode === 'rows' ? 'text-indigo-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className={`text-sm font-medium ${options.mode === 'rows' ? 'text-indigo-200' : 'text-white/50'}`}>
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
            className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 disabled:opacity-30 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
          <p className="text-xs text-white/30 mt-1.5">rows per file</p>
        </button>

        {/* By size */}
        <button
          type="button"
          onClick={() => set('mode', 'size')}
          className={`relative text-left rounded-xl p-4 border transition-all duration-200 ${
            options.mode === 'size'
              ? 'border-indigo-500/60 bg-indigo-500/10'
              : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
          }`}
        >
          {options.mode === 'size' && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400" />
          )}
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${options.mode === 'size' ? 'text-indigo-400' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className={`text-sm font-medium ${options.mode === 'size' ? 'text-indigo-200' : 'text-white/50'}`}>
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
            className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 disabled:opacity-30 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
          <p className="text-xs text-white/30 mt-1.5">MB per file</p>
        </button>
      </div>

      {/* Extra options */}
      <div className="border-t border-white/6 pt-4 flex flex-wrap gap-x-6 gap-y-3">
        {/* Header toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => set('includeHeader', !options.includeHeader)}
            className={`w-9 h-5 rounded-full transition-all duration-200 relative flex-shrink-0 ${
              options.includeHeader ? 'bg-indigo-500' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                options.includeHeader ? 'left-4' : 'left-0.5'
              }`}
            />
          </div>
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors select-none">
            Include header in every file
          </span>
        </label>

        {/* Delimiter */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-white/40 whitespace-nowrap">Delimiter</span>
          <select
            value={options.delimiter}
            onChange={(e) => set('delimiter', e.target.value)}
            className="text-sm px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition appearance-none cursor-pointer"
          >
            {DELIMITERS.map((d) => (
              <option key={d.value} value={d.value} className="bg-gray-900">
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
