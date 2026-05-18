interface PreviewTableProps {
  headers: string[];
  rows: string[][];
  detectedDelimiter: string;
}

const DELIMITER_LABELS: Record<string, string> = {
  ',':  'Comma',
  '\t': 'Tab',
  ';':  'Semicolon',
  '|':  'Pipe',
};

export function PreviewTable({ headers, rows, detectedDelimiter }: PreviewTableProps) {
  const delimLabel = DELIMITER_LABELS[detectedDelimiter] ?? `"${detectedDelimiter}"`;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#3F7FBC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">
            Preview
          </span>
          <span className="text-xs text-slate-500 font-normal">
            — first {rows.length} rows
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Delimiter:</span>
          <code className="text-xs gradient-brand-soft text-[#1d4d7a] px-2 py-0.5 rounded-md border border-[#3F7FBC]/20">
            {delimLabel}
          </code>
        </div>
      </div>

      <div className="overflow-auto max-h-64">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-white">
            <tr>
              <th className="px-3 py-2 text-slate-400 font-medium w-10 border-b border-slate-100">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-slate-700 font-semibold whitespace-nowrap max-w-[200px] truncate border-b border-slate-100"
                  title={h}
                >
                  {h || <span className="italic text-slate-400">col_{i + 1}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`transition-colors hover:bg-[#3F7FBC]/[0.04] ${
                  ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                <td className="px-3 py-1.5 text-slate-400 border-b border-slate-50">{ri + 1}</td>
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 text-slate-700 max-w-[200px] truncate border-b border-slate-50"
                    title={row[ci] ?? ''}
                  >
                    {row[ci] ?? <span className="text-slate-300 italic">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
