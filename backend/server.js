import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok', uptime: process.uptime() });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory room storage
// roomId -> { senderId, receiverId, fileInfo, createdAt, disconnectTimeout }
const rooms = new Map();

// Helper to generate a room ID (ABCD1234 format)
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  if (rooms.has(result)) {
    return generateRoomId();
  }
  return result;
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Create Room (called by Sender)
  socket.on('create-room', (fileInfo, callback) => {
    try {
      const roomId = generateRoomId();
      rooms.set(roomId, {
        senderId: socket.id,
        receiverId: null,
        fileInfo, // Store metadata (filename, size, type, totalChunks, sha256)
        createdAt: Date.now(),
        disconnectTimeout: null
      });

      socket.join(roomId);
      console.log(`Room created: ${roomId} by sender: ${socket.id}`);
      
      if (typeof callback === 'function') {
        callback({ success: true, roomId });
      }
    } catch (error) {
      console.error('Error in create-room:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // 2. Join Room (called by Receiver)
  socket.on('join-room', (roomId, callback) => {
    try {
      const room = rooms.get(roomId);
      
      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room not found or expired' });
        }
        return;
      }

      // Check if there is already a receiver
      if (room.receiverId && room.receiverId !== socket.id) {
        // If the receiver socket is active, don't allow a new one
        const activeSockets = io.sockets.adapter.rooms.get(roomId);
        if (activeSockets && activeSockets.has(room.receiverId)) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'Room is full' });
          }
          return;
        }
      }

      // Cancel any disconnect timeout if it was running (reconnection case)
      if (room.disconnectTimeout) {
        clearTimeout(room.disconnectTimeout);
        room.disconnectTimeout = null;
      }

      // Assign or update receiver ID
      room.receiverId = socket.id;
      socket.join(roomId);
      console.log(`Receiver ${socket.id} joined room ${roomId}`);

      // Notify the sender that receiver has joined
      socket.to(room.senderId).emit('receiver-joined', {
        socketId: socket.id
      });

      if (typeof callback === 'function') {
        callback({ 
          success: true, 
          fileInfo: room.fileInfo,
          senderConnected: io.sockets.adapter.rooms.get(roomId)?.has(room.senderId) || false
        });
      }
    } catch (error) {
      console.error('Error in join-room:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // 3. WebRTC Signal Relay: Offer (Sender -> Receiver)
  socket.on('offer', ({ roomId, sdp }) => {
    const room = rooms.get(roomId);
    if (room && room.receiverId) {
      io.to(room.receiverId).emit('offer', { sdp });
    }
  });

  // 4. WebRTC Signal Relay: Answer (Receiver -> Sender)
  socket.on('answer', ({ roomId, sdp }) => {
    const room = rooms.get(roomId);
    if (room && room.senderId) {
      io.to(room.senderId).emit('answer', { sdp });
    }
  });

  // 5. WebRTC Signal Relay: ICE Candidate (Both ways)
  socket.on('candidate', ({ roomId, candidate }) => {
    const room = rooms.get(roomId);
    if (room) {
      // Send to the other peer in the room
      const targetId = socket.id === room.senderId ? room.receiverId : room.senderId;
      if (targetId) {
        io.to(targetId).emit('candidate', { candidate });
      }
    }
  });

  // 5.5 Reconnect Room (called by Sender or Receiver to update their socket ID after reconnect)
  socket.on('reconnect-room', ({ roomId, role }, callback) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room not found or expired' });
        }
        return;
      }

      // Cancel disconnect timeout
      if (room.disconnectTimeout) {
        clearTimeout(room.disconnectTimeout);
        room.disconnectTimeout = null;
      }

      const activeSockets = io.sockets.adapter.rooms.get(roomId);

      if (role === 'sender') {
        room.senderId = socket.id;
        socket.join(roomId);
        console.log(`Sender reconnected: ${socket.id} for room ${roomId}`);
        
        const receiverConnected = room.receiverId ? (activeSockets?.has(room.receiverId) || false) : false;

        if (typeof callback === 'function') {
          callback({ 
            success: true, 
            receiverConnected,
            fileInfo: room.fileInfo
          });
        }
      } else if (role === 'receiver') {
        room.receiverId = socket.id;
        socket.join(roomId);
        console.log(`Receiver reconnected: ${socket.id} for room ${roomId}`);

        const senderConnected = room.senderId ? (activeSockets?.has(room.senderId) || false) : false;

        if (typeof callback === 'function') {
          callback({ 
            success: true, 
            senderConnected,
            fileInfo: room.fileInfo
          });
        }
        
        // Notify sender that receiver has reconnected so they can initiate a new peer connection
        if (senderConnected) {
          socket.to(room.senderId).emit('receiver-joined', { socketId: socket.id });
        }
      }
    } catch (error) {
      console.error('Error in reconnect-room:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });

  // 6. Handle Disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    // Find rooms associated with this socket
    for (const [roomId, room] of rooms.entries()) {
      if (room.senderId === socket.id || room.receiverId === socket.id) {
        const isSender = room.senderId === socket.id;
        const otherPeerId = isSender ? room.receiverId : room.senderId;

        console.log(`Peer ${isSender ? 'sender' : 'receiver'} disconnected from room ${roomId}`);

        // Notify the remaining peer if connected
        if (otherPeerId) {
          io.to(otherPeerId).emit('peer-disconnected', {
            role: isSender ? 'sender' : 'receiver'
          });
        }

        // Set a grace period of 30 seconds before cleaning up the room.
        // This allows the disconnected peer to reconnect and resume the transfer.
        if (room.disconnectTimeout) {
          clearTimeout(room.disconnectTimeout);
        }

        room.disconnectTimeout = setTimeout(() => {
          console.log(`Grace period expired. Cleaning up room: ${roomId}`);
          rooms.delete(roomId);
        }, 120000); // 30 seconds grace period
        
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
