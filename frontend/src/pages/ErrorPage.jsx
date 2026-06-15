import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../context/WebRTCContext';
import ErrorCard from '../components/ErrorCard';

export default function ErrorPage() {
  const {
    role,
    roomId,
    errorType,
    errorMessage,
    reconnectTransfer,
    resetStates
  } = useWebRTC();

  const navigate = useNavigate();

  const handleReset = () => {
    resetStates();
    navigate('/');
  };

  const handleRetry = () => {
    reconnectTransfer();
    if (role === 'sender') {
      navigate('/sender' + window.location.hash);
    } else if (role === 'receiver' && roomId) {
      navigate(`/room/${roomId}${window.location.hash}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-600/5 dark:bg-red-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <ErrorCard
          errorType={errorType || 'unknown'}
          message={errorMessage}
          onRetry={handleRetry}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
