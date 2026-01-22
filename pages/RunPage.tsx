
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { useMotion } from '../contexts/MotionContext';
import { Pose } from '../types';

const RunPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    startTracking, stopTracking, isHandDetected, currentPose, rawLandmarks, 
    faceLandmarks, poseLandmarks, videoRef, confidence, metrics
  } = useMotion();
  
  const challenge = OFFICIAL_CHALLENGES.find(c => c.id === id);
  const [gameState, setGameState] = useState<'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED'>('LOBBY');
  const [initStep, setInitStep] = useState('BRIEFING');
  const [countdown, setCountdown] = useState(3);
  const [combo, setCombo] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  const getProjectedCoords = (p: any, video: HTMLVideoElement, cW: number, cH: number) => {
    const vW = video.videoWidth || 640;
    const vH = video.videoHeight || 480;
    const videoAspectRatio = vW / vH;
    const canvasAspectRatio = cW / cH;

    let scale, offsetX, offsetY;
    if (canvasAspectRatio > videoAspectRatio) {
      scale = cW / vW;
      offsetX = 0;
      offsetY = (cH - (vH * scale)) / 2;
    } else {
      scale = cH / vH;
      offsetX = (cW - (vW * scale)) / 2;
      offsetY = 0;
    }

    const mirroredX = 1 - p.x;

    return {
      x: (mirroredX * vW * scale) + offsetX,
      y: (p.y * vH * scale) + offsetY
    };
  };

  useEffect(() => {
    if (canvasRef.current && videoRef.current && containerRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const container = containerRef.current;
        if (!canvas || !video || !container) return;

        const rect = container.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const accent = challenge?.accentColor || '#ccff00';
        
        if (rawLandmarks) {
          ctx.strokeStyle = accent;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
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
        }

        if (faceLandmarks) {
          ctx.shadowBlur = 5;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = accent;

          const leftEyeIndices = [33, 160, 158, 133, 153, 144];
          ctx.beginPath();
          leftEyeIndices.forEach((idx, i) => {
            const p = getProjectedCoords(faceLandmarks[idx], video, canvas.width, canvas.height);
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.stroke();

          const rightEyeIndices = [362, 385, 387, 263, 373, 380];
          ctx.beginPath();
          rightEyeIndices.forEach((idx, i) => {
            const p = getProjectedCoords(faceLandmarks[idx], video, canvas.width, canvas.height);
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.stroke();

          const mouthIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
          ctx.beginPath();
          mouthIndices.forEach((idx, i) => {
            const p = getProjectedCoords(faceLandmarks[idx], video, canvas.width, canvas.height);
            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        }

        if (poseLandmarks && faceLandmarks) {
          ctx.lineWidth = 4;
          ctx.strokeStyle = accent;
          ctx.setLineDash([5, 5]);

          const nose = getProjectedCoords(faceLandmarks[1], video, canvas.width, canvas.height);
          const leftShoulder = getProjectedCoords(poseLandmarks[11], video, canvas.width, canvas.height);
          const rightShoulder = getProjectedCoords(poseLandmarks[12], video, canvas.width, canvas.height);
          const neckBase = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };

          ctx.beginPath();
          ctx.moveTo(nose.x, nose.y + 20);
          ctx.lineTo(neckBase.x, neckBase.y);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(leftShoulder.x, leftShoulder.y);
          ctx.lineTo(rightShoulder.x, rightShoulder.y);
          ctx.stroke();

          [leftShoulder, rightShoulder].forEach(p => {
             ctx.beginPath();
             ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
             ctx.fillStyle = accent;
             ctx.fill();
          });
        }
      };

      const frameId = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(frameId);
    }
  }, [rawLandmarks, faceLandmarks, poseLandmarks, challenge]);

  if (!challenge) return null;

  const getStatusDetails = () => {
    if (!isHandDetected) return { label: 'SYNC_LOSS', color: 'bg-brand-danger', shadow: 'shadow-[0_0_15px_#ff3333]', pulse: false };
    if (confidence < 80) return { label: 'SIGNAL_WEAK', color: 'bg-orange-500', shadow: 'shadow-[0_0_15px_#f97316]', pulse: true };
    return { label: 'SYNCED', color: 'bg-brand-accent', shadow: 'shadow-[0_0_15px_#ccff00]', pulse: true };
  };

  const status = getStatusDetails();

  return (
    <div ref={containerRef} className="h-full bg-brand-black relative overflow-hidden select-none flex flex-col items-center">
      <div className="absolute inset-0 z-0">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />
        <div className="absolute inset-0 bg-brand-black/40 backdrop-blur-[2px]" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

      {/* Neural Link Status Indicator */}
      <div className="absolute top-8 left-0 right-0 z-50 flex justify-center px-8 pointer-events-none">
        <motion.div 
          animate={status.pulse ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
          transition={status.pulse ? { repeat: Infinity, duration: 2 } : {}}
          className={`flex items-center gap-4 bg-brand-black/80 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full shadow-2xl transition-all duration-300`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${status.color} ${status.shadow} ${status.pulse ? 'animate-pulse' : ''}`} />
            <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase italic">
              {status.label}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/30 uppercase leading-none mb-0.5">Confidence</span>
            <span className={`text-[10px] font-black italic tracking-tighter ${confidence > 80 ? 'text-brand-accent' : confidence > 50 ? 'text-orange-400' : 'text-brand-danger'}`}>
              {Math.round(confidence)}%
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/30 uppercase leading-none mb-0.5">FPS</span>
            <span className="text-[10px] font-black italic text-white/80">{metrics.fps}</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {initStep === 'BRIEFING' && (
          <motion.div 
            key="brief" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="z-50 w-full max-w-sm px-8 pt-24 h-full flex flex-col items-center justify-center text-center"
          >
             <h1 className="text-4xl font-black italic text-white uppercase mb-4 tracking-tighter">
               Neural Sync
             </h1>
             <p className="text-white/50 text-sm mb-12">Alinhe face e mãos para calibração de rede total.</p>
             <button 
              onClick={() => setInitStep('READY')} 
              className="w-full h-16 bg-brand-accent text-brand-black font-black italic rounded-2xl shadow-2xl"
             >
               INICIAR CALIBRAÇÃO
             </button>
          </motion.div>
        )}

        {initStep === 'READY' && (
           <div className="z-20 h-full flex flex-col items-center justify-center">
             <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="p-10 bg-brand-surface/80 border border-white/10 rounded-[3rem] backdrop-blur-3xl text-center"
             >
                <p className="text-3xl font-black italic text-white mb-2">PRONTO?</p>
                <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest animate-pulse">Sinal Holistic Detectado</p>
                <button 
                  onClick={() => { setInitStep('GAME'); setGameState('PLAYING'); }}
                  className="mt-8 px-12 py-4 bg-brand-accent text-brand-black font-black italic rounded-full"
                >
                  CONECTAR
                </button>
             </motion.div>
           </div>
        )}

        {gameState === 'PLAYING' && (
           <div className="z-20 w-full h-full flex flex-col items-center pt-32 pointer-events-none">
              <h2 className="text-[10rem] font-black italic text-white drop-shadow-2xl leading-none">{combo}</h2>
              <p className="text-sm font-black text-brand-accent tracking-[0.5em] uppercase">Holistic_Sync</p>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RunPage;
