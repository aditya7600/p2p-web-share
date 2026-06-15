import React from 'react';
import { AlertCircle, RefreshCw, Home, ShieldAlert, Ban, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ErrorCard({ errorType, message, onRetry, onReset }) {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'peer-disconnected':
        return {
          icon: <Ban className="h-8 w-8 text-red-500" />,
          title: 'Peer Disconnected',
          desc: 'The other browser closed their tab or disconnected from the signaling server.',
          showRetry: true
        };
      case 'cancelled':
        return {
          icon: <Ban className="h-8 w-8 text-amber-500" />,
          title: 'Transfer Cancelled',
          desc: 'The file transfer was rejected or cancelled by one of the participants.',
          showRetry: false
        };
      case 'connection-lost':
        return {
          icon: <RefreshCw className="h-8 w-8 text-red-500 animate-spin-slow" />,
          title: 'Connection Lost',
          desc: 'The WebRTC connection timed out or network connectivity was lost.',
          showRetry: true
        };
      case 'expired':
        return {
          icon: <Clock className="h-8 w-8 text-zinc-500" />,
          title: 'Room Expired',
          desc: 'This transfer link has expired or the signaling session has closed.',
          showRetry: false
        };
      case 'corruption':
        return {
          icon: <ShieldAlert className="h-8 w-8 text-red-600" />,
          title: 'File Corrupted',
          desc: 'Cryptographic hash validation failed. The decrypted file does not match the original.',
          showRetry: true
        };
      default:
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-500" />,
          title: 'Transfer Failed',
          desc: message || 'An unexpected error occurred during the direct transfer process.',
          showRetry: true
        };
    }
  };

  const config = getErrorConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-8 text-center shadow-xl relative overflow-hidden"
    >
      {/* Decorative top glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-500/10 dark:bg-red-500/15 blur-2xl rounded-full" />

      {/* Error Badge */}
      <div className="relative mx-auto mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/50 border border-red-500/20 shadow-lg shadow-red-500/5">
        {config.icon}
      </div>

      <h2 className="font-outfit font-black text-2xl text-zinc-800 dark:text-zinc-100 tracking-tight">
        {config.title}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
        {config.desc}
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-3">
        {config.showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md shadow-violet-600/10 hover:shadow-lg hover:shadow-violet-600/20 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Reconnecting</span>
          </button>
        )}
        
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold active:scale-[0.98] transition-all"
        >
          <Home className="h-5 w-5" />
          <span>Back to Home</span>
        </button>
      </div>
    </motion.div>
  );
}
