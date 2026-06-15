window.process = {
  env: {},
  nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0)
};
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Polyfill Buffer for WebRTC simple-peer library in Vite browser environment
import { Buffer } from 'buffer'
window.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
