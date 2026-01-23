import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Step, HitResult } from '../types';

interface HUDProps {
  gameState: GameState;
  currentStep: Step | null;
  lastResult: HitResult | null;
  challengeName: string;
}

const MotionDiv = motion.div as any;

const HUD: React.FC<HUDProps> = ({ gameState, currentStep, lastResult, challengeName }) => {
  return (
    <div className="absolute inset-0 z-50 pointer-events-none p-10 flex flex-col justify-between">
      {/* Top Bar: Progress & Health */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-48">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest italic">NEURAL_STABILITY</span>
            <span className="text-xl font-black italic text-white">{gameState.health}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <MotionDiv 
              initial={false}
              animate={{ width: `${gameState.health}%` }}
              className={`h-full ${gameState.health > 30 ? 'bg-brand-accent' : 'bg-brand-danger'} shadow-[0_0_15px_currentColor]`}
            />
          </div>
        </div>

        <div className="text-right space-y-1">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">{challengeName}</p>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-white/20 uppercase leading-none">Global Score</span>
             <h3 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">{gameState.score}</h3>
          </div>
        </div>
      </div>

      {/* Center Feedback: Last Result & Pose Hint */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {lastResult && (
            <MotionDiv
              key={Date.now()}
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute top-1/2 -translate-y-24"
            >
              <span className={`text-4xl font-black italic uppercase tracking-tighter ${
                lastResult.type === 'PERFECT' ? 'text-brand-accent' : 
                lastResult.type === 'MISS' ? 'text-brand-danger' : 'text-white'
              }`}>
                {lastResult.type}
              </span>
            </MotionDiv>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentStep && currentStep.type !== 'WAIT' && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="bg-brand-black/40 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2rem] flex flex-col items-center gap-2"
            >
               <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em] animate-pulse">POSE_REQUIRED</span>
               <h4 className="text-4xl font-black italic uppercase text-white tracking-tighter">{currentStep.pose}</h4>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar: Combo & Metrics */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col items-start">
          <MotionDiv 
            key={gameState.combo}
            initial={{ scale: 1.2, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            className="flex items-end gap-2"
          >
            <span className="text-7xl font-black italic leading-none tracking-tighter text-white">{gameState.combo}</span>
            <span className="text-xs font-black text-brand-accent uppercase mb-2">COMBO</span>
          </MotionDiv>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Best: x{gameState.maxCombo}</p>
        </div>

        <div className="flex gap-8">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white/20 uppercase">Timing</span>
              <span className="text-lg font-black italic text-white/80">{lastResult?.timingErrorMs || 0}ms</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white/20 uppercase">Status</span>
              <span className="text-lg font-black italic text-brand-accent animate-pulse">OPTIMIZED</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;