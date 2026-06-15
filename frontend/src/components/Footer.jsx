import React from 'react';
import { Shield, Zap, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-[#08080a]/50 backdrop-blur-md transition-colors duration-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold">
              <Zap className="h-5 w-5" />
              <span>Direct Transfers</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs leading-relaxed">
              Files are streamed directly between browsers using WebRTC. No data is stored on the server.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold">
              <Lock className="h-5 w-5" />
              <span>Zero-Knowledge Encryption</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs leading-relaxed">
              Symmetric AES-GCM keys are stored in the URL hash and never transmitted to our servers.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2.5">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold">
              <Shield className="h-5 w-5" />
              <span>Integrity Verification</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs leading-relaxed">
              Cryptographic SHA-256 validation guarantees file checksums match perfectly on both sides.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200/20 dark:border-zinc-800/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} P2P Web Share. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-default">Privacy Protocol</span>
            <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-default">Secure Channels</span>
            <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-default">Status Check</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
