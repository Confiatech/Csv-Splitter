import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadAsZip(
  chunks: string[],
  originalFileName: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const zip = new JSZip();
  const baseName = originalFileName.replace(/\.csv$/i, '');

  chunks.forEach((content, index) => {
    zip.file(`${baseName}_part${index + 1}.csv`, content);
  });

  const blob = await zip.generateAsync(
    { type: 'blob' },
    (metadata) => {
      onProgress?.(Math.round(metadata.percent));
    }
  );

  saveAs(blob, `${baseName}_split.zip`);
}

export async function downloadSingle(content: string, fileName: string): Promise<void> {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, fileName);
}
