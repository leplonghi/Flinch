
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-brand-black/90 backdrop-blur-md z-[200]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-6 z-[201] pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-brand-surface border-2 border-brand-white/10 w-full max-w-sm rounded-[2.5rem] p-8 pointer-events-auto"
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                   <span className="text-brand-black text-3xl font-black italic">F</span>
                </div>
                <h2 className="text-3xl font-black font-heading tracking-tighter italic">CLAIM YOUR IDENTITY</h2>
                <p className="text-brand-white/40 text-sm mt-2">Save your runs and climb the global ranks.</p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => login('google')}
                  className="w-full h-16 flex items-center justify-center gap-3"
                  variant="secondary"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>LOG IN WITH GOOGLE</span>
                </Button>
                
                <Button 
                  onClick={() => login('email')}
                  className="w-full h-16"
                  variant="ghost"
                >
                  USE EMAIL ADDRESS
                </Button>
              </div>

              <button 
                onClick={closeAuthModal}
                className="w-full text-center text-[10px] font-black tracking-widest text-brand-white/20 hover:text-brand-white/60 mt-8 transition-colors"
              >
                CONTINUE AS GUEST
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
