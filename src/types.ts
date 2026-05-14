export type SplitMode = 'rows' | 'size';

export interface SplitOptions {
  mode: SplitMode;
  rowsPerFile: number;
  mbPerFile: number;
  includeHeader: boolean;
  delimiter: string;
}

export interface FileInfo {
  file: File;
  name: string;
  sizeMB: number;
}

export interface PreviewData {
  headers: string[];
  rows: string[][];
  detectedDelimiter: string;
}

export interface SplitResult {
  chunks: string[];
  chunkCount: number;
}
