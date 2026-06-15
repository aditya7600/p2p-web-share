import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { WebRTCProvider } from './context/WebRTCContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SenderPage from './pages/SenderPage';
import ReceiverPage from './pages/ReceiverPage';
import SuccessPage from './pages/SuccessPage';
import ErrorPage from './pages/ErrorPage';

export default function App() {
  return (
    <ThemeProvider>
      <WebRTCProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#0a0a0c] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
            {/* Background animated mesh grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-overlay dark:mix-blend-normal">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <Navbar />
            
            <main className="flex-grow z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sender" element={<SenderPage />} />
                <Route path="/room/:roomId" element={<ReceiverPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/error" element={<ErrorPage />} />
              </Routes>
            </main>
            
            <Footer />
            
            <Toaster 
              position="bottom-center"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '16px',
                  background: '#18181b',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  padding: '12px 18px',
                }
              }}
            />
          </div>
        </Router>
      </WebRTCProvider>
    </ThemeProvider>
  );
}
