
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Challenge, GameState, HitResult, Step, Achievement, PlayerProgress } from '../types';
import { ProgressionSystem } from '../services/ProgressionSystem';

interface GameContextType {
  isPlaying: boolean;
  currentChallenge: Challenge | null;
  gameState: GameState | null;
  lastHitResult: HitResult | null;
  newAchievement: Achievement | null;
  playerProgress: PlayerProgress;
  startGame: (challenge: Challenge, difficulty: string) => void;
  stopGame: () => void;
  registerHit: (result: HitResult) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastHitResult, setLastHitResult] = useState<HitResult | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(ProgressionSystem.load());
  
  const gameTimerRef = useRef<number | null>(null);

  const startGame = (challenge: Challenge, difficulty: string) => {
    setIsPlaying(true);
    setCurrentChallenge(challenge);
    setGameState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      health: 100,
      currentStepIndex: 0,
      isGameOver: false,
      currentTimeMs: 0,
      perfects: 0,
      goods: 0,
      misses: 0
    });
    setLastHitResult(null);

    const startTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;
        
        const currentStep = challenge.steps[prev.currentStepIndex];
        const nextStepIdx = prev.currentStepIndex + 1;
        
        if (currentStep && elapsed > (currentStep.startTimeMs + currentStep.durationMs) && nextStepIdx < challenge.steps.length) {
          return { ...prev, currentStepIndex: nextStepIdx, currentTimeMs: elapsed };
        }

        if (elapsed > challenge.totalDurationMs) {
          const finishedState = { ...prev, isGameOver: true, currentTimeMs: elapsed };
          finishGame(finishedState);
          return finishedState;
        }

        return { ...prev, currentTimeMs: elapsed };
      });

      if (gameTimerRef.current !== null) {
        gameTimerRef.current = requestAnimationFrame(tick);
      }
    };
    gameTimerRef.current = requestAnimationFrame(tick);
  };

  const finishGame = (finalState: GameState) => {
    setIsPlaying(false);
    if (gameTimerRef.current) {
      cancelAnimationFrame(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    
    if (currentChallenge) {
      const oldAchievementsCount = playerProgress.achievements?.length || 0;
      const updatedProgress = ProgressionSystem.updateProgressFromRun(currentChallenge, finalState);
      
      setPlayerProgress(updatedProgress);
      
      const newAchievements = updatedProgress.achievements || [];
      if (newAchievements.length > oldAchievementsCount) {
        // Show the most recent one
        setNewAchievement(newAchievements[newAchievements.length - 1]);
        setTimeout(() => setNewAchievement(null), 6000);
      }
    }
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (gameTimerRef.current) {
      cancelAnimationFrame(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  };

  const registerHit = (result: HitResult) => {
    setLastHitResult(result);
    setGameState(prev => {
      if (!prev) return null;
      
      const isPerfect = result.type === 'PERFECT';
      const isMiss = result.type === 'MISS';

      const newCombo = isMiss ? 0 : prev.combo + 1;
      const newHealth = isMiss ? Math.max(0, prev.health - 12) : Math.min(100, prev.health + 3);
      
      const nextState = {
        ...prev,
        score: prev.score + result.score,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        health: newHealth,
        isGameOver: newHealth <= 0,
        perfects: prev.perfects + (isPerfect ? 1 : 0),
        goods: prev.goods + (result.type === 'GOOD' ? 1 : 0),
        misses: prev.misses + (isMiss ? 1 : 0)
      };

      if (nextState.isGameOver && !prev.isGameOver) {
        finishGame(nextState);
      }

      return nextState;
    });
  };

  return (
    <GameContext.Provider value={{ 
      isPlaying, currentChallenge, gameState, lastHitResult, 
      newAchievement, playerProgress, startGame, stopGame, registerHit 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
