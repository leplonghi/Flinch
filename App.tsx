
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MotionProvider } from './contexts/MotionContext';
import { GameProvider, useGame } from './contexts/GameContext';
import AppShell from './components/Layout/AppShell';
import AuthModal from './components/Auth/AuthModal';

import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import RunPage from './pages/RunPage';
import GamePage from './pages/GamePage';
import RankPage from './pages/RankPage';
import ProfilePage from './pages/ProfilePage';
import ResultPage from './pages/ResultPage';
import ReplayPage from './pages/ReplayPage';
import SharePage from './pages/SharePage';

function AppContent() {
  const { isPlaying } = useGame();

  // Se o jogo estiver rodando, foco total (sem header/nav)
  if (isPlaying) {
    return <GamePage />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/run/:id" element={<RunPage />} />
        <Route path="/rank" element={<RankPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/result/:type" element={<ResultPage />} />
        <Route path="/replay/:runId" element={<ReplayPage />} />
        <Route path="/share/:runId" element={<SharePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MotionProvider>
        <GameProvider>
          <HashRouter>
            <AppContent />
            <AuthModal />
          </HashRouter>
        </GameProvider>
      </MotionProvider>
    </AuthProvider>
  );
}
