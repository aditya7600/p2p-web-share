import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../context/WebRTCContext';
import DragDropZone, { formatBytes } from '../components/DragDropZone';
import { ArrowRight, Share2, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [file, setFile] = useState(null);
  const { createRoom, resetStates, history, clearHistory } = useWebRTC();
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleFileClear = () => {
    setFile(null);
  };

  const handleGenerateRoom = async () => {
    if (!file) return;
    
    // Clear previous states
    resetStates();
    
    // Create room
    await createRoom(file);
    
    // Redirect to sender dashboard
    navigate('/sender');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Dynamic Animated Background Gradients (Glassmorphism & glowing circles) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 50, 0],
            y: [0, 40, -40, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/15 blur-[100px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center gap-10">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Share2 className="h-3.5 w-3.5" />
            <span>P2P WebRTC technology</span>
          </div>

          <h1 className="font-outfit font-black text-4xl sm:text-6xl tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
            Direct Browser Sharing{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">
              Without the Cloud.
            </span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed font-normal">
            Transfer files directly from your device to another browser. End-to-end encrypted, zero data retention, and maximum transfer speed.
          </p>
        </motion.div>

        {/* Upload Zone & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-lg"
        >
          <div className="p-1 rounded-3xl bg-gradient-to-br from-zinc-200/50 via-zinc-100/20 to-zinc-200/50 dark:from-zinc-800/40 dark:via-zinc-900/10 dark:to-zinc-800/40 shadow-2xl">
            <div className="rounded-[22px] bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl p-6 flex flex-col gap-6">
              <DragDropZone
                selectedFile={file}
                onFileSelect={handleFileSelect}
                onFileClear={handleFileClear}
              />

              <button
                onClick={handleGenerateRoom}
                disabled={!file}
                className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-md ${
                  file
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/10 hover:shadow-lg hover:shadow-violet-600/20 active:scale-[0.98]'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200/50 dark:border-zinc-800/50'
                }`}
              >
                <span>Generate Secure Room</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Transfers History Section */}
        {history && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-[22px] border border-zinc-200/50 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl p-6 shadow-xl text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-outfit font-bold text-base text-zinc-800 dark:text-zinc-200">
                  Recent Transfers
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs font-semibold text-red-500 hover:text-red-650 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                        item.role === 'sender' 
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' 
                          : 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400'
                      }`}>
                        {item.role === 'sender' ? 'Sent' : 'Recv'}
                      </div>
                      
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-xs font-bold text-zinc-500 dark:text-zinc-450 shrink-0">
                      {formatBytes(item.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
