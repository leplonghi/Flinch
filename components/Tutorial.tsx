import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotion } from '../contexts/MotionContext';
import type { Pose, Target } from '../types';

interface TutorialStep {
  title: string;
  description: string;
  requirement?: {
    type: 'pose' | 'target' | 'both';
    pose?: Pose;
    target?: Target;
    count?: number;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'WELCOME_OPERATOR ⚡',
    description: 'FLINCH uses your camera to link your reflexes to the grid. Let\'s sync your neural interface.'
  },
  {
    title: 'POSE_INIT: OPEN ✋',
    description: 'Extend all fingers clearly. This is your primary neutral state.',
    requirement: { type: 'pose', pose: 'OPEN', count: 1 }
  },
  {
    title: 'POSE_INIT: FIST ✊',
    description: 'Clench your hand. Use this for high-impact kinetic locks.',
    requirement: { type: 'pose', pose: 'FIST', count: 1 }
  },
  {
    title: 'POSE_INIT: PINCH 🤏',
    description: 'Join thumb and index. Precision is required for neural fine-tuning.',
    requirement: { type: 'pose', pose: 'PINCH', count: 1 }
  },
  {
    title: 'POSE_INIT: POINT ☝️',
    description: 'Extend your index finger. Target identified.',
    requirement: { type: 'pose', pose: 'POINT', count: 1 }
  },
  {
    title: 'TARGET_LOCK: CENTER 🎯',
    description: 'Hold your hand in the central focus area.',
    requirement: { type: 'target', target: 'C', count: 1 }
  },
  {
    title: 'TARGET_LOCK: LEFT ⬅️',
    description: 'Shift your hand to the left sector.',
    requirement: { type: 'target', target: 'L', count: 1 }
  },
  {
    title: 'TARGET_LOCK: RIGHT ➡️',
    description: 'Shift your hand to the right sector.',
    requirement: { type: 'target', target: 'R', count: 1 }
  },
  {
    title: 'SYNC_COMPLETE 🎉',
    description: 'Neural link established. You are ready to enter the global grid. Good luck, Operator.'
  }
];

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { currentPose, currentTarget, isHandDetected, startTracking, stopTracking, videoRef } = useMotion();
  const [lastDetected, setLastDetected] = useState<string | null>(null);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  const step = TUTORIAL_STEPS[currentStep];

  useEffect(() => {
    if (!step.requirement || !isHandDetected) return;

    const { type, pose, target, count = 1 } = step.requirement;

    let detected = false;
    const currentSig = `${currentPose}-${currentTarget}`;

    if (type === 'pose' && currentPose === pose && currentSig !== lastDetected) {
      detected = true;
      setLastDetected(currentSig);
    } else if (type === 'target' && currentTarget === target && currentSig !== lastDetected) {
      detected = true;
      setLastDetected(currentSig);
    }

    if (detected) {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= count) {
          // CALIBRATION SPEED OPTIMIZATION: Reduced transition delay
          setTimeout(() => {
            setProgress(0);
            setLastDetected(null);
            if (currentStep < TUTORIAL_STEPS.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              onComplete();
            }
          }, 150);
        }
        return newProgress;
      });
    }
  }, [currentPose, currentTarget, step, currentStep, lastDetected, isHandDetected]);

  const handleSkip = () => onComplete();
  const handleNext = () => {
    if (!step.requirement) {
      if (currentStep < TUTORIAL_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-black/95 flex flex-col items-center justify-center z-[200] p-6 text-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 grayscale pointer-events-none">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      <div className="w-full max-lg relative z-10 flex flex-col items-center gap-8">
        <div className="w-full flex gap-1 px-4">
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i < currentStep ? 'bg-brand-accent shadow-[0_0_10px_#ccff00]' :
                i === currentStep ? 'bg-white shadow-[0_0_10px_#ffffff]' :
                'bg-white/10'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <MotionDiv
            key={currentStep}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full bg-brand-surface/80 backdrop-blur-2xl border-2 border-white/10 p-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-6"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em] opacity-80">Phase_{currentStep + 1}</span>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{step.title}</h2>
            </div>
            
            <p className="text-white/60 text-lg font-medium leading-snug max-w-[280px]">
              {step.description}
            </p>

            {step.requirement ? (
              <div className="w-full space-y-8 py-4">
                <div className="relative">
                  <MotionDiv 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 -m-4 border-2 border-brand-accent/20 rounded-full pointer-events-none"
                  />
                  <div className="text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    {step.requirement.pose === 'OPEN' && '✋'}
                    {step.requirement.pose === 'FIST' && '✊'}
                    {step.requirement.pose === 'PINCH' && '🤏'}
                    {step.requirement.pose === 'POINT' && '☝️'}
                    {step.requirement.target === 'C' && '🎯'}
                    {step.requirement.target === 'L' && '⬅️'}
                    {step.requirement.target === 'R' && '➡️'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Calibration</span>
                    <span className="text-xl font-black italic text-brand-accent">
                      {Math.round((progress / (step.requirement.count || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <MotionDiv
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress / (step.requirement.count || 1)) * 100}%` }}
                      className="h-full bg-brand-accent shadow-[0_0_20px_#ccff00]"
                    />
                  </div>
                </div>

                {!isHandDetected && (
                   <MotionP 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="text-[10px] font-black text-brand-danger uppercase tracking-[0.3em] animate-pulse"
                   >
                     Searching for Neural Link...
                   </MotionP>
                )}
              </div>
            ) : (
              <div className="py-6">
                <MotionDiv 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center text-brand-black shadow-[0_0_50px_rgba(204,255,0,0.4)]"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </MotionDiv>
              </div>
            )}

            <div className="w-full flex flex-col gap-3">
              {!step.requirement && (
                <button
                  onClick={handleNext}
                  className="w-full py-5 bg-brand-accent text-brand-black font-black italic text-xl rounded-2xl hover:bg-white transition-colors uppercase tracking-tighter"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Enter the Grid' : 'Proceed'}
                </button>
              )}
              <button
                onClick={handleSkip}
                className="w-full py-4 border border-white/10 text-white/40 font-black italic uppercase text-xs tracking-widest hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                Skip Interface Setup
              </button>
            </div>
          </MotionDiv>
        </AnimatePresence>

        {step.requirement && (
          <div className="flex gap-10 items-center bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/5 opacity-50">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase text-white/20">Pose</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentPose === step.requirement.pose ? 'text-brand-accent' : 'text-white'}`}>
                {currentPose}
              </span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black uppercase text-white/20">Target</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentTarget === step.requirement.target ? 'text-brand-accent' : 'text-white'}`}>
                {currentTarget}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}