
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { useMotion } from '../contexts/MotionContext';
import { CoreEngine } from '../services/CoreEngine';
import { useAntigravity } from '../hooks/useAntigravity';
import { Pose, Target } from '../types';

const MotionDiv = motion.div as any;

const TARGET_ANCHORS: Record<Target, { x: number; y: number }> = {
  C: { x: 0.5, y: 0.55 },
  L: { x: 0.25, y: 0.55 },
  R: { x: 0.75, y: 0.55 },
  U: { x: 0.5, y: 0.32 },
  D: { x: 0.5, y: 0.78 }
};

const GHOST_LEAD_MS = 600;

const RunPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    startTracking, stopTracking, isHandDetected, currentPose, normalizedWrist,
    videoRef, confidence, metrics
  } = useMotion();
  
  const challenge = OFFICIAL_CHALLENGES.find(c => c.id === id);
  const [gameState, setGameState] = useState<'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED'>('LOBBY');
  const [initStep, setInitStep] = useState('BRIEFING');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [combo, setCombo] = useState(0);

  // Antigravity smoothing para o Ghost
  const [targetGhostPos, setTargetGhostPos] = useState({ x: 0.5, y: 0.5 });
  const ghostPos = useAntigravity(targetGhostPos.x, targetGhostPos.y, 0.1);
  const [ghostPose, setGhostPose] = useState<Pose>('OPEN');

  const engine = useRef(CoreEngine.getInstance());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
      engine.current.stop();
    };
  }, []);

  useEffect(() => {
    if (initStep === 'COUNTDOWN' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (initStep === 'COUNTDOWN' && countdown === 0) {
      setInitStep('GAME');
      setGameState('PLAYING');
      engine.current.start();
    }
  }, [initStep, countdown]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || !challenge) return;

    let frameId: number;
    const tick = () => {
      const delta = engine.current.elapsed;
      setElapsedTime(delta);

      if (delta > challenge.durationMs) {
        setGameState('FINISHED');
        return;
      }

      const ghostTime = delta + GHOST_LEAD_MS;
      let nextStepIdx = 0;
      for (let i = 0; i < challenge.choreography.length; i++) {
        if (challenge.choreography[i].timeMs > ghostTime) {
          nextStepIdx = i;
          break;
        }
        nextStepIdx = i;
      }

      const activeStep = challenge.choreography[nextStepIdx];
      if (activeStep) {
        setTargetGhostPos(TARGET_ANCHORS[activeStep.target]);
        setGhostPose(activeStep.pose);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, challenge]);

  return (
    <div ref={containerRef} className="h-full bg-brand-black relative overflow-hidden select-none flex flex-col items-center">
      
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        {challenge?.visualAssets.contextImage && (
          <img 
            src={challenge.visualAssets.contextImage} 
            className="w-full h-full object-cover brightness-50"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-[1px]" />
      </div>

      <div className="absolute inset-0 z-[1] opacity-30">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />
      </div>

      {/* Antigravity Ghost Guide */}
      <AnimatePresence>
        {gameState === 'PLAYING' && (
          <MotionDiv 
            key="ghost-guide"
            style={{ 
              left: `${ghostPos.x * 100}%`, 
              top: `${ghostPos.y * 100}%`,
              transform: 'translate(-50%, -50%)' 
            }}
            className="absolute z-20 pointer-events-none w-32 h-32 flex flex-col items-center justify-center"
          >
            {challenge?.visualAssets.ghostGuideImage && (
              <>
                <img 
                  src={challenge.visualAssets.ghostGuideImage} 
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(204,255,0,0.8)]"
                  alt=""
                />
                <div className="mt-2 bg-brand-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-brand-accent/40">
                  <span className="text-[10px] font-black italic text-brand-accent uppercase tracking-tighter">
                    {ghostPose}
                  </span>
                </div>
              </>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Hud & Status */}
      <div className="absolute top-8 left-0 right-0 z-50 flex justify-center px-8 pointer-events-none">
        <MotionDiv 
          className="flex items-center gap-4 bg-brand-black/80 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isHandDetected ? 'bg-brand-accent animate-pulse' : 'bg-brand-danger'}`} />
            <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase italic">
              {isHandDetected ? 'SYNCED' : 'SIGNAL_LOSS'}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/30 uppercase leading-none">Conf.</span>
            <span className="text-[10px] font-black italic text-brand-accent">{confidence}%</span>
          </div>
        </MotionDiv>
      </div>

      <AnimatePresence mode="wait">
        {initStep === 'BRIEFING' && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 1.1 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            className="z-50 w-full max-w-sm px-8 pt-24 h-full flex flex-col items-center justify-center text-center"
          >
             <h1 className="text-4xl font-black italic text-brand-accent uppercase mb-4 tracking-tighter">
               Core_Protocol
             </h1>
             <p className="text-white/50 text-sm mb-12">Calibrando rede neural para Antigravity_Sync.</p>
             <button 
              onClick={() => setInitStep('COUNTDOWN')} 
              className="w-full h-16 bg-brand-accent text-brand-black font-black italic rounded-2xl shadow-[0_0_40px_rgba(204,255,0,0.3)]"
             >
               INICIAR_LINK
             </button>
          </MotionDiv>
        )}

        {initStep === 'COUNTDOWN' && (
           <div className="z-50 h-full flex flex-col items-center justify-center">
             <MotionDiv 
              key={countdown}
              initial={{ scale: 2, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="text-[12rem] font-black italic text-brand-accent drop-shadow-[0_0_50px_rgba(204,255,0,0.5)]"
             >
                {countdown > 0 ? countdown : "GO"}
             </MotionDiv>
           </div>
        )}

        {gameState === 'PLAYING' && (
           <div className="z-40 w-full h-full flex flex-col items-center pt-32 pointer-events-none">
              <h2 className="text-[10rem] font-black italic text-white drop-shadow-2xl leading-none">{combo}</h2>
              <p className="text-sm font-black text-brand-accent tracking-[0.5em] uppercase">Holistic_Grid</p>
           </div>
        )}
      </AnimatePresence>

      {/* Footer Details */}
      {gameState === 'PLAYING' && (
        <div className="absolute bottom-10 z-40 flex gap-8 bg-black/40 backdrop-blur-md px-10 py-4 rounded-full border border-white/5">
           <div className="flex flex-col items-center">
              <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Tempo</span>
              <span className="text-lg font-black text-white italic">{(elapsedTime / 1000).toFixed(2)}s</span>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <div className="flex flex-col items-center">
              <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Pose</span>
              <span className="text-lg font-black text-brand-accent italic">{currentPose}</span>
           </div>
        </div>
      )}

      {/* Finished State Overlay */}
      <AnimatePresence>
        {gameState === 'FINISHED' && (
          <MotionDiv 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="z-[100] fixed inset-0 bg-brand-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-10"
          >
            <div className="w-24 h-24 rounded-full bg-brand-accent flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(204,255,0,0.5)]">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h2 className="text-6xl font-black italic text-brand-accent uppercase mb-4 tracking-tighter">DATA_SYNCED</h2>
            <p className="text-white/60 mb-12 uppercase tracking-widest text-xs">Aguardando processamento do Antigravity Hub...</p>
            <button 
              onClick={() => navigate('/play')}
              className="px-12 py-5 bg-white text-brand-black font-black italic rounded-2xl hover:bg-brand-accent transition-colors"
            >
              VOLTAR AO HUB
            </button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RunPage;
