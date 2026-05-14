import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFile: (file: File) => void;
  isPro: boolean;
}

export function Dropzone({ onFile, isPro }: DropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.csv', '.tsv', '.txt'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
        ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : ''}
        ${isDragReject ? 'border-red-400 bg-red-50 dark:bg-red-950/30' : ''}
        ${!isDragActive ? 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">📁</div>
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            {isDragActive ? 'Drop your CSV here...' : 'Drag & drop a CSV file here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            or <span className="text-blue-500 underline">click to browse</span>
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Maximum size: <strong>50MB</strong> (Free) · <strong>2GB</strong> (Pro)
          {!isPro && (
            <span className="ml-2 text-amber-500">— You're on the free tier</span>
          )}
        </p>
      </div>
    </div>
  );
}
