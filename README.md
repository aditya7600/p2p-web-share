# P2P Web Share

A production-quality, high-performance, and secure peer-to-peer file transfer web application. It streams files directly between browsers using **WebRTC DataChannels**, ensuring complete privacy by keeping files out of cloud storage or any third-party servers.

---

## Features

- **Direct P2P Transfers:** Direct streaming from browser-to-browser with no server intermediaries.
- **End-to-End Encryption (E2EE):** Encrypted using AES-GCM (256-bit keys) via the Web Crypto API. Keys are generated client-side, embedded in the URL hash, and never sent to the signaling server.
- **Integrity Verification:** Uses cryptographic SHA-256 validation to confirm the reconstructed file matches the source checksum.
- **Resumable Transfers:** Supports recovery from temporary disconnections; the receiver requests resumption starting from the last successfully received block.
- **Backpressure Control:** Fine-tuned native WebRTC backpressure check preventing memory-overflow issues for files up to 500MB.
- **Modern Glassmorphic Dark UI:** A fluid user interface with premium colors, gradients, and micro-animations built using Tailwind CSS, Framer Motion, and Lucide React.
- **QR Code Sharing:** Generate and scan QR codes for room links to share files between desktops and mobile devices instantly.
- **Cross-Platform Compatibility:** Responsive layout that functions on desktop, tablet, and mobile browsers.

---

## Architecture

P2P Web Share uses a **zero-knowledge signaling architecture**:

```
[ Sender Browser ]  <--- (Socket.io Signaling SDP/ICE) --->  [ Node.js Backend ]
        |                                                            ^
        |                                                            |
        +======== (Direct WebRTC Encrypted DataChannel) =============+
        |                                                            |
        v                                                            v
[ Sender File ] ===(AES-GCM E2EE)===> [Chunks] ===> [Decrypted] ===> [ Receiver Download ]
```

1. **Signaling Server:** Relays WebRTC session descriptions (SDP offers/answers) and ICE connection candidates. It maintains room states but *never* processes file bytes.
2. **URL Cryptography:** The share URL format is `http://<domain>/room/<roomId>#<hex_key>`. The browser hash (`#<hex_key>`) is strictly local, protecting encryption keys from being transmitted over the wire to servers.
3. **WebRTC Data Channel:** Encrypted chunks of `64KB` size are streamed over a reliable RTCDataChannel with backpressure flow checks.

---

## Folder Structure

```
p2p-web-share/
├── backend/
│   ├── package.json
│   └── server.js                   # Node + Express + Socket.io signaling
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                # Entry point & Buffer polyfills
│       ├── App.jsx                 # Routing and layout setup
│       ├── index.css               # Global styling directives
│       ├── components/
│       │   ├── Navbar.jsx          # Top navigation & theme controls
│       │   ├── Footer.jsx          # Info footer
│       │   ├── DragDropZone.jsx    # React Dropzone wrapper
│       │   ├── ProgressBar.jsx     # Horizontal progress tracker
│       │   ├── CircularProgress.jsx# Circular dashboard ring
│       │   ├── TransferStats.jsx   # Speed, ETA, and progress stats
│       │   ├── ConnectionStatus.jsx# WebRTC connection status indicator
│       │   ├── SuccessCard.jsx     # Successful transfer summary
│       │   ├── ErrorCard.jsx       # Error and retry configuration
│       │   ├── FileCard.jsx        # File metadata card with generic icons
│       │   ├── CopyLinkButton.jsx  # Clipboard utility
│       │   └── QRButton.jsx        # QR overlay generator modal
│       ├── pages/
│       │   ├── Home.jsx            # Hero page for selecting files
│       │   ├── SenderPage.jsx      # Sender transfer controls dashboard
│       │   ├── ReceiverPage.jsx    # Receiver accept & transfer tracking
│       │   ├── SuccessPage.jsx     # Post-transfer download triggers
│       │   └── ErrorPage.jsx       # Network status reporting pages
│       ├── context/
│       │   ├── ThemeContext.jsx    # Persistent Theme toggles
│       │   └── WebRTCContext.jsx   # State machine & signaling engine
│       └── utils/
│           └── crypto.js           # E2EE (AES-GCM) & hashing (SHA-256)
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone & Set Up Projects

Create the workspace directory structure and download dependencies.

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd ../frontend
npm install
```

---

## Running Locally

### 1. Run Backend Server
From the `backend/` directory:
```bash
npm run dev
# Starts server on http://localhost:5000
```

### 2. Run Frontend Web App
From the `frontend/` directory:
```bash
npm run dev
# Starts Vite server on http://localhost:5173
```

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to Test Transfer

1. Open [http://localhost:5173](http://localhost:5173) in Browser A (Sender).
2. Drag and drop any file (up to 500MB) and click **Generate Secure Room**.
3. Copy the generated room URL.
4. Open the link in Browser B (Receiver) or scan the QR code using a mobile device connected to the same network.
5. Click **Accept** on Browser B to start streaming chunks directly between the two browser tabs.
6. The transfer completes, validates the SHA-256 hash, and triggers a local file download.

---

## Future Improvements

1. **TURN Server Integration:** Setup Coturn server connections in `iceServers` configuration to support NAT-traversal across restricted firewall networks.
2. **Multi-File Sharing:** Pack multiple files into a virtual stream or zip wrapper client-side.
3. **P2P Text Chat:** Add a collaborative message chat stream in the data channel.
4. **Offline Transfer History:** Save receipt confirmations in indexedDB local logs.

---

## License

MIT License. Feel free to use and adapt this project for your needs!

# Secure Browser-to-Browser File Sharing Platform

A secure peer-to-peer file transfer application built using **React, Node.js, Socket.io, and WebRTC**. The system enables direct browser-to-browser file sharing with end-to-end encryption and integrity verification.

---

## Features

* Browser-to-Browser file transfer using WebRTC
* Socket.io based signaling server
* AES-GCM end-to-end encryption
* SHA-256 file integrity verification
* Chunk-based file transfer (64 KB chunks)
* Resume support after disconnection
* Progress tracking
* Transfer speed and ETA estimation
* QR code room sharing
* Transfer history
* Dark mode UI
* Error handling and reconnect support

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* Socket.io

### Security

* Web Crypto API
* AES-GCM Encryption
* SHA-256 Hashing

### Communication

* WebRTC
* Simple-Peer

---

## Architecture

Sender Browser
↓
Socket.io Signaling Server
↓
Receiver Browser

Peer-to-Peer WebRTC Data Channel

---

## Project Structure

```
P2P-WebShare
│
├── backend
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   └── utils
│   └── package.json
│
└── README.md
```

---

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## GitHub Repository

https://github.com/aditya7600/p2p-web-share

---

## Backend Deployment

https://p2p-web-share-backend-z370.onrender.com

---

## Future Improvements

* TURN server support
* Multiple file transfer
* Drag and drop folders
* File compression
* Mobile optimization



