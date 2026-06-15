import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../context/WebRTCContext';
import FileCard from '../components/FileCard';
import ConnectionStatus from '../components/ConnectionStatus';
import ProgressBar from '../components/ProgressBar';
import CircularProgress from '../components/CircularProgress';
import TransferStats from '../components/TransferStats';
import CopyLinkButton from '../components/CopyLinkButton';
import QRButton from '../components/QRButton';
import { Ban, RefreshCw, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SenderPage() {
  const {
    roomId,
    connectionStatus,
    fileInfo,
    bytesTransferred,
    transferSpeed,
    elapsedTime,
    eta,
    cancelTransfer,
    reconnectTransfer,
    resetStates
  } = useWebRTC();

  const navigate = useNavigate();

  // Generate shareable link
  const shareUrl = `${window.location.origin}/room/${roomId}${window.location.hash}`;

  // Redirect to success or error page once status changes, preserving key hash
  useEffect(() => {
    if (connectionStatus === 'COMPLETED') {
      navigate('/success' + window.location.hash);
    } else if (connectionStatus === 'ERROR') {
      navigate('/error' + window.location.hash);
    }
  }, [connectionStatus, navigate]);

  // Back to home helper
  const handleBackToHome = () => {
    resetStates();
    navigate('/');
  };

  // Prevent accessing sender page if no active room is established
  if (!roomId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">No active transfer session found.</p>
          <button 
            onClick={handleBackToHome}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="text-center">
          <h2 className="font-outfit font-black text-2xl text-zinc-900 dark:text-white tracking-tight">
            Sender Room
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Keep this tab open while transfer completes.
          </p>
        </div>

        {/* File Metadata Card */}
        {fileInfo && <FileCard name={fileInfo.name} size={fileInfo.size} type={fileInfo.mimeType} />}

        {/* State 1: Waiting for Receiver Connection */}
        {connectionStatus === 'WAITING' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5 text-center mt-2"
          >
            {/* Share Link box */}
            <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/40">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Shareable Link
              </label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-600 dark:text-zinc-300 font-mono select-all truncate">
                  {shareUrl}
                </div>
                <QRButton value={shareUrl} />
              </div>
            </div>

            <div className="flex gap-3">
              <CopyLinkButton value={shareUrl} />
            </div>

            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/20 mt-2">
              <Radio className="h-6 w-6 text-violet-500 animate-pulse mb-3" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Waiting for receiver...
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Open the link in another device to connect.
              </p>
            </div>
          </motion.div>
        )}

        {/* State 2: Connecting / Connected / Transferring */}
        {(connectionStatus === 'CONNECTING' || 
          connectionStatus === 'CONNECTED' || 
          connectionStatus === 'TRANSFERRING') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            <ConnectionStatus status={connectionStatus} />

            {connectionStatus === 'TRANSFERRING' && (
              <div className="flex flex-col items-center gap-6 p-5 border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/20 dark:bg-zinc-950/20 rounded-2xl mt-1">
                <CircularProgress progress={(bytesTransferred / fileInfo.size) * 100} size={130} />
                <ProgressBar progress={(bytesTransferred / fileInfo.size) * 100} />
                <TransferStats
                  bytesTransferred={bytesTransferred}
                  totalBytes={fileInfo.size}
                  speed={transferSpeed}
                  elapsedTime={elapsedTime}
                  eta={eta}
                />
              </div>
            )}

            <button
              onClick={cancelTransfer}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-red-500/20 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-semibold active:scale-[0.98] transition-all"
            >
              <Ban className="h-5 w-5" />
              <span>Cancel Transfer</span>
            </button>
          </motion.div>
        )}

        {/* State 3: Disconnected / Lost (Show reconnect inline) */}
        {connectionStatus === 'DISCONNECTED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5 text-center mt-2"
          >
            <div className="p-6 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-amber-500/5 text-amber-500">
              <RefreshCw className="h-8 w-8 animate-spin-slow mx-auto mb-3" />
              <h3 className="font-outfit font-bold text-lg">Connection Lost</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                The peer connection dropped. You can attempt to reconnect if they reopen their session.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={reconnectTransfer}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Reconnecting</span>
              </button>
              
              <button
                onClick={handleBackToHome}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold transition-all"
              >
                Cancel & Exit
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
