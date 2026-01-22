
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { useMotion } from '../contexts/MotionContext';
import { useGame } from '../contexts/GameContext';
import { Step, Challenge } from '../types';

const RunPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    startTracking, stopTracking, isHandDetected, currentPose, rawLandmarks, 
    faceLandmarks, videoRef, confidence, metrics
  } = useMotion();
  const { startGame } = useGame();
  
  const challengeDef = OFFICIAL_CHALLENGES.find(c => c.id === id);
  const [initStep, setInitStep] = useState<'BRIEFING' | 'SYNC' | 'ENGAGE'>('BRIEFING');
  const [syncProgress, setSyncProgress] = useState(0);
  const [engageProgress, setEngageProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const syncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    };
  }, [startTracking, stopTracking]);

  // Lógica de Sincronização Automática ao detectar a mão
  useEffect(() => {
    if (initStep === 'SYNC' && isHandDetected && syncProgress < 100) {
      const interval = window.setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            setInitStep('ENGAGE');
            window.clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => window.clearInterval(interval);
    }
  }, [initStep, isHandDetected, syncProgress]);

  // Lógica de Gesto "FIST" para carregar o link final
  useEffect(() => {
    if (initStep === 'ENGAGE' && isHandDetected) {
      const interval = window.setInterval(() => {
        setEngageProgress(prev => {
          if (currentPose === 'FIST') {
            const next = prev + 5;
            if (next >= 100) {
              window.clearInterval(interval);
              handleGameStart();
              return 100;
            }
            return next;
          }
          return Math.max(0, prev - 10);
        });
      }, 50);
      return () => window.clearInterval(interval);
    }
  }, [initStep, isHandDetected, currentPose]);

  const handleGameStart = () => {
    if (challengeDef) {
      const challengeObj: Challenge = {
        id: challengeDef.id,
        name: challengeDef.name,
        description: challengeDef.description,
        icon: '⚡',
        accentColor: challengeDef.accentColor,
        startingHealth: 100,
        totalDurationMs: challengeDef.durationMs,
        bpm: challengeDef.bpm,
        category: challengeDef.category,
        steps: challengeDef.choreography.map((s, i) => ({
          id: `${challengeDef.id}_step_${i}`,
          type: s.type,
          startTimeMs: s.timeMs,
          durationMs: s.windowMs,
          pose: s.pose,
          target: s.target,
          windowMs: s.windowMs
        } as Step))
      };
      startGame(challengeObj, 'NORMAL');
    }
  };

  const getProjectedCoords = (p: any, video: HTMLVideoElement, cW: number, cH: number) => {
    const vW = video.videoWidth || 640;
    const vH = video.videoHeight || 480;
    const scale = Math.max(cW / vW, cH / vH);
    const offsetX = (cW - vW * scale) / 2;
    const offsetY = (cH - vH * scale) / 2;
    return {
      x: (1 - p.x) * vW * scale + offsetX,
      y: p.y * vH * scale + offsetY
    };
  };

  // Loop de Desenho do Overlay de Calibração
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !containerRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      const container = containerRef.current!;
      
      const rect = container.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent = challengeDef?.accentColor || '#ccff00';

      if (rawLandmarks && rawLandmarks[0]) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = accent;

        const fingerPaths = [[0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], [0,13,14,15,16], [0,17,18,19,20], [5,9,13,17]];
        fingerPaths.forEach(path => {
          ctx.beginPath();
          path.forEach((idx, i) => {
            const p = getProjectedCoords(rawLandmarks[idx], video, canvas.width, canvas.height);
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        });

        // Pulsos de Sincronização no Pulso (Calibration Phase)
        if (initStep === 'SYNC' || initStep === 'ENGAGE') {
          const wrist = getProjectedCoords(rawLandmarks[0], video, canvas.width, canvas.height);
          const time = Date.now();
          const pulse = Math.sin(time / 200) * 10;
          
          // Primary Pulse Ring
          ctx.beginPath();
          ctx.arc(wrist.x, wrist.y, 50 + pulse, 0, Math.PI * 2);
          ctx.setLineDash([10, 15]);
          ctx.lineWidth = 2;
          ctx.strokeStyle = `${accent}88`;
          ctx.stroke();
          
          // Rotating HUD elements around wrist during calibration
          if (initStep === 'SYNC') {
            const rotation = (time / 1000) % (Math.PI * 2);
            
            ctx.setLineDash([]);
            ctx.lineWidth = 4;
            ctx.strokeStyle = accent;
            
            // Draw four orbiting arcs
            for (let i = 0; i < 4; i++) {
              const angle = rotation + (i * Math.PI / 2);
              ctx.beginPath();
              ctx.arc(wrist.x, wrist.y, 60, angle, angle + 0.5);
              ctx.stroke();
            }

            // "CALIBRATING" Text near hand
            ctx.fillStyle = accent;
            ctx.font = '900 10px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.shadowBlur = 5;
            ctx.fillText('CALIBRATING_NEURAL_LINK', wrist.x, wrist.y - 75 - pulse);
          }

          ctx.setLineDash([]);
        }
      }

      if (faceLandmarks) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        [[33, 160, 158, 133, 153, 144], [362, 385, 387, 263, 373, 380]].forEach(eye => {
          ctx.beginPath();
          eye.forEach((idx, i) => {
            const p = getProjectedCoords(faceLandmarks[idx], video, canvas.width, canvas.height);
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.stroke();
        });
      }

      requestAnimationFrame(draw);
    };

    const frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [rawLandmarks, faceLandmarks, challengeDef, initStep]);

  if (!challengeDef) return null;

  return (
    <div ref={containerRef} className="h-full bg-brand-black relative overflow-hidden select-none">
      <div className="absolute inset-0 z-0">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1] opacity-50" autoPlay playsInline muted />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-brand-black/20" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* Header Info */}
      <div className="absolute top-12 left-0 right-0 z-50 px-8 flex justify-between items-start pointer-events-none">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em]">Op_Ready</span>
          <h2 className="text-3xl font-black italic text-white leading-none uppercase tracking-tighter">{challengeDef.name.split(' · ')[1]}</h2>
        </div>
        <div className="bg-brand-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isHandDetected ? 'bg-brand-accent animate-pulse' : 'bg-brand-danger'}`} />
          <span className="text-[10px] font-black text-white italic">{metrics.fps} FPS</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {initStep === 'BRIEFING' && (
          <motion.div 
            key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center px-10 text-center space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-none">NEURAL<br/>SYNC</h1>
              <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs mx-auto">Sincronize sua interface biológica com a rede FLINCH para autorização de entrada.</p>
            </div>
            <button 
              onClick={() => setInitStep('SYNC')}
              className="w-full h-20 bg-brand-accent text-brand-black font-black italic rounded-[2rem] text-xl shadow-[0_20px_60px_rgba(204,255,0,0.3)]"
            >
              ESTABELECER LINK
            </button>
          </motion.div>
        )}

        {initStep === 'SYNC' && (
          <motion.div 
            key="sync" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-4 border-white/5 flex items-center justify-center">
                <svg className="w-full h-full absolute inset-0 -rotate-90">
                  <circle cx="96" cy="96" r="90" fill="none" stroke={challengeDef.accentColor} strokeWidth="8" strokeDasharray="565" strokeDashoffset={565 - (565 * syncProgress) / 100} strokeLinecap="round" className="transition-all duration-300" />
                </svg>
                <span className="text-4xl font-black italic text-white">{syncProgress}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                {isHandDetected ? 'SYNCHRONIZING...' : 'SEARCHING HAND...'}
              </h3>
              <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em] animate-pulse">
                Aguardando Bio-Assinatura Estável
              </p>
            </div>
          </motion.div>
        )}

        {initStep === 'ENGAGE' && (
          <motion.div 
            key="engage" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center space-y-10"
          >
            <div className="w-40 h-40 bg-brand-surface/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center relative">
               <motion.div 
                 animate={currentPose === 'FIST' ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="text-6xl"
               >
                 ✊
               </motion.div>
               {engageProgress > 0 && (
                 <svg className="absolute inset-0 -rotate-90 w-full h-full scale-110">
                   <circle cx="80" cy="80" r="75" fill="none" stroke={challengeDef.accentColor} strokeWidth="6" strokeDasharray="471" strokeDashoffset={471 - (471 * engageProgress) / 100} strokeLinecap="round" />
                 </svg>
               )}
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">ENGAGE LINK</h3>
              <p className="text-xs font-black text-brand-accent uppercase tracking-[0.3em] animate-pulse">
                FECHE O PUNHO PARA INICIAR
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RunPage;
