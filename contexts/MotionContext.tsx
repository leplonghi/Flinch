
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Pose, Target } from '../types';

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

interface MotionContextType {
  isCameraActive: boolean;
  confidence: number;
  isHandDetected: boolean;
  isTrackingLost: boolean;
  currentPose: Pose;
  handPos: { x: number, y: number }; // Normalized 0-1
  isCalibrating: boolean;
  showVideoPreview: boolean;
  setShowVideoPreview: (show: boolean) => void;
  metrics: { intensity: number; stability: number; quality: number; isHealthy: boolean };
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  startCalibration: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [isTrackingLost, setIsTrackingLost] = useState(false);
  const [currentPose, setCurrentPose] = useState<Pose>("OPEN");
  const [handPos, setHandPos] = useState({ x: 0.5, y: 0.5 });
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [metrics, setMetrics] = useState({ intensity: 0, stability: 0, quality: 1, isHealthy: false });

  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  const posXEMA = useRef(new EMA(0.3));
  const posYEMA = useRef(new EMA(0.3));
  const confidenceEMA = useRef(new EMA(0.05));

  const classifyPose = (landmarks: any[]): Pose => {
    const getDist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    
    // Distâncias dos dedos em relação à base da palma (landmark 0)
    const palmBase = landmarks[0];
    const tips = [8, 12, 16, 20].map(i => getDist(landmarks[i], palmBase));
    const avgTipDist = tips.reduce((a, b) => a + b, 0) / 4;
    
    // Pinch: Distância entre polegar (4) e indicador (8)
    const pinchDist = getDist(landmarks[4], landmarks[8]);
    if (pinchDist < 0.05) return "PINCH";
    
    // Fist: Dedos muito próximos da base
    if (avgTipDist < 0.2) return "FIST";
    
    // Point: Apenas indicador longe
    const indexDist = getDist(landmarks[8], palmBase);
    const othersClose = [12, 16, 20].every(i => getDist(landmarks[i], palmBase) < 0.25);
    if (indexDist > 0.3 && othersClose) return "POINT";
    
    return "OPEN";
  };

  const onResults = (results: any) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setIsHandDetected(true);
      setIsTrackingLost(false);
      
      const landmarks = results.multiHandLandmarks[0];
      const wrist = landmarks[0];
      
      // Update normalized position (mirrored)
      const nx = posXEMA.current.update(1 - wrist.x);
      const ny = posYEMA.current.update(wrist.y);
      setHandPos({ x: nx, y: ny });
      
      // Update Pose
      setCurrentPose(classifyPose(landmarks));
      
      const rawScore = results.multiHandedness[0]?.score || 0;
      const smoothConf = confidenceEMA.current.update(rawScore * 100);
      setConfidence(Math.round(smoothConf));
      setMetrics(m => ({ ...m, isHealthy: smoothConf > 45, quality: smoothConf / 100 }));
    } else {
      setIsHandDetected(false);
      setConfidence(prev => Math.max(0, prev - 2));
    }
  };

  const startTracking = async () => {
    const win = window as any;
    if (!win.Hands) return;
    if (!handsRef.current) {
      handsRef.current = new win.Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
      handsRef.current.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.4, minTrackingConfidence: 0.4 });
      handsRef.current.onResults(onResults);
    }
    if (!cameraRef.current && videoRef.current) {
      cameraRef.current = new win.Camera(videoRef.current, {
        onFrame: async () => handsRef.current && await handsRef.current.send({ image: videoRef.current }),
        width: 640, height: 480
      });
      await cameraRef.current.start();
      setIsCameraActive(true);
    }
  };

  const stopTracking = () => {
    if (cameraRef.current) cameraRef.current.stop();
    cameraRef.current = null;
    setIsCameraActive(false);
    setIsHandDetected(false);
  };

  return (
    <MotionContext.Provider value={{ 
      isCameraActive, confidence, isHandDetected, isTrackingLost, currentPose, handPos,
      isCalibrating, showVideoPreview, setShowVideoPreview, metrics,
      startTracking, stopTracking, startCalibration: () => setIsCalibrating(true),
      videoRef
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
