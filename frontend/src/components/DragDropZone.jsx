import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to format bytes
export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function DragDropZone({ selectedFile, onFileSelect, onFileClear }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  const fileTooLarge = fileRejections.length > 0 && fileRejections[0].errors.some(e => e.code === 'file-too-large');

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            {...getRootProps()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 backdrop-blur-md bg-white/5 dark:bg-zinc-900/40 border-zinc-300 dark:border-zinc-800 ${
              isDragActive 
                ? 'border-violet-500 bg-violet-500/10 scale-[1.02]' 
                : 'hover:border-violet-500/50 hover:bg-white/10 dark:hover:bg-zinc-800/40'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center gap-4">
              <div className={`p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300 ${
                isDragActive ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-500' : ''
              }`}>
                <UploadCloud className="h-10 w-10" />
              </div>
              
              <div>
                <p className="font-outfit font-semibold text-lg text-zinc-700 dark:text-zinc-200">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
                </p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5">
                  or <span className="text-violet-600 dark:text-violet-400 font-semibold group-hover:underline">browse files</span> from your device
                </p>
              </div>

              <div className="w-full border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4 mt-2">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Supports any file type up to 500 MB
                </p>
              </div>
            </div>

            {fileTooLarge && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 justify-center"
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>File is too large. Maximum size allowed is 500MB.</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="file-details"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-xl flex items-center gap-4 group"
          >
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
              <File className="h-8 w-8" />
            </div>
            
            <div className="flex-1 min-w-0 pr-6">
              <p className="font-outfit font-semibold text-zinc-800 dark:text-zinc-100 truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {formatBytes(selectedFile.size)}
              </p>
            </div>

            <button
              onClick={onFileClear}
              className="absolute top-4 right-4 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
