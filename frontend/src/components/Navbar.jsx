import React from 'react';
import { Share2, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/40 dark:border-zinc-800/40 bg-white/40 dark:bg-[#0a0a0c]/40 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
            <Share2 className="h-5.5 w-5.5" />
          </div>
          <span className="font-outfit font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-violet-600 to-fuchsia-500 dark:from-white dark:via-violet-400 dark:to-fuchsia-400">
            P2P Web Share
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/5 border border-emerald-500/20 dark:border-emerald-400/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide">
            <ShieldCheck className="h-4 w-4" />
            End-to-End Encrypted
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
