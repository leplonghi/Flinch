
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import DebugOverlay from '../UI/DebugOverlay';
import { motion, AnimatePresence } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const isFullScreenMode = 
    location.pathname.startsWith('/run') || 
    location.pathname.startsWith('/replay') ||
    location.pathname.startsWith('/share');

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-brand-black shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden border-x border-white/5">
      <AnimatePresence mode="wait">
        {!isFullScreenMode && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            key="header"
            className="z-50"
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`flex-1 overflow-y-auto scrollbar-hide ${!isFullScreenMode ? 'pb-28 px-6 pt-2' : ''}`}>
        {children}
      </main>

      <DebugOverlay />

      <AnimatePresence mode="wait">
        {!isFullScreenMode && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            key="nav"
            className="z-50"
          >
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global Grain/Noise Overlay for Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-[60]" />
    </div>
  );
};

export default AppShell;
