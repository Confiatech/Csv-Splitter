import type { SplitOptions } from '../types';

interface SplitControlsProps {
  options: SplitOptions;
  onChange: (opts: SplitOptions) => void;
}

const DELIMITERS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab (\\t)' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '|', label: 'Pipe (|)' },
];

export function SplitControls({ options, onChange }: SplitControlsProps) {
  const set = <K extends keyof SplitOptions>(key: K, value: SplitOptions[K]) =>
    onChange({ ...options, [key]: value });

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm uppercase tracking-wide">
        Split Options
      </h3>

      {/* Split mode */}
      <div className="space-y-3">
        {/* By rows */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="splitMode"
            value="rows"
            checked={options.mode === 'rows'}
            onChange={() => set('mode', 'rows')}
            className="accent-blue-500 w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors">
            By rows
          </span>
          <input
            type="number"
            min={1}
            value={options.rowsPerFile}
            disabled={options.mode !== 'rows'}
            onChange={(e) => set('rowsPerFile', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-28 px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">rows per file</span>
        </label>

        {/* By size */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="radio"
            name="splitMode"
            value="size"
            checked={options.mode === 'size'}
            onChange={() => set('mode', 'size')}
            className="accent-blue-500 w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors">
            By size
          </span>
          <input
            type="number"
            min={1}
            value={options.mbPerFile}
            disabled={options.mode !== 'size'}
            onChange={(e) => set('mbPerFile', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-28 px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">MB per file</span>
        </label>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
        {/* Header toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.includeHeader}
            onChange={(e) => set('includeHeader', e.target.checked)}
            className="accent-blue-500 w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Include header row in every split file
          </span>
        </label>

        {/* Delimiter override */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">Delimiter:</span>
          <select
            value={options.delimiter}
            onChange={(e) => set('delimiter', e.target.value)}
            className="text-sm px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
