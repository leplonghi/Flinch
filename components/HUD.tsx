
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Step, Pose, Target, HitResultType } from '../types';
import Progress from './UI/Progress';

interface HUDProps {
  gameState: GameState;
  currentStep: Step | null;
  lastResult: { type: string; label?: string; xp?: number; damage?: number } | null;
  challengeName: string;
}

const PoseEmoji: Record<Pose, string> = {
  OPEN: '✋',
  FIST: '✊',
  PINCH: '🤏',
  POINT: '☝️',
  WAVE: '👋',
  UNKNOWN: '❓'
};

const TargetLabel: Record<Target, string> = {
  C: 'CENTER',
  L: 'LEFT',
  R: 'RIGHT',
  U: 'UP',
  D: 'DOWN',
  NONE: ''
};

const HUD: React.FC<HUDProps> = ({ gameState, currentStep, lastResult, challengeName }) => {
  const healthColor = gameState.health > 60 ? 'bg-brand-neonGreen' : gameState.health > 30 ? 'bg-brand-neonOrange' : 'bg-brand-danger';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col p-6 font-mono">
      {/* Top Bar: Status */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 max-w-[200px] space-y-1">
          <div className="flex justify-between text-[10px] font-black text-white/50 italic">
            <span>CORE_INTEGRITY</span>
            <span>{Math.round(gameState.health)}%</span>
          </div>
          <Progress value={gameState.health} color={healthColor} className="h-3 shadow-[0_0_15px_rgba(0,255,65,0.3)]" />
        </div>

        <div className="text-center">
          <p className="text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">{challengeName}</p>
          <h2 className="text-4xl font-black italic text-white leading-none">
            {gameState.score.toLocaleString()}
          </h2>
        </div>

        <div className="flex-1 max-w-[200px] text-right">
          <p className="text-[10px] font-black text-white/30 uppercase">Combo</p>
          <motion.p 
            key={gameState.combo}
            initial={{ scale: 1.5, color: '#ccff00' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-3xl font-black italic leading-none"
          >
            x{gameState.combo}
          </motion.p>
        </div>
      </div>

      {/* Center: Instructions */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -20 }}
              className="text-center space-y-4"
            >
              <GhostInstruction step={currentStep} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: Feedback & Stats */}
      <div className="space-y-6">
        <div className="h-20 flex items-center justify-center">
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="text-center"
              >
                <FeedbackDisplay result={lastResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-8 bg-brand-black/40 backdrop-blur-md py-3 rounded-2xl border border-white/5">
          <StatItem label="PERFECT" value={gameState.stats.perfects} color="text-brand-neonGreen" />
          <StatItem label="GOOD" value={gameState.stats.goods} color="text-brand-neonCyan" />
          <StatItem label="MISS" value={gameState.stats.misses} color="text-brand-danger" />
        </div>
      </div>
    </div>
  );
};

const GhostInstruction: React.FC<{ step: Step }> = ({ step }) => {
  if (step.type === 'WAIT') {
    return (
      <div className="space-y-2">
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-4xl font-black italic text-brand-neonOrange uppercase tracking-tighter"
        >
          WAIT...
        </motion.p>
      </div>
    );
  }

  if (step.type === 'SNAP') {
    return (
      <div className="space-y-2">
        <span className="text-6xl">{PoseEmoji['PINCH']}</span>
        <p className="text-4xl font-black italic text-brand-neonCyan uppercase tracking-tighter animate-pulse">
          SNAP!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full" />
        <span className="text-8xl relative z-10 block drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
          {PoseEmoji[step.pose] || '❓'}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">{TargetLabel[step.target]}</p>
        <p className="text-3xl font-black italic text-white uppercase tracking-tighter">
          {step.type === 'HOLD' ? 'HOLD IT' : 'STRIKE'}
        </p>
      </div>
    </div>
  );
};

const FeedbackDisplay: React.FC<{ result: any }> = ({ result }) => {
  const colors: Record<string, string> = {
    PERFECT: 'text-brand-neonGreen',
    GOOD: 'text-brand-neonCyan',
    MISS: 'text-brand-danger',
    DRIFT: 'text-brand-neonOrange',
    EARLY: 'text-brand-neonOrange'
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className={`text-5xl font-black italic uppercase tracking-tighter ${colors[result.type] || 'text-white'}`}>
        {result.label || result.type}
      </h3>
      {result.xp && <span className="text-brand-accent font-black text-sm">+{result.xp} XP</span>}
      {result.damage && <span className="text-brand-danger font-black text-sm">-{result.damage} HP</span>}
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="text-center">
    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{label}</p>
    <p className={`text-lg font-black italic ${color} leading-none`}>{value}</p>
  </div>
);

export default HUD;
