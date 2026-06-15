import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../context/WebRTCContext';
import SuccessCard from '../components/SuccessCard';

export default function SuccessPage() {
  const {
    fileInfo,
    transferDuration,
    role,
    downloadFileAgain,
    resetStates
  } = useWebRTC();

  const navigate = useNavigate();

  const handleReset = () => {
    resetStates();
    navigate('/');
  };

  // Prevent accessing success page if there was no active file info
  useEffect(() => {
    if (!fileInfo) {
      navigate('/');
    }
  }, [fileInfo, navigate]);

  if (!fileInfo) return null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-600/5 dark:bg-emerald-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <SuccessCard
          fileName={fileInfo.name}
          fileSize={fileInfo.size}
          duration={transferDuration}
          sha256={fileInfo.sha256}
          onDownload={downloadFileAgain}
          onReset={handleReset}
          isReceiver={role === 'receiver'}
        />
      </div>
    </div>
  );
}
