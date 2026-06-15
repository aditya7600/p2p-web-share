import React, { useState } from 'react';
import { QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRButton({ value }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white transition-all shadow-sm hover:shadow hover:scale-105 active:scale-95 duration-200"
        title="Show QR Code"
        aria-label="Show QR Code"
      >
        <QrCode className="h-5.5 w-5.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-xl"
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-outfit font-bold text-xl text-zinc-800 dark:text-zinc-100 mb-2">
                Scan QR Code
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Scan with your phone camera to join the room and download files instantly.
              </p>

              {/* QR Code Container */}
              <div className="mx-auto inline-block p-4 rounded-2xl bg-white border border-zinc-100 dark:border-zinc-800 shadow-md">
                <QRCodeSVG
                  value={value}
                  size={200}
                  level="M"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>

              {/* Display truncated link */}
              <div className="mt-6 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-150 dark:border-zinc-900 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {value}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
