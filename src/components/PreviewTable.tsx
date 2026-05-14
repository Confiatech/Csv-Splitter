interface PreviewTableProps {
  headers: string[];
  rows: string[][];
  detectedDelimiter: string;
}

const DELIMITER_LABELS: Record<string, string> = {
  ',': 'Comma (,)',
  '\t': 'Tab (\\t)',
  ';': 'Semicolon (;)',
  '|': 'Pipe (|)',
};

export function PreviewTable({ headers, rows, detectedDelimiter }: PreviewTableProps) {
  const delimLabel = DELIMITER_LABELS[detectedDelimiter] ?? `"${detectedDelimiter}"`;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Preview <span className="text-gray-400 font-normal">(first {rows.length} rows)</span>
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Detected delimiter: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{delimLabel}</code>
        </span>
      </div>
      <div className="overflow-auto max-h-64">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium w-10">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 font-semibold whitespace-nowrap max-w-48 truncate"
                  title={h}
                >
                  {h || <span className="italic text-gray-400">col_{i + 1}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-1.5 text-xs text-gray-400">{ri + 1}</td>
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 text-gray-700 dark:text-gray-300 max-w-48 truncate"
                    title={row[ci] ?? ''}
                  >
                    {row[ci] ?? ''}
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
