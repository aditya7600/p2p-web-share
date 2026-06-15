import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../context/WebRTCContext';
import FileCard from '../components/FileCard';
import ConnectionStatus from '../components/ConnectionStatus';
import ProgressBar from '../components/ProgressBar';
import CircularProgress from '../components/CircularProgress';
import TransferStats from '../components/TransferStats';
import { Ban, ShieldAlert, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReceiverPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const {
    connectionStatus,
    fileInfo,
    bytesTransferred,
    transferSpeed,
    elapsedTime,
    eta,
    isReceiverAcceptPrompt,
    joinRoom,
    acceptTransfer,
    cancelTransfer,
    reconnectTransfer,
    resetStates
  } = useWebRTC();

  // Parse key from hash on mount
  useEffect(() => {
    const hexKey = window.location.hash.replace('#', '');
    if (roomId && hexKey) {
      joinRoom(roomId, hexKey);
    } else {
      // Missing required information
      navigate('/error');
    }
  }, [roomId, navigate]);

  // Navigate to Success or Error pages based on status changes, preserving key hash
  useEffect(() => {
    if (connectionStatus === 'COMPLETED') {
      navigate('/success' + window.location.hash);
    } else if (connectionStatus === 'ERROR') {
      navigate('/error' + window.location.hash);
    }
  }, [connectionStatus, navigate]);

  const handleBackToHome = () => {
    resetStates();
    navigate('/');
  };

  const isConnectingOrWaiting = connectionStatus === 'CONNECTING' || connectionStatus === 'WAITING';

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-fuchsia-600/5 dark:bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="text-center">
          <h2 className="font-outfit font-black text-2xl text-zinc-900 dark:text-white tracking-tight">
            Receiver Room
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Establishing secure peer-to-peer data tunnel.
          </p>
        </div>

        {/* Loading Signaling State */}
        {isConnectingOrWaiting && !fileInfo && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-10 w-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Connecting to sender...</p>
          </div>
        )}

        {/* File Metadata Card */}
        {fileInfo && <FileCard name={fileInfo.name} size={fileInfo.size} type={fileInfo.mimeType} />}

        {/* State 1: Accept Transfer Prompt */}
        {isReceiverAcceptPrompt && fileInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/40 text-center">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Incoming File Transfer
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">
                A browser wants to share this file directly with you. Accept to start E2EE transfer.
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={cancelTransfer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-semibold active:scale-[0.98] transition-all"
              >
                <X className="h-4.5 w-4.5" />
                <span>Decline</span>
              </button>
              
              <button
                onClick={acceptTransfer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md active:scale-[0.98] transition-all"
              >
                <Download className="h-4.5 w-4.5" />
                <span>Accept</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* State 2: Actively Receiving / Connecting */}
        {!isReceiverAcceptPrompt && fileInfo && 
          (connectionStatus === 'CONNECTING' || 
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

        {/* State 3: Disconnected */}
        {connectionStatus === 'DISCONNECTED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5 text-center"
          >
            <div className="p-6 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl bg-amber-500/5 text-amber-500">
              <ShieldAlert className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-outfit font-bold text-lg">Transfer Interrupted</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                The sender disconnected. Try reconnecting if they are still online.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={reconnectTransfer}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all active:scale-[0.98]"
              >
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
