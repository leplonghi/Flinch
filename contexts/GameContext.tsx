
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../services/GameEngine';
import { ProgressionSystem } from '../services/ProgressionSystem';
import { useMotion } from './MotionContext';
import type { Challenge, Difficulty, GameState, HitResultType, PlayerProgress, RunRecord } from '../types';

interface GameContextType {
  isPlaying: boolean;
  gameState: GameState | null;
  lastHitResult: { type: string, label?: string, xp?: number } | null;
  playerProgress: PlayerProgress;
  startGame: (challenge: Challenge, difficulty: Difficulty) => void;
  stopGame: () => void;
  currentChallenge: Challenge | null;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}

// Updated with optional children to fix JSX inference issues where children might not be detected correctly
export function GameProvider({ children }: { children?: React.ReactNode }) {
  const { currentPose, currentTarget } = useMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastHitResult, setLastHitResult] = useState<any | null>(null);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(ProgressionSystem.initializeProgress());
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const frameRef = useRef<number | null>(null);

  const stopGame = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (engineRef.current) {
      if (engineRef.current.isComplete()) {
        const record = engineRef.current.generateRunRecord();
        const stats = engineRef.current.getState().stats;
        const updatedProgress = ProgressionSystem.updateProgressFromRun(playerProgress, record, stats);
        setPlayerProgress(updatedProgress);
      }
      engineRef.current.dispose();
    }
    setIsPlaying(false);
    engineRef.current = null;
  }, [playerProgress]);

  const gameLoop = useCallback(() => {
    if (!engineRef.current || !isPlaying) return;

    const result = engineRef.current.update(currentPose, currentTarget);
    const state = engineRef.current.getState();
    
    setGameState(state);

    if (result) {
      if (result.type === 'CHALLENGE_COMPLETE' || state.isGameOver) {
        stopGame();
        return;
      }
      setLastHitResult(result);
      // Auto clear feedback after short time
      setTimeout(() => setLastHitResult(null), 800);
    }

    frameRef.current = requestAnimationFrame(gameLoop);
  }, [currentPose, currentTarget, isPlaying, stopGame]);

  useEffect(() => {
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, gameLoop]);

  const startGame = (challenge: Challenge, difficulty: Difficulty) => {
    if (engineRef.current) engineRef.current.dispose();
    
    const engine = new GameEngine(challenge, difficulty);
    engineRef.current = engine;
    setCurrentChallenge(challenge);
    engine.start();
    setIsPlaying(true);
    setGameState(engine.getState());
  };

  return (
    <GameContext.Provider value={{ 
      isPlaying, 
      gameState, 
      lastHitResult, 
      playerProgress, 
      startGame, 
      stopGame,
      currentChallenge
    }}>
      {children}
    </GameContext.Provider>
  );
}
