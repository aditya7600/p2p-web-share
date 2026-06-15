import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import toast from 'react-hot-toast';
import {
  generateEncryptionKey,
  exportKeyToHex,
  importKeyFromHex,
  encryptChunk,
  decryptChunk,
  computeSHA256
} from '../utils/crypto';

const WebRTCContext = createContext();

const SIGNAL_SERVER_URL = 'https://p2p-web-share-backend-z370.onrender.com';
const CHUNK_SIZE = 64 * 1024; // 64KB chunks

export function WebRTCProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('IDLE'); // IDLE, WAITING, CONNECTING, CONNECTED, TRANSFERRING, COMPLETED, DISCONNECTED, ERROR
  const [errorType, setErrorType] = useState(null); // peer-disconnected, cancelled, connection-lost, expired, corruption
  const [errorMessage, setErrorMessage] = useState('');
  
  // File transfer states
  const [selectedFile, setSelectedFile] = useState(null); // Sender side
  const [fileInfo, setFileInfo] = useState(null); // Both sides
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [eta, setEta] = useState(0);
  const [role, setRole] = useState(null); // 'sender' or 'receiver'
  const [isReceiverAcceptPrompt, setIsReceiverAcceptPrompt] = useState(false);
  const [transferDuration, setTransferDuration] = useState(0);

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('p2p-transfer-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const addToHistory = (item) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 10);
      localStorage.setItem('p2p-transfer-history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('p2p-transfer-history');
    setHistory([]);
  };

  // Refs for tracking mutable WebRTC objects
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const fileChunksRef = useRef([]); // Receiver side chunks
  const currentChunkIndexRef = useRef(0); // Sender side index
  const cryptoKeyRef = useRef(null);
  const timerRef = useRef(null);
  const transferStartTimeRef = useRef(null);
  const isTransferringRef = useRef(false);

  // Refs to avoid stale closures in event listeners
  const fileInfoRef = useRef(null);
  const roleRef = useRef(null);
  const connectionStatusRef = useRef('IDLE');
  const selectedFileRef = useRef(null);
  const isReceiverAcceptPromptRef = useRef(false);

  useEffect(() => {
    fileInfoRef.current = fileInfo;
  }, [fileInfo]);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  useEffect(() => {
    isReceiverAcceptPromptRef.current = isReceiverAcceptPrompt;
  }, [isReceiverAcceptPrompt]);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SIGNAL_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      // If we are transferring, don't crash, try to wait for socket reconnect.
    });

    return () => {
      socketInstance.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Monitor transfer stats
  useEffect(() => {
    if (connectionStatus === 'TRANSFERRING') {
      if (!transferStartTimeRef.current) {
        transferStartTimeRef.current = Date.now() - (elapsedTime * 1000);
      }
      isTransferringRef.current = true;

      timerRef.current = setInterval(() => {
        const elapsed = Math.max(1, Math.floor((Date.now() - transferStartTimeRef.current) / 1000));
        setElapsedTime(elapsed);

        // Speed = bytes / seconds
        const currentBytes = bytesTransferred;
        const speed = currentBytes / elapsed;
        setTransferSpeed(speed);

        // ETA
        if (fileInfo && speed > 0) {
          const remainingBytes = fileInfo.size - currentBytes;
          setEta(remainingBytes / speed);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isTransferringRef.current = false;
      if (connectionStatus === 'COMPLETED' && elapsedTime > 0) {
        setTransferDuration(elapsedTime);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connectionStatus, bytesTransferred, fileInfo]);

  // Clean up Peer Connection
  const destroyPeer = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
  };

  // Reset all WebRTC states to initial
  const resetStates = () => {
    destroyPeer();
    setRoomId('');
    setConnectionStatus('IDLE');
    setErrorType(null);
    setErrorMessage('');
    setSelectedFile(null);
    setFileInfo(null);
    setBytesTransferred(0);
    setTransferSpeed(0);
    setElapsedTime(0);
    setEta(0);
    setRole(null);
    setIsReceiverAcceptPrompt(false);
    setTransferDuration(0);
    
    fileChunksRef.current = [];
    currentChunkIndexRef.current = 0;
    cryptoKeyRef.current = null;
    transferStartTimeRef.current = null;
    window.location.hash = '';
  };

  // Helper: setup WebRTC Event Listeners for simple-peer
  const setupPeerEvents = (peerInstance, currentRoomId) => {
    peerInstance.on('signal', (data) => {
      // Relay candidate/offer/answer to the server
      if (data.type === 'offer') {
        socketRef.current.emit('offer', { roomId: currentRoomId, sdp: data });
      } else if (data.type === 'answer') {
        socketRef.current.emit('answer', { roomId: currentRoomId, sdp: data });
      } else if (data.candidate) {
        socketRef.current.emit('candidate', { roomId: currentRoomId, candidate: data });
      }
    });

    peerInstance.on('connect', () => {
      console.log('WebRTC peer-to-peer data channel opened!');
      setConnectionStatus('CONNECTED');
      
      // If we are the receiver, handle initial transfer start or reconnection
      if (roleRef.current === 'receiver') {
        if (fileChunksRef.current.length > 0) {
          // Reconnection flow: resume from the last received chunk index
          const nextIndex = fileChunksRef.current.length;
          peerInstance.send(JSON.stringify({
            type: 'resume-request',
            nextChunkIndex: nextIndex
          }));
          setConnectionStatus('TRANSFERRING');
        } else if (!isReceiverAcceptPromptRef.current && fileInfoRef.current) {
          // The user accepted the file transfer before WebRTC was connected
          peerInstance.send(JSON.stringify({
            type: 'resume-request',
            nextChunkIndex: 0
          }));
          setConnectionStatus('TRANSFERRING');
        }
      }
    });

    peerInstance.on('data', async (data) => {
      // Check if data is control command (string)
      if (typeof data === 'string' || (data instanceof Uint8Array && data[0] === 123)) { // Check for JSON curly brace if received as Buffer
        try {
          const stringData = typeof data === 'string' ? data : new TextDecoder().decode(data);
          const message = JSON.parse(stringData);

          if (message.type === 'header') {
            console.log('Received file metadata:', message);
            setFileInfo(message);
            setIsReceiverAcceptPrompt(true);
          } else if (message.type === 'resume-request') {
            console.log(`Resuming file transfer from chunk index: ${message.nextChunkIndex}`);
            currentChunkIndexRef.current = message.nextChunkIndex;
            setConnectionStatus('TRANSFERRING');
            sendNextChunks();
          } else if (message.type === 'cancel') {
            setConnectionStatus('ERROR');
            setErrorType('cancelled');
            destroyPeer();
          }
        } catch (e) {
          console.error('Error parsing command message:', e);
        }
        return;
      }

      // Binary chunk data
      if (roleRef.current === 'receiver') {
        try {
          if (connectionStatusRef.current !== 'TRANSFERRING') {
            setConnectionStatus('TRANSFERRING');
          }

          // Handle array buffers from simple-peer
          const rawBuffer = data.buffer ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : data;
          
          // Decrypt chunk inline using the AES-GCM key
          const decryptedChunk = await decryptChunk(rawBuffer, cryptoKeyRef.current);
          
          fileChunksRef.current.push(decryptedChunk);
          const currentBytes = fileChunksRef.current.length * CHUNK_SIZE;
          setBytesTransferred(Math.min(currentBytes, fileInfoRef.current.size));

          // If all chunks received, trigger completion sequence
          if (fileChunksRef.current.length >= fileInfoRef.current.totalChunks) {
            verifyAndDownload();
          }
        } catch (err) {
          console.error('Decryption error or file corruption:', err);
          setConnectionStatus('ERROR');
          setErrorType('corruption');
          destroyPeer();
        }
      }
    });

    peerInstance.on('close', () => {
      console.log('WebRTC peer connection closed');
      if (connectionStatusRef.current !== 'COMPLETED' && connectionStatusRef.current !== 'ERROR') {
        setConnectionStatus('DISCONNECTED');
      }
    });

    peerInstance.on('error', (err) => {
      console.error('WebRTC peer error:', err);
      if (connectionStatusRef.current !== 'COMPLETED') {
        setConnectionStatus('ERROR');
        setErrorType('connection-lost');
      }
    });
  };

  // SENDER: Send file chunks with backpressure handling
  const sendNextChunks = () => {
    const peer = peerRef.current;
    if (!peer || connectionStatusRef.current === 'ERROR' || connectionStatusRef.current === 'COMPLETED') return;

    const channel = peer._channel || peer;
    // Set native backpressure threshold
    channel.bufferedAmountLowThreshold = 65536; // 64KB

    // Define listener
    const writeData = () => {
      const info = fileInfoRef.current;
      const file = selectedFileRef.current;
      if (!info || !file) return;

      const totalChunks = info.totalChunks;
      
      while (currentChunkIndexRef.current < totalChunks && channel.bufferedAmount < 1024 * 1024) {
        const index = currentChunkIndexRef.current;
        const start = index * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const slice = file.slice(start, end);
        
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
          try {
            const chunkBuffer = e.target.result;
            // Encrypt using E2EE AES-GCM
            const encrypted = await encryptChunk(chunkBuffer, cryptoKeyRef.current);
            
            // Check if peer is still connected before sending
            if (peerRef.current) {
              peerRef.current.send(encrypted);
              
              currentChunkIndexRef.current++;
              const bytesSent = Math.min(currentChunkIndexRef.current * CHUNK_SIZE, file.size);
              setBytesTransferred(bytesSent);

              if (currentChunkIndexRef.current >= totalChunks) {
                setConnectionStatus('COMPLETED');
                addToHistory({
                  id: Math.random().toString(36).substring(2, 9),
                  name: info.name,
                  size: info.size,
                  role: 'sender',
                  timestamp: Date.now()
                });
              } else {
                // Keep reading next chunks
                writeData();
              }
            }
          } catch (err) {
            console.error('Error sending file chunk:', err);
            setConnectionStatus('ERROR');
            setErrorType('connection-lost');
          }
        };
        fileReader.readAsArrayBuffer(slice);
        // Break loop, wait for reader callback to trigger writeData again or bufferedamountlow
        break;
      }
    };

    // Attach handler
    channel.onbufferedamountlow = () => {
      writeData();
    };

    // Start sending
    writeData();
  };

  // RECEIVER: Reconstruct, decrypt, check hash, and download
  const verifyAndDownload = async () => {
    setConnectionStatus('COMPLETED');
    const info = fileInfoRef.current;
    if (!info) return;

    addToHistory({
      id: Math.random().toString(36).substring(2, 9),
      name: info.name,
      size: info.size,
      role: 'receiver',
      timestamp: Date.now()
    });
    try {
      // Reconstruct file Blob from decrypted chunks
      const fileBlob = new Blob(fileChunksRef.current, { type: info.mimeType });
      
      // Verify SHA-256 checksum
      const calculatedHash = await computeSHA256(fileBlob);
      if (calculatedHash !== info.sha256) {
    setConnectionStatus('ERROR');
    setErrorType('corruption');
    return;
      }

      console.log('SHA-256 hash verified successfully!');
      
      // Auto download
      triggerBlobDownload(fileBlob, info.name);
    } catch (err) {
      console.error('Error during file verification:', err);
      setConnectionStatus('ERROR');
      setErrorType('corruption');
    }
  };

  const triggerBlobDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // SENDER: Create a Room
  const createRoom = async (file) => {
    if (!socketRef.current) {
      toast.error('Signaling server unavailable. Try again later.');
      return;
    }

    try {
      setRole('sender');
      setSelectedFile(file);
      setConnectionStatus('CONNECTING');

      // 1. Generate SHA-256 on original file
      toast.loading('Computing file hash...', { id: 'hash-toast' });
      const sha256 = await computeSHA256(file);
      toast.dismiss('hash-toast');

      // 2. Generate AES-GCM Key
      const key = await generateEncryptionKey();
      cryptoKeyRef.current = key;
      const hexKey = await exportKeyToHex(key);

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const fileMetadata = {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        totalChunks,
        sha256
      };
      setFileInfo(fileMetadata);

      // 3. Emit create-room to server
      socketRef.current.emit('create-room', fileMetadata, ({ success, roomId, error }) => {
        if (success) {
          setRoomId(roomId);
          setConnectionStatus('WAITING');
          
          // 4. Set encryption key in URL hash (E2EE)
          window.location.hash = hexKey;
          
          // 5. Initialize WebRTC Signaling Handlers
          setupSocketSignaling(roomId);
        } else {
          setConnectionStatus('ERROR');
          setErrorMessage(error || 'Failed to create room.');
          toast.error(error || 'Room creation failed.');
        }
      });
    } catch (e) {
      console.error(e);
      toast.dismiss('hash-toast');
      setConnectionStatus('ERROR');
      setErrorMessage(e.message);
    }
  };

  // RECEIVER: Join a Room
  const joinRoom = async (targetRoomId, hexKey) => {
    if (!socketRef.current) {
      toast.error('Signaling server unavailable.');
      return;
    }

    try {
      setRole('receiver');
      setRoomId(targetRoomId);
      setConnectionStatus('CONNECTING');

      // 1. Import Key from URL hash
      const key = await importKeyFromHex(hexKey);
      cryptoKeyRef.current = key;

      // 2. Join the room on server
      socketRef.current.emit('join-room', targetRoomId, ({ success, fileInfo: meta, senderConnected, error }) => {
        if (success) {
          setFileInfo(meta);
          setIsReceiverAcceptPrompt(true);
          
          // 3. Setup signaling
          setupSocketSignaling(targetRoomId);

          if (senderConnected) {
            // Initiate WebRTC peer creation from initiator (Sender) side.
            // Receiver joins and waits for the offer.
            console.log('Sender is online. Ready to establish connection.');
          }
        } else {
          setConnectionStatus('ERROR');
          setErrorType('expired');
          setErrorMessage(error || 'Failed to join room.');
        }
      });
    } catch (e) {
      console.error(e);
      setConnectionStatus('ERROR');
      setErrorMessage(e.message);
    }
  };

  // Setup Socket signaling handlers for WebRTC
  const setupSocketSignaling = (currentRoomId) => {
    const s = socketRef.current;
    if (!s) return;

    // Remove any existing listeners first
    s.off('receiver-joined');
    s.off('offer');
    s.off('answer');
    s.off('candidate');
    s.off('peer-disconnected');

    // SENDER SIDE: Receiver joined -> Create Initiator Peer
    s.on('receiver-joined', () => {
      console.log('Receiver joined room. Creating WebRTC Initiator...');
      setConnectionStatus('CONNECTING');
      
      destroyPeer();

      const PeerConstructor = SimplePeer.default || SimplePeer;
      const p = new PeerConstructor({
        initiator: true,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19002' },
            { urls: 'stun:stun1.l.google.com:19002' },
            { urls: 'stun:stun2.l.google.com:19002' }
          ]
        }
      });

      peerRef.current = p;
      setupPeerEvents(p, currentRoomId);
    });

    // RECEIVER SIDE: Receive Offer -> Create Non-Initiator Peer
    s.on('offer', ({ sdp }) => {
      console.log('Received WebRTC offer. Creating WebRTC Receiver...');
      setConnectionStatus('CONNECTING');

      destroyPeer();

      const PeerConstructor = SimplePeer.default || SimplePeer;
      const p = new PeerConstructor({
        initiator: false,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19002' },
            { urls: 'stun:stun1.l.google.com:19002' },
            { urls: 'stun:stun2.l.google.com:19002' }
          ]
        }
      });

      peerRef.current = p;
      setupPeerEvents(p, currentRoomId);
      p.signal(sdp);
    });

    // SENDER SIDE: Receive Answer
    s.on('answer', ({ sdp }) => {
      console.log('Received WebRTC answer');
      if (peerRef.current) {
        peerRef.current.signal(sdp);
      }
    });

    // BOTH SIDES: Receive ICE Candidate
    s.on('candidate', ({ candidate }) => {
      if (peerRef.current) {
        peerRef.current.signal(candidate);
      }
    });

    // BOTH SIDES: Disconnect handling
    s.on('peer-disconnected', () => {
      console.log('Signaling server notified: Peer disconnected');
      
      // If we completed, we don't care about disconnect
      if (connectionStatusRef.current === 'COMPLETED') return;

      toast.error('Peer disconnected. Waiting for reconnect...', { id: 'peer-dc' });
      setConnectionStatus('DISCONNECTED');
      destroyPeer();
    });
  };

  // Action: Accept Transfer (Called by Receiver)
  const acceptTransfer = () => {
    setIsReceiverAcceptPrompt(false);
    
    // Send Header file metadata back to sender to open the channel if connected
    if (peerRef.current && peerRef.current.connected) {
      setConnectionStatus('TRANSFERRING');
      peerRef.current.send(JSON.stringify({ type: 'resume-request', nextChunkIndex: 0 }));
    } else {
      // If WebRTC is not fully connected yet, wait for 'connect' event
      setConnectionStatus('CONNECTING');
    }
  };

  // Action: Cancel Transfer (Called by either side)
  const cancelTransfer = () => {
    if (peerRef.current && peerRef.current.connected) {
      try {
        peerRef.current.send(JSON.stringify({ type: 'cancel' }));
      } catch (e) {}
    }
    
    setConnectionStatus('ERROR');
    setErrorType('cancelled');
    destroyPeer();
  };

  // Action: Reconnect / Resume transfer (called when trying to recover a disconnected channel)
  const reconnectTransfer = () => {
    if (!roomId) return;
    
    const hexKey = window.location.hash.replace('#', '');
    if (roleRef.current === 'sender') {
      setConnectionStatus('CONNECTING');
      socketRef.current.emit('reconnect-room', { roomId, role: 'sender' }, ({ success, receiverConnected, error }) => {
        if (success) {
          setupSocketSignaling(roomId);
          if (receiverConnected) {
            console.log('Receiver is online. Initiating WebRTC connection...');
            destroyPeer();
            
            const PeerConstructor = SimplePeer.default || SimplePeer;
            const p = new PeerConstructor({
              initiator: true,
              trickle: true,
              config: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19002' },
                  { urls: 'stun:stun1.l.google.com:19002' },
                  { urls: 'stun:stun2.l.google.com:19002' }
                ]
              }
            });

            peerRef.current = p;
            setupPeerEvents(p, roomId);
          } else {
            setConnectionStatus('WAITING');
          }
        } else {
          setConnectionStatus('ERROR');
          setErrorType('expired');
          setErrorMessage(error || 'Failed to reconnect room.');
        }
      });
    } else {
      setConnectionStatus('CONNECTING');
      socketRef.current.emit('reconnect-room', { roomId, role: 'receiver' }, ({ success, senderConnected, error }) => {
        if (success) {
          setupSocketSignaling(roomId);
          if (senderConnected) {
            console.log('Sender is online. Waiting for WebRTC connection...');
          }
        } else {
          // Fallback to joinRoom if reconnect fails
          joinRoom(roomId, hexKey);
        }
      });
    }
  };

  const downloadFileAgain = () => {
    const info = fileInfoRef.current;
    if (roleRef.current === 'receiver' && fileChunksRef.current.length > 0 && info) {
      const fileBlob = new Blob(fileChunksRef.current, { type: info.mimeType });
      triggerBlobDownload(fileBlob, info.name);
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        roomId,
        connectionStatus,
        errorType,
        errorMessage,
        selectedFile,
        fileInfo,
        bytesTransferred,
        transferSpeed,
        elapsedTime,
        eta,
        role,
        isReceiverAcceptPrompt,
        transferDuration,
        createRoom,
        joinRoom,
        acceptTransfer,
        cancelTransfer,
        reconnectTransfer,
        resetStates,
        downloadFileAgain,
        history,
        clearHistory
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
}
