
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useMotion } from '../contexts/MotionContext';
import HUD from '../components/HUD';
import { Target } from '../types';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPlaying, gameState, lastHitResult, stopGame, currentChallenge } = useGame();
  const { 
    videoRef, 
    canvasRef, 
    startTracking, 
    stopTracking, 
    isReady, 
    rawLandmarks,
    faceLandmarks
  } = useMotion();

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
      if (isPlaying) stopGame();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying && gameState && (gameState.health <= 0 || gameState.isGameOver)) {
      const timer = setTimeout(() => {
        navigate(`/result/${currentChallenge?.id}?score=${gameState.score}&combo=${gameState.maxCombo}&type=${currentChallenge?.id}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, gameState, navigate, currentChallenge]);

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

  const getTargetPos = (target: Target) => {
    switch (target) {
      case 'C': return { x: 0.5, y: 0.5 };
      case 'L': return { x: 0.2, y: 0.5 };
      case 'R': return { x: 0.8, y: 0.5 };
      case 'U': return { x: 0.5, y: 0.2 };
      case 'D': return { x: 0.5, y: 0.8 };
      default: return { x: 0.5, y: 0.5 };
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent = currentChallenge?.accentColor || '#ccff00';

      // Desenhar Alvos do Jogo
      if (gameState && currentChallenge) {
        const step = currentChallenge.steps[gameState.currentStepIndex];
        if (step && step.type !== 'WAIT') {
          const tPos = getTargetPos(step.target);
          const p = getProjectedCoords(tPos, video, canvas.width, canvas.height);
          
          const pulse = Math.sin(Date.now() / 150) * 10;
          ctx.shadowBlur = 30 + pulse;
          ctx.shadowColor = accent;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 6;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, 70 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = `${accent}15`;
          ctx.fill();
        }
      }

      // Desenhar Tracking da Mão
      if (rawLandmarks) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
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
      }

      requestAnimationFrame(draw);
    };

    const frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [rawLandmarks, faceLandmarks, currentChallenge, gameState]);

  const handleExit = () => {
    stopGame();
    navigate('/play');
  };

  const currentStep = (gameState && currentChallenge) 
    ? currentChallenge.steps[gameState.currentStepIndex] 
    : null;

  return (
    <div className="fixed inset-0 bg-brand-black overflow-hidden select-none touch-none">
      <div className="absolute inset-0 z-0">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1] opacity-30" autoPlay playsInline muted />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none" />

      {gameState && (
        <HUD 
          gameState={gameState} 
          currentStep={currentStep} 
          lastResult={lastHitResult}
          challengeName={currentChallenge?.name || 'UNKNOWN_OP'}
        />
      )}

      <button onClick={handleExit} className="fixed top-8 left-8 z-[60] w-12 h-12 rounded-full bg-brand-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-danger transition-all">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>

      <AnimatePresence>
        {gameState?.isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-brand-danger/20 backdrop-blur-md flex items-center justify-center">
            <h2 className="text-8xl font-black italic text-brand-danger uppercase tracking-tighter shadow-brand-danger drop-shadow-2xl">LINK_SEVERED</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {!isReady && (
        <div className="fixed inset-0 z-[101] bg-brand-black flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em] animate-pulse">Initializing Neural Link...</p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
