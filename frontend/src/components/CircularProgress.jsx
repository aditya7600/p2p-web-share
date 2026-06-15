import React from 'react';
import { motion } from 'framer-motion';

export default function CircularProgress({ progress, size = 120, strokeWidth = 10 }) {
  const percentage = Math.min(Math.max(Math.round(progress), 0), 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* SVG Gradient Definition */}
        <defs>
          <linearGradient id="circularGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>

        {/* Track Circle */}
        <circle
          className="text-zinc-100 dark:text-zinc-800/60"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Indicator Circle */}
        <motion.circle
          stroke="url(#circularGlow)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* Percentage Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-outfit font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">
          {percentage}%
        </span>
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
          Done
        </span>
      </div>
    </div>
  );
}
