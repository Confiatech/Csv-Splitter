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
      {/* Table header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18" />
          </svg>
          <span className="text-sm font-medium text-white/70">
            Preview
          </span>
          <span className="text-xs text-white/25 font-normal">
            — first {rows.length} rows
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white/30">Delimiter:</span>
          <code className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {delimLabel}
          </code>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-60">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-[#0d0b1e]">
            <tr>
              <th className="px-3 py-2 text-white/20 font-medium w-10 border-b border-white/5">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-indigo-300/70 font-semibold whitespace-nowrap max-w-[180px] truncate border-b border-white/5"
                  title={h}
                >
                  {h || <span className="italic text-white/20">col_{i + 1}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`transition-colors hover:bg-indigo-500/5 ${
                  ri % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                }`}
              >
                <td className="px-3 py-1.5 text-white/20 border-b border-white/4">{ri + 1}</td>
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 text-white/55 max-w-[180px] truncate border-b border-white/4"
                    title={row[ci] ?? ''}
                  >
                    {row[ci] ?? <span className="text-white/15 italic">—</span>}
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
