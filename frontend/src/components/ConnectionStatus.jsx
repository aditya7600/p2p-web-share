import React from 'react';
import { Radio, RefreshCw, CheckCircle2, ShieldAlert, Sparkles, Wifi } from 'lucide-react';

export default function ConnectionStatus({ status }) {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'waiting':
        return {
          bg: 'bg-zinc-100 dark:bg-zinc-800/60',
          border: 'border-zinc-200/50 dark:border-zinc-800/50',
          text: 'text-zinc-600 dark:text-zinc-400',
          icon: <Radio className="h-4 w-4 animate-pulse text-zinc-500" />,
          label: 'Waiting for connection...',
          colorDot: 'bg-zinc-400 dark:bg-zinc-500'
        };
      case 'connecting':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          label: 'Establishing WebRTC tunnel...',
          colorDot: 'bg-amber-500'
        };
      case 'connected':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: 'Securely connected',
          colorDot: 'bg-emerald-500'
        };
      case 'sending':
      case 'receiving':
      case 'transferring':
        return {
          bg: 'bg-violet-500/10',
          border: 'border-violet-500/20',
          text: 'text-violet-600 dark:text-violet-400',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          label: status.charAt(0).toUpperCase() + status.slice(1) + ' data...',
          colorDot: 'bg-violet-500'
        };
      case 'completed':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          icon: <Sparkles className="h-4 w-4 text-emerald-500 animate-bounce" />,
          label: 'Transfer completed',
          colorDot: 'bg-emerald-500'
        };
      case 'disconnected':
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-600 dark:text-red-400',
          icon: <ShieldAlert className="h-4 w-4" />,
          label: 'Disconnected',
          colorDot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-zinc-100 dark:bg-zinc-800',
          border: 'border-zinc-200 dark:border-zinc-700',
          text: 'text-zinc-600 dark:text-zinc-400',
          icon: <Radio className="h-4 w-4" />,
          label: status,
          colorDot: 'bg-zinc-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      <div className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${config.border} ${config.bg} ${config.text} transition-all duration-300`}>
        <div className="flex items-center gap-2.5">
          {config.icon}
          <span className="font-outfit font-semibold text-sm tracking-wide">
            {config.label}
          </span>
        </div>
        
        {/* Connection Quality Indicator */}
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/20 px-2 py-1 rounded-lg border border-white/5">
          <Wifi className={`h-3.5 w-3.5 ${status.toLowerCase() === 'disconnected' ? 'text-red-500/40' : 'text-emerald-500/70'}`} />
          <div className="flex items-center gap-0.5">
            <span className={`h-1.5 w-1.5 rounded-full ${config.colorDot} animate-pulse`} />
          </div>
        </div>
      </div>
    </div>
  );
}
