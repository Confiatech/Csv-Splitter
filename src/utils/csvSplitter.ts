import Papa from 'papaparse';
import type { SplitOptions } from '../types';

/**
 * Split a CSV file by row count.
 * Uses Papa Parse with worker:true to avoid blocking the main thread.
 */
export function splitByRows(
  file: File,
  options: SplitOptions,
  onProgress?: (pct: number) => void
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      worker: true,
      header: false,
      skipEmptyLines: true,
      delimiter: options.delimiter === 'auto' ? '' : options.delimiter,
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }

        const headerRow = data[0];
        const bodyRows = data.slice(1);
        const chunks: string[] = [];
        const total = bodyRows.length;

        for (let i = 0; i < bodyRows.length; i += options.rowsPerFile) {
          const chunkRows = bodyRows.slice(i, i + options.rowsPerFile);
          const chunkData = options.includeHeader
            ? [headerRow, ...chunkRows]
            : chunkRows;
          chunks.push(Papa.unparse(chunkData, { delimiter: results.meta.delimiter }));
          onProgress?.(Math.round(((i + chunkRows.length) / total) * 100));
        }

        resolve(chunks);
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

/**
 * Split a CSV file by approximate target size in MB.
 * Parses all rows, then accumulates them until the byte budget is hit.
 */
export function splitBySize(
  file: File,
  options: SplitOptions,
  onProgress?: (pct: number) => void
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      worker: true,
      header: false,
      skipEmptyLines: true,
      delimiter: options.delimiter === 'auto' ? '' : options.delimiter,
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }

        const headerRow = data[0];
        const bodyRows = data.slice(1);
        const targetBytes = options.mbPerFile * 1024 * 1024;
        const chunks: string[] = [];
        let currentRows: string[][] = [];
        let currentBytes = 0;
        const headerStr = Papa.unparse([headerRow], { delimiter: results.meta.delimiter }) + '\n';
        const headerBytes = new TextEncoder().encode(headerStr).length;

        for (let i = 0; i < bodyRows.length; i++) {
          const rowStr = Papa.unparse([bodyRows[i]], { delimiter: results.meta.delimiter }) + '\n';
          const rowBytes = new TextEncoder().encode(rowStr).length;

          if (
            currentRows.length > 0 &&
            currentBytes + rowBytes > targetBytes
          ) {
            const chunkData = options.includeHeader
              ? [headerRow, ...currentRows]
              : currentRows;
            chunks.push(Papa.unparse(chunkData, { delimiter: results.meta.delimiter }));
            currentRows = [];
            currentBytes = options.includeHeader ? headerBytes : 0;
          }

          currentRows.push(bodyRows[i]);
          currentBytes += rowBytes;
          onProgress?.(Math.round(((i + 1) / bodyRows.length) * 100));
        }

        if (currentRows.length > 0) {
          const chunkData = options.includeHeader
            ? [headerRow, ...currentRows]
            : currentRows;
          chunks.push(Papa.unparse(chunkData, { delimiter: results.meta.delimiter }));
        }

        resolve(chunks);
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

/**
 * Parse the first N rows for preview.
 */
export function parsePreview(
  file: File,
  previewRows = 100
): Promise<{ headers: string[]; rows: string[][]; detectedDelimiter: string }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      preview: previewRows + 1, // +1 for header
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length === 0) {
          reject(new Error('File appears to be empty'));
          return;
        }
        const headers = data[0];
        const rows = data.slice(1);
        resolve({
          headers,
          rows,
          detectedDelimiter: results.meta.delimiter,
        });
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}
