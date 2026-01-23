import React, { Suspense, lazy, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from './components/Layout/AppShell';
import { AuthProvider } from './contexts/AuthContext';
import { MotionProvider } from './contexts/MotionContext';
import { GameProvider } from './contexts/GameContext';
import AuthModal from './components/Auth/AuthModal';
import { Tutorial } from './components/Tutorial';

// Lazy load pages
const PlayPage = lazy(() => import('./pages/PlayPage'));
const RankPage = lazy(() => import('./pages/RankPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const ReplayPage = lazy(() => import('./pages/ReplayPage'));
const SharePage = lazy(() => import('./pages/SharePage'));

const MotionDiv = motion.div as any;

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MotionDiv
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    className="h-full"
  >
    {children}
  </MotionDiv>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/play" element={<PageWrapper><PlayPage /></PageWrapper>} />
        <Route path="/rank" element={<PageWrapper><RankPage /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/run/:id" element={<PageWrapper><GamePage /></PageWrapper>} />
        <Route path="/result/:runId" element={<PageWrapper><ResultPage /></PageWrapper>} />
        <Route path="/replay/:runId" element={<PageWrapper><ReplayPage /></PageWrapper>} />
        <Route path="/share/:runId" element={<PageWrapper><SharePage /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/play" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('flinch_tutorial_completed');
  });

  const handleTutorialComplete = () => {
    localStorage.setItem('flinch_tutorial_completed', 'true');
    setShowTutorial(false);
  };

  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center bg-brand-black">
              <MotionDiv 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: 360,
                  borderColor: ['#ccff00', '#ffffff', '#ccff00']
                }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-10 w-10 border-2 border-brand-accent border-t-transparent rounded-full"
              />
          </div>
        }>
          <AnimatedRoutes />
        </Suspense>
      </AppShell>
      <AuthModal />
      <AnimatePresence>
        {showTutorial && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-[200]"
          >
            <Tutorial onComplete={handleTutorialComplete} />
          </MotionDiv>
        )}
      </AnimatePresence>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MotionProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </MotionProvider>
    </AuthProvider>
  );
};

export default App;