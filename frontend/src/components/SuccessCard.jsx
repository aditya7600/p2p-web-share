import React from 'react';
import { Check, ShieldCheck, Download, Home, Sparkles } from 'lucide-react';
import { formatBytes } from './DragDropZone';
import { formatTime } from './TransferStats';
import { motion } from 'framer-motion';

export default function SuccessCard({ 
  fileName, 
  fileSize, 
  duration, 
  sha256, 
  onDownload, 
  onReset,
  isReceiver = false
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-8 text-center shadow-xl relative overflow-hidden"
    >
      {/* Decorative top glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl rounded-full" />

      {/* Success Badge */}
      <div className="relative mx-auto mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1, duration: 0.4 }}
        >
          <Check className="h-8 w-8" />
        </motion.div>
        
        {/* Floating Sparks */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 text-amber-500"
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
      </div>

      <h2 className="font-outfit font-black text-2xl text-zinc-800 dark:text-zinc-100 tracking-tight">
        Transfer Complete
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
        Your file has been transferred directly and securely.
      </p>

      {/* File Info Card */}
      <div className="my-6 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/40 text-left">
        <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate" title={fileName}>
          {fileName}
        </div>
        
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-2 pt-2 border-t border-zinc-200/20 dark:border-zinc-850">
          <span>Size</span>
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">{formatBytes(fileSize)}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
          <span>Duration</span>
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">{formatTime(duration)}</span>
        </div>

        {sha256 && (
          <div className="flex items-center gap-1.5 mt-3.5 px-3 py-1.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/10 dark:border-emerald-400/10 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Integrity Verified (SHA-256 passed)</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        {isReceiver && (
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md shadow-violet-600/10 hover:shadow-lg hover:shadow-violet-600/20 active:scale-[0.98] transition-all"
          >
            <Download className="h-5 w-5" />
            <span>Download Again</span>
          </button>
        )}
        
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold active:scale-[0.98] transition-all"
        >
          <Home className="h-5 w-5" />
          <span>Send Another File</span>
        </button>
      </div>
    </motion.div>
  );
}
