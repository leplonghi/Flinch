
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMotion } from '../contexts/MotionContext';
import type { Achievement } from '../types';

const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;
const MotionH4 = motion.h4 as any;
const MotionP = motion.p as any;

export function AchievementNotification({ achievement }: { achievement: Achievement | null }) {
  const [show, setShow] = useState(false);
  const { confidence, isHandDetected } = useMotion();

  useEffect(() => {
    if (achievement) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5500);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const tierGradients = {
    BRONZE: 'from-orange-600/90 to-orange-950/90 border-orange-400/40',
    SILVER: 'from-gray-400/90 to-gray-800/90 border-gray-300/40',
    GOLD: 'from-yellow-400/90 to-yellow-800/90 border-yellow-200/40',
    PLATINUM: 'from-cyan-400/90 to-blue-900/90 border-cyan-200/40'
  };

  const accentColor = achievement?.tier === 'PLATINUM' ? '#00e5ff' : '#ccff00';

  return (
    <AnimatePresence>
      {show && achievement && (
        <MotionDiv 
          initial={{ x: 450, opacity: 0, scale: 0.8, rotate: 10 }}
          animate={{ 
            x: 0, 
            opacity: 1, 
            scale: 1, 
            rotate: 0,
            y: isHandDetected ? (confidence - 100) / 10 : 0 // Reactive float based on confidence
          }}
          exit={{ x: 450, opacity: 0, scale: 0.8, rotate: -10 }}
          transition={{ 
            type: "spring", 
            damping: 18, 
            stiffness: 150 
          }}
          className="fixed top-8 right-8 z-[200] pointer-events-none"
        >
          <div className={`
            relative overflow-hidden p-6 rounded-[2.5rem] border-2 backdrop-blur-2xl flex items-center gap-6 min-w-[360px]
            bg-gradient-to-br ${tierGradients[achievement.tier]}
            shadow-[0_40px_100px_rgba(0,0,0,0.7)]
          `}>
            {/* Live Glow Reactive Layer */}
            <MotionDiv 
              animate={{
                opacity: isHandDetected ? (confidence / 100) * 0.6 : 0.2,
                scale: isHandDetected ? 1 + confidence / 200 : 1
              }}
              className="absolute inset-0 bg-white/5 pointer-events-none"
              style={{ boxShadow: `inset 0 0 30px ${accentColor}33` }}
            />

            <div className="relative">
              <MotionDiv 
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-16 h-16 bg-black/40 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/5"
              >
                {achievement.icon}
              </MotionDiv>
              
              {/* Dynamic Aura - Pulsing with Hand Tracking */}
              <MotionDiv 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: isHandDetected ? [0.2, 0.5, 0.2] : 0.1
                }}
                transition={{ repeat: Infinity, duration: isHandDetected ? 1.5 : 3 }}
                className="absolute -inset-3 border-2 border-white/20 rounded-[2rem] pointer-events-none"
              />
            </div>
            
            <div className="flex flex-col relative z-10">
              <MotionSpan 
                className="text-white/40 font-black text-[9px] uppercase tracking-[0.4em] mb-1"
              >
                Neural Unlock
              </MotionSpan>
              <MotionH4 
                className="text-white font-black italic text-2xl tracking-tighter uppercase leading-none mb-1.5"
                style={{ textShadow: `0 0 20px ${accentColor}66` }}
              >
                {achievement.name}
              </MotionH4>
              <MotionP 
                className="text-white/80 text-[11px] font-bold leading-tight max-w-[180px]"
              >
                {achievement.description}
              </MotionP>
            </div>

            {/* Scanning Effect Overlay */}
            <MotionDiv 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-y-0 w-32 bg-white/5 skew-x-[-20deg] blur-xl pointer-events-none"
            />
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
