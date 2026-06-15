import React from 'react';
import { ArrowRightLeft, Hourglass, Gauge, HelpCircle } from 'lucide-react';
import { formatBytes } from './DragDropZone';

// Helper to format speed
export function formatSpeed(bytesPerSecond) {
  if (bytesPerSecond === 0 || !bytesPerSecond || isNaN(bytesPerSecond)) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Helper to format time
export function formatTime(seconds) {
  if (seconds === Infinity || isNaN(seconds) || seconds < 0) return '--';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

export default function TransferStats({ 
  bytesTransferred, 
  totalBytes, 
  speed, 
  elapsedTime, 
  eta 
}) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full text-left">
      {/* Bytes Transferred */}
      <div className="p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1.5">
          <ArrowRightLeft className="h-4 w-4 text-violet-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Transferred</span>
        </div>
        <div className="font-outfit font-bold text-zinc-800 dark:text-zinc-100 text-sm leading-snug">
          {formatBytes(bytesTransferred)}
        </div>
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          of {formatBytes(totalBytes)}
        </div>
      </div>

      {/* Speed */}
      <div className="p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1.5">
          <Gauge className="h-4 w-4 text-fuchsia-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Speed</span>
        </div>
        <div className="font-outfit font-bold text-zinc-800 dark:text-zinc-100 text-sm leading-snug">
          {formatSpeed(speed)}
        </div>
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          peer-to-peer stream
        </div>
      </div>

      {/* Elapsed Time */}
      <div className="p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1.5">
          <Hourglass className="h-4 w-4 text-amber-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Elapsed Time</span>
        </div>
        <div className="font-outfit font-bold text-zinc-800 dark:text-zinc-100 text-sm leading-snug">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          since start
        </div>
      </div>

      {/* ETA */}
      <div className="p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1.5">
          <Hourglass className="h-4 w-4 text-emerald-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Time Left</span>
        </div>
        <div className="font-outfit font-bold text-zinc-800 dark:text-zinc-100 text-sm leading-snug">
          {formatTime(eta)}
        </div>
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          estimated
        </div>
      </div>
    </div>
  );
}
