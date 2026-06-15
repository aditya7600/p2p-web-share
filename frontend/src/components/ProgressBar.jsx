import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ progress }) {
  // Clamp progress between 0 and 100
  const percentage = Math.min(Math.max(Math.round(progress), 0), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Transfer Progress
        </span>
        <span className="font-outfit font-bold text-sm text-violet-600 dark:text-violet-400">
          {percentage}%
        </span>
      </div>
      <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-200/20 dark:border-zinc-800/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 relative rounded-full"
        >
          {/* Subtle glowing overlay at the tip */}
          {percentage > 0 && percentage < 100 && (
            <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/40 blur-[1px] animate-pulse" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
