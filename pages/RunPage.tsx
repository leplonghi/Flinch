
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { firestoreService } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useMotion } from '../contexts/MotionContext';
import { Target, Pose, ChoreographyStep, ReplayFrame } from '../types';

const TargetPositions: Record<Target, { x: number, y: number }> = {
  C: { x: 0.5, y: 0.5 },
  L: { x: 0.2, y: 0.5 },
  R: { x: 0.8, y: 0.5 },
  U: { x: 0.5, y: 0.2 },
  D: { x: 0.5, y: 0.8 },
};

const RunPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    startTracking, stopTracking, isHandDetected, handPos, currentPose, metrics, isCameraActive
  } = useMotion();
  
  const challenge = OFFICIAL_CHALLENGES.find(c => c.id === id);
  const [gameState, setGameState] = useState<'LOBBY' | 'PLAYING' | 'FINISHED'>('LOBBY');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);
  
  const replayLog = useRef<ReplayFrame[]>([]);
  const lastProcessedStep = useRef(-1);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      const raf = requestAnimationFrame(function loop() {
        const now = performance.now();
        const delta = now - startTime;
        setElapsed(delta);
        
        // Log frame for replay
        const activeStepIdx = challenge?.choreography.findIndex(s => Math.abs(s.timeMs - delta) < 500) ?? -1;
        const activeStep = activeStepIdx !== -1 ? challenge?.choreography[activeStepIdx] : null;

        replayLog.current.push({
          t: delta,
          userPos: handPos,
          userPose: currentPose,
          targetPos: activeStep ? TargetPositions[activeStep.target] : { x: 0.5, y: 0.5 },
          targetPose: activeStep?.pose ?? "OPEN",
          isHit: false, // Updated on hit
          errorMs: 0
        });

        // Hit Detection
        challenge?.choreography.forEach((step, idx) => {
          if (idx <= lastProcessedStep.current) return;
          
          const timeDiff = delta - step.timeMs;
          if (Math.abs(timeDiff) < step.windowMs) {
            const dist = Math.hypot(handPos.x - TargetPositions[step.target].x, handPos.y - TargetPositions[step.target].y);
            const poseMatch = currentPose === step.pose;
            
            if (dist < 0.15 && poseMatch) {
              lastProcessedStep.current = idx;
              const quality = 1 - (Math.abs(timeDiff) / step.windowMs);
              const points = Math.floor(1000 * quality);
              setScore(s => s + points);
              setFeedback({ text: quality > 0.8 ? "PERFECT" : "GOOD", color: challenge.accentColor });
              setTimeout(() => setFeedback(null), 500);
            }
          } else if (timeDiff > step.windowMs) {
            // Missed
            lastProcessedStep.current = idx;
            setFeedback({ text: "MISS", color: "#ff3333" });
            setTimeout(() => setFeedback(null), 500);
          }
        });

        if (delta < (challenge?.durationMs ?? 0)) {
          requestAnimationFrame(loop);
        } else {
          finishRun();
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [gameState, startTime, handPos, currentPose]);

  const startRun = async () => {
    await startTracking();
    setGameState('PLAYING');
    setStartTime(performance.now());
    replayLog.current = [];
    lastProcessedStep.current = -1;
  };

  const finishRun = async () => {
    setGameState('FINISHED');
    const runId = await firestoreService.saveRun({
      userId: user?.uid || 'guest',
      userName: user?.displayName || 'GUEST',
      userAvatar: user?.photoURL || '',
      challengeId: id || 'blink',
      score: score,
      replayLog: { ms: 0, stability: [], fullLog: replayLog.current } as any
    });
    stopTracking();
    navigate(`/result/${runId}?score=${score}&type=${id}`);
  };

  if (!challenge) return null;

  return (
    <div className="h-full bg-brand-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(${challenge.accentColor} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <AnimatePresence>
        {gameState === 'LOBBY' && (
          <motion.div exit={{ opacity: 0, scale: 0.9 }} className="z-10 text-center space-y-10">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">{challenge.name}</h1>
            <div className="w-40 h-40 rounded-full border-4 border-brand-accent mx-auto flex items-center justify-center" onClick={startRun}>
               <span className="text-2xl font-black italic">READY</span>
            </div>
            <p className="text-xs font-bold text-white/40 tracking-[0.3em]">FOLLOW THE GHOST HAND</p>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <>
            {/* Beat Rail */}
            <div className="absolute bottom-10 left-0 right-0 h-1 bg-white/5">
              {challenge.choreography.map((step, i) => (
                <div 
                  key={i}
                  className="absolute top-0 w-1 h-4 bg-white/20 -translate-y-1.5"
                  style={{ left: `${((step.timeMs - elapsed) / 2000) * 100 + 50}%` }}
                />
              ))}
              <div className="absolute left-1/2 top-0 w-0.5 h-10 bg-brand-accent -translate-y-4.5 shadow-[0_0_20px_rgba(204,255,0,0.5)]" />
            </div>

            {/* Ghost Hand (Modelo) */}
            {challenge.choreography.map((step, i) => {
              const timeToHit = step.timeMs - elapsed;
              if (timeToHit < 0 || timeToHit > 2000) return null;
              const pos = TargetPositions[step.target];
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 0.4, scale: 1, x: (pos.x - 0.5) * 400, y: (pos.y - 0.5) * 600 }}
                  className="absolute w-24 h-24 border-2 border-dashed border-white rounded-full flex items-center justify-center"
                >
                  <span className="text-[10px] font-black uppercase">{step.pose}</span>
                </motion.div>
              );
            })}

            {/* Player Hand (Real-time) */}
            <motion.div 
              animate={{ x: (handPos.x - 0.5) * 400, y: (handPos.y - 0.5) * 600 }}
              className="absolute w-20 h-20 bg-brand-accent/20 border-2 border-brand-accent rounded-full flex items-center justify-center z-20"
            >
              <div className="text-center">
                <p className="text-[10px] font-black italic text-brand-accent">{currentPose}</p>
                {!isHandDetected && <p className="text-[8px] text-white/40">SEARCHING...</p>}
              </div>
            </motion.div>

            {/* Feedback & Score */}
            <div className="absolute top-20 text-center w-full">
              <h2 className="text-6xl font-black italic text-white/20">{score}</h2>
              <AnimatePresence>
                {feedback && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                              className="text-4xl font-black italic" style={{ color: feedback.color }}>
                    {feedback.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RunPage;
