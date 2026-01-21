
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'info' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const colors = {
    success: 'bg-brand-accent text-brand-black shadow-[0_10px_40px_rgba(204,255,0,0.4)]',
    error: 'bg-brand-danger text-brand-white shadow-[0_10px_40px_rgba(255,51,51,0.4)]',
    info: 'bg-white text-brand-black shadow-[0_10px_40px_rgba(255,255,255,0.2)]'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-12 left-0 right-0 z-[300] flex justify-center px-6 pointer-events-none">
          <motion.div
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`px-8 py-4 rounded-[2rem] font-black italic uppercase tracking-tighter text-sm pointer-events-auto ${colors[type]}`}
          >
            {message}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
