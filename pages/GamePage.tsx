import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useMotion } from '../contexts/MotionContext';
import HUD from '../components/HUD';
import { Target, Challenge, Pose } from '../types';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { VisualFeedback, useScreenShake } from '../components/VisualFeedback';
import { AchievementNotification } from '../components/AchievementNotification';

type PrepStep = 'CAMERA' | 'DETECTION' | 'CALIBRATION' | 'COUNTDOWN' | 'PLAYING';

const TARGET_ANCHORS = {
  C: { x: 0.5, y: 0.55 },
  L: { x: 0.25, y: 0.55 },
  R: { x: 0.75, y: 0.55 },
  U: { x: 0.5, y: 0.32 },
  D: { x: 0.5, y: 0.78 }
};

const GHOST_LEAD_MS = 500;

const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'MID';
  const navigate = useNavigate();
  
  const { isPlaying, gameState, lastHitResult, stopGame, startGame, newAchievement, registerHit } = useGame();
  const { 
    videoRef, 
    canvasRef, 
    startTracking, 
    stopTracking, 
    isReady, 
    isHandDetected,
    rawLandmarks,
    faceLandmarks,
    currentPose,
    confidence
  } = useMotion();

  const [prepStep, setPrepStep] = useState<PrepStep>('CAMERA');
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  
  const challengeDef = useMemo(() => OFFICIAL_CHALLENGES.find(c => c.id === id), [id]);
  const currentChallenge = useMemo(() => {
    if (!challengeDef) return null;
    return {
      id: challengeDef.id,
      name: challengeDef.name,
      description: challengeDef.description,
      icon: '🎯',
      accentColor: challengeDef.accentColor,
      startingHealth: 100,
      totalDurationMs: challengeDef.durationMs,
      bpm: challengeDef.bpm,
      category: challengeDef.category,
      visualAssets: challengeDef.visualAssets,
      steps: challengeDef.choreography.map((c, i) => ({
        id: `${challengeDef.id}_${i}`,
        type: c.type as any,
        startTimeMs: c.timeMs,
        durationMs: c.windowMs,
        pose: c.pose,
        target: c.target,
        windowMs: c.windowMs
      }))
    } as Challenge;
  }, [challengeDef]);

  const { trigger: triggerShake, className: shakeClassName } = useScreenShake();
  const hitRegisteredForStep = useRef<string | null>(null);

  // Ghost state for interpolation
  const [ghostPos, setGhostPos] = useState({ x: 0.5, y: 0.5 });
  const [ghostPose, setGhostPose] = useState<Pose>('OPEN');

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
      stopGame();
    };
  }, []);

  // Monitor preparation flow
  useEffect(() => {
    if (prepStep === 'CAMERA' && isReady) {
      setPrepStep('DETECTION');
    } else if (prepStep === 'DETECTION' && isHandDetected) {
      setPrepStep('CALIBRATION');
    } else if (prepStep === 'DETECTION' && !isHandDetected) {
      // Stay in detection
    } else if (prepStep === 'CALIBRATION') {
      if (isHandDetected && currentPose === 'FIST') {
        setCalibrationProgress(prev => Math.min(100, prev + 2.5));
      } else {
        setCalibrationProgress(prev => Math.max(0, prev - 2));
      }

      if (calibrationProgress >= 100) {
        setPrepStep('COUNTDOWN');
      }
    }
  }, [isReady, isHandDetected, currentPose, prepStep, calibrationProgress]);

  // Countdown logic
  useEffect(() => {
    if (prepStep === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else if (currentChallenge) {
        setPrepStep('PLAYING');
        startGame(currentChallenge, difficulty);
      }
    }
  }, [prepStep, countdown, currentChallenge, startGame, difficulty]);

  // Ghost Guide Synchronization Loop
  useEffect(() => {
    if (!isPlaying || !gameState || !currentChallenge) return;

    const ghostTick = () => {
      const currentTime = gameState.currentTimeMs + GHOST_LEAD_MS;
      
      // Find the step the ghost should be showing/moving towards
      let activeStepIdx = 0;
      for (let i = 0; i < currentChallenge.steps.length; i++) {
        if (currentChallenge.steps[i].startTimeMs > currentTime) {
          activeStepIdx = i;
          break;
        }
        activeStepIdx = i;
      }

      const activeStep = currentChallenge.steps[activeStepIdx];
      const prevStep = activeStepIdx > 0 ? currentChallenge.steps[activeStepIdx - 1] : null;

      if (activeStep) {
        const targetAnchor = TARGET_ANCHORS[activeStep.target];
        const prevAnchor = prevStep ? TARGET_ANCHORS[prevStep.target] : { x: 0.5, y: 0.5 };
        
        // Simple linear interpolation for position
        const startTime = prevStep ? prevStep.startTimeMs : 0;
        const endTime = activeStep.startTimeMs;
        const duration = endTime - startTime;
        const progress = Math.max(0, Math.min(1, (currentTime - startTime) / duration));

        setGhostPos({
          x: prevAnchor.x + (targetAnchor.x - prevAnchor.x) * progress,
          y: prevAnchor.y + (targetAnchor.y - prevAnchor.y) * progress
        });
        setGhostPose(activeStep.pose);
      }
    };

    const interval = setInterval(ghostTick, 16);
    return () => clearInterval(interval);
  }, [isPlaying, gameState, currentChallenge]);

  // Handle Game Over
  useEffect(() => {
    if (prepStep === 'PLAYING' && !isPlaying && gameState && (gameState.health <= 0 || gameState.isGameOver)) {
      const timer = setTimeout(() => {
        navigate(`/result/${currentChallenge?.id}?score=${gameState.score}&combo=${gameState.maxCombo}&type=${currentChallenge?.id}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, gameState, navigate, currentChallenge, prepStep]);

  // Trigger shake on miss
  useEffect(() => {
    if (lastHitResult?.type === 'MISS' || lastHitResult?.type === 'DRIFT') {
      triggerShake();
    }
  }, [lastHitResult, triggerShake]);

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

      // Draw active alvos if playing
      if (isPlaying && gameState && currentChallenge) {
        const step = currentChallenge.steps[gameState.currentStepIndex];
        if (step && step.type !== 'WAIT') {
          const tPos = TARGET_ANCHORS[step.target];
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

          // Hit detection
          if (rawLandmarks && hitRegisteredForStep.current !== step.id) {
            const wrist = getProjectedCoords(rawLandmarks[0], video, canvas.width, canvas.height);
            const dist = Math.sqrt(Math.pow(wrist.x - p.x, 2) + Math.pow(wrist.y - p.y, 2));
            if (dist < 100 && currentPose === step.pose) {
              const timingError = Math.abs(gameState.currentTimeMs - step.startTimeMs);
              let type: any = 'GOOD';
              let score = 50;
              if (timingError < 150) { type = 'PERFECT'; score = 100; }
              else if (timingError > 400) { type = 'DRIFT'; score = 25; }
              hitRegisteredForStep.current = step.id;
              registerHit({ type, timingErrorMs: Math.round(timingError), score, combo: gameState.combo + 1 });
            }
          }
        }
      }

      // Draw skeleton
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

      requestAnimationFrame(draw);
    };

    const frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [rawLandmarks, faceLandmarks, currentChallenge, gameState, isPlaying, currentPose, registerHit]);

  const handleExit = () => {
    stopGame();
    navigate('/play');
  };

  const currentStep = (gameState && currentChallenge) 
    ? currentChallenge.steps[gameState.currentStepIndex] 
    : null;

  // Difficulty style mapping
  const difficultyStyles = useMemo(() => {
    switch(difficulty) {
      case 'EASY': return { contextBrightness: 'brightness-50', ghostOpacity: 0.85 };
      case 'MID': return { contextBrightness: 'brightness-75', ghostOpacity: 0.7 };
      case 'PRO': return { contextBrightness: 'brightness-90', ghostOpacity: 0.55 };
      case 'ELITE': return { contextBrightness: 'brightness-110 contrast-125', ghostOpacity: 0.4 };
      default: return { contextBrightness: 'brightness-75', ghostOpacity: 0.7 };
    }
  }, [difficulty]);

  return (
    <div className={`fixed inset-0 bg-brand-black overflow-hidden select-none touch-none ${shakeClassName}`}>
      {/* Z0: ContextImage Layer */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ${difficultyStyles.contextBrightness}`}>
        {currentChallenge?.visualAssets.contextImage && (
          <img 
            src={currentChallenge.visualAssets.contextImage} 
            className="w-full h-full object-cover" 
            loading="eager" 
            decoding="async"
            onError={(e) => (e.currentTarget.style.display = 'none')}
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Camera Feed Backdrop (Reduced opacity) */}
      <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1] grayscale" autoPlay playsInline muted />
      </div>

      {/* Z1: TargetOverlayImage Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {currentChallenge?.visualAssets.targetOverlayImage && (
          <img 
            src={currentChallenge.visualAssets.targetOverlayImage} 
            className={`w-full h-full object-contain ${difficulty === 'ELITE' ? 'animate-pulse' : ''}`}
            loading="eager" 
            decoding="async"
            onError={(e) => (e.currentTarget.style.display = 'none')}
            alt=""
          />
        )}
      </div>

      {/* Z2: GhostGuideImage Layer */}
      <AnimatePresence>
        {isPlaying && (
          <MotionDiv 
            className="absolute z-20 pointer-events-none"
            animate={{ 
              left: `${ghostPos.x * 100}%`, 
              top: `${ghostPos.y * 100}%`,
              opacity: difficultyStyles.ghostOpacity,
              scale: [1, 1.05, 1]
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 100, scale: { repeat: Infinity, duration: 1 } }}
            style={{ width: '120px', height: '120px', transform: 'translate(-50%, -50%)' }}
          >
            {currentChallenge?.visualAssets.ghostGuideImage && (
              <div className="relative w-full h-full flex flex-col items-center">
                <img 
                  src={currentChallenge.visualAssets.ghostGuideImage} 
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]"
                  loading="eager" 
                  decoding="async"
                  alt=""
                />
                <div className="mt-2 bg-brand-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-brand-accent/30">
                  <span className="text-[10px] font-black italic text-brand-accent uppercase tracking-tighter">
                    {ghostPose}
                  </span>
                </div>
              </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-none" />
      
      {/* Z3: HUD Layer */}
      <VisualFeedback result={lastHitResult} />
      <AchievementNotification achievement={newAchievement} />

      {isPlaying && gameState && (
        <HUD 
          gameState={gameState} 
          currentStep={currentStep} 
          lastResult={lastHitResult}
          challengeName={currentChallenge?.name || 'UNKNOWN_OP'}
        />
      )}

      {/* Z4: Preparation Phase UI */}
      <AnimatePresence>
        {prepStep !== 'PLAYING' && (
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 bg-brand-black/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm flex flex-col items-center gap-12 text-center">
              
              <div className="w-full flex gap-2">
                {['CAMERA', 'DETECTION', 'CALIBRATION', 'COUNTDOWN'].map((s, idx) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    ['CAMERA', 'DETECTION', 'CALIBRATION', 'COUNTDOWN'].indexOf(prepStep) >= idx ? 'bg-brand-accent shadow-[0_0_10px_#ccff00]' : 'bg-white/10'
                  }`} />
                ))}
              </div>

              <div className="space-y-4">
                <MotionSpan 
                  key={prepStep}
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="text-[10px] font-black text-brand-accent uppercase tracking-[0.5em]"
                >
                  SYSTEM_INITIALIZING
                </MotionSpan>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  {prepStep === 'CAMERA' && "Initializing Optics"}
                  {prepStep === 'DETECTION' && "Locating Neural Signature"}
                  {prepStep === 'CALIBRATION' && "Sync Neural Link"}
                  {prepStep === 'COUNTDOWN' && "Neural Link Active"}
                </h2>
              </div>

              {prepStep === 'CAMERA' && (
                <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
              )}

              {prepStep === 'DETECTION' && (
                <div className="space-y-6">
                  <div className="w-32 h-32 border-2 border-white/10 rounded-[2.5rem] flex items-center justify-center relative">
                    <MotionDiv animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 border-2 border-brand-accent/30 rounded-[2.5rem]" />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20"><path d="M12 2v2m0 16v2m10-10h-2M4 10H2m15.66-5.66l-1.42 1.42M7.76 17.66l-1.42 1.42m0-12.01l1.42 1.42m7.9 7.9l1.42 1.42" /></svg>
                  </div>
                  <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Raise your hand into the sensor field</p>
                </div>
              )}

              {prepStep === 'CALIBRATION' && (
                <div className="w-full space-y-8">
                  <div className="relative flex flex-col items-center">
                    <MotionDiv 
                      animate={{ scale: isHandDetected && currentPose === 'FIST' ? 1.1 : 1 }}
                      className={`w-24 h-24 rounded-full border-2 flex items-center justify-center text-4xl transition-colors duration-300 ${isHandDetected && currentPose === 'FIST' ? 'bg-brand-accent text-brand-black border-brand-accent' : 'bg-transparent text-white/20 border-white/10'}`}
                    >
                      ✊
                    </MotionDiv>
                    <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/60">Hold FIST to engage</div>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <MotionDiv 
                      initial={{ width: 0 }}
                      animate={{ width: `${calibrationProgress}%` }}
                      className="h-full bg-brand-accent shadow-[0_0_20px_#ccff00]"
                    />
                  </div>
                </div>
              )}

              {prepStep === 'COUNTDOWN' && (
                <MotionDiv 
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-9xl font-black italic text-brand-accent drop-shadow-[0_0_30px_rgba(204,255,0,0.5)]"
                >
                  {countdown > 0 ? countdown : "GO"}
                </MotionDiv>
              )}

            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Exit button */}
      <button onClick={handleExit} className="fixed top-8 left-8 z-[110] w-12 h-12 rounded-full bg-brand-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-danger transition-all">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>

      {/* Game Over UI */}
      <AnimatePresence>
        {gameState?.isGameOver && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[120] bg-brand-danger/20 backdrop-blur-md flex items-center justify-center">
            <h2 className="text-8xl font-black italic text-brand-danger uppercase tracking-tighter shadow-brand-danger drop-shadow-2xl text-center">LINK_SEVERED</h2>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Global Glitch Overlay (Z50) */}
      {difficulty === 'ELITE' && isPlaying && (
        <div className="fixed inset-0 z-[50] pointer-events-none mix-blend-overlay opacity-10 animate-flicker bg-white" />
      )}
    </div>
  );
};

export default GamePage;