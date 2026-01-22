
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Pose } from '../types';

class EMA {
  private value: number | null = null;
  constructor(private alpha: number = 0.15) {}
  update(next: number): number {
    if (this.value === null) this.value = next;
    else this.value = this.alpha * next + (1 - this.alpha) * this.value;
    return this.value;
  }
  get(): number { return this.value || 0; }
}

export interface DetailedHandData {
  flexion: number[];
  wristRotation: number;
  isFlat: boolean;
  spread: number;
  jitter: number;
}

interface MotionContextType {
  isCameraActive: boolean;
  confidence: number;
  isHandDetected: boolean;
  currentPose: Pose;
  rawLandmarks: any[] | null; // Right Hand
  faceLandmarks: any[] | null;
  poseLandmarks: any[] | null;
  detailedData: DetailedHandData;
  metrics: { fps: number; stability: number; isHealthy: boolean };
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showDebug: boolean;
  toggleDebug: () => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [currentPose, setCurrentPose] = useState<Pose>("OPEN");
  const [rawLandmarks, setRawLandmarks] = useState<any[] | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<any[] | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<any[] | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [detailedData, setDetailedData] = useState<DetailedHandData>({ 
    flexion: [0,0,0,0,0], wristRotation: 0, isFlat: true, spread: 0, jitter: 0 
  });
  const [metrics, setMetrics] = useState({ fps: 0, stability: 0, isHealthy: false });

  const videoRef = useRef<HTMLVideoElement>(null);
  const holisticRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const fpsEMA = useRef(new EMA(0.1));
  const lastFrameTime = useRef(performance.now());
  const lastHandPoints = useRef<any[] | null>(null);

  const onResults = (results: any) => {
    const now = performance.now();
    const dt = now - lastFrameTime.current;
    lastFrameTime.current = now;
    const smoothFps = fpsEMA.current.update(1000 / dt);

    // Mão Direita (Principal para o FLINCH)
    if (results.rightHandLandmarks) {
      setIsHandDetected(true);
      setRawLandmarks(results.rightHandLandmarks);
      // Simulação simplificada de pose para manter compatibilidade
      const wrist = results.rightHandLandmarks[0];
      const index = results.rightHandLandmarks[8];
      const isPointing = index.y < results.rightHandLandmarks[6].y;
      setCurrentPose(isPointing ? "POINT" : "OPEN");
      setConfidence(95);
    } else {
      setIsHandDetected(false);
      setRawLandmarks(null);
    }

    // Face e Pose (Corpo)
    setFaceLandmarks(results.faceLandmarks || null);
    setPoseLandmarks(results.poseLandmarks || null);

    setMetrics({
      fps: Math.round(smoothFps),
      stability: 100,
      isHealthy: true
    });
  };

  const startTracking = async () => {
    const win = window as any;
    if (!win.Holistic || !win.Camera) return;
    
    try {
      if (!holisticRef.current) {
        holisticRef.current = new win.Holistic({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
        });
        holisticRef.current.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        holisticRef.current.onResults(onResults);
      }

      if (!cameraRef.current && videoRef.current) {
        cameraRef.current = new win.Camera(videoRef.current, {
          onFrame: async () => holisticRef.current && await holisticRef.current.send({ image: videoRef.current }),
          width: 640, height: 480
        });
        await cameraRef.current.start();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Holistic init error:", err);
    }
  };

  const stopTracking = () => {
    if (cameraRef.current) cameraRef.current.stop();
    cameraRef.current = null;
    setIsCameraActive(false);
  };

  return (
    <MotionContext.Provider value={{ 
      isCameraActive, confidence, isHandDetected, currentPose, rawLandmarks,
      faceLandmarks, poseLandmarks, detailedData, metrics,
      startTracking, stopTracking, videoRef, showDebug,
      toggleDebug: () => setShowDebug(prev => !prev)
    }}>
      {children}
    </MotionContext.Provider>
  );
};

export const useMotion = () => {
  const context = useContext(MotionContext);
  if (!context) throw new Error('useMotion error');
  return context;
};
