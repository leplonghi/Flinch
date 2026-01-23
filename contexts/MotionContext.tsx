
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Pose, Target, Point } from '../types';

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
  wristFlexion: number;
}

interface MotionContextType {
  isCameraActive: boolean;
  isReady: boolean;
  confidence: number;
  isHandDetected: boolean;
  currentPose: Pose;
  currentTarget: Target;
  rawLandmarks: any[] | null; 
  faceLandmarks: any[] | null;
  poseLandmarks: any[] | null;
  normalizedWrist: Point; // Adicionado para facilitar migração Antigravity
  metrics: { fps: number; stability: number; isHealthy: boolean };
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  showDebug: boolean;
  toggleDebug: () => void;
  trackingError: string | null;
  isCalibrating: boolean;
  // Fix: Add missing detailedData property
  detailedData: DetailedHandData;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [currentPose, setCurrentPose] = useState<Pose>("OPEN");
  const [currentTarget, setCurrentTarget] = useState<Target>("C");
  const [rawLandmarks, setRawLandmarks] = useState<any[] | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<any[] | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<any[] | null>(null);
  const [normalizedWrist, setNormalizedWrist] = useState<Point>({ x: 0.5, y: 0.5 });
  const [showDebug, setShowDebug] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [metrics, setMetrics] = useState({ fps: 0, stability: 0, isHealthy: false });
  
  // Fix: Add detailedData state
  const [detailedData, setDetailedData] = useState<DetailedHandData>({
    flexion: [0, 0, 0, 0, 0],
    wristRotation: 0,
    isFlat: false,
    spread: 0,
    jitter: 0,
    wristFlexion: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const fpsEMA = useRef(new EMA(0.1));
  const lastFrameTime = useRef(performance.now());
  const lastUpdateRef = useRef(0);

  const onResults = (results: any) => {
    const now = performance.now();
    const dt = now - lastFrameTime.current;
    lastFrameTime.current = now;
    const smoothFps = fpsEMA.current.update(1000 / dt);

    if (now - lastUpdateRef.current < 16) return;
    lastUpdateRef.current = now;

    if (!isReady) setIsReady(true);

    let currentConfidence = 0;
    let handFound = false;
    let detectedPose: Pose = "OPEN";
    let detectedTarget: Target = "C";

    if (results.rightHandLandmarks) {
      handFound = true;
      const wrist = results.rightHandLandmarks[0];
      setNormalizedWrist({ x: 1 - wrist.x, y: wrist.y }); // Normaliza para o CoreEngine
      
      const index = results.rightHandLandmarks[8];
      const thumb = results.rightHandLandmarks[4];
      const indexTip = results.rightHandLandmarks[8];
      
      const isPointing = index.y < results.rightHandLandmarks[6].y && results.rightHandLandmarks[12].y > results.rightHandLandmarks[10].y;
      const distThumbIndex = Math.sqrt(Math.pow(thumb.x - indexTip.x, 2) + Math.pow(thumb.y - indexTip.y, 2));
      const isPinching = distThumbIndex < 0.05;
      
      const middleFolded = results.rightHandLandmarks[12].y > results.rightHandLandmarks[10].y;
      const ringFolded = results.rightHandLandmarks[16].y > results.rightHandLandmarks[14].y;
      const pinkyFolded = results.rightHandLandmarks[20].y > results.rightHandLandmarks[18].y;
      const isFist = index.y > results.rightHandLandmarks[6].y && middleFolded && ringFolded && pinkyFolded;

      if (isPinching) detectedPose = "PINCH";
      else if (isPointing) detectedPose = "POINT";
      else if (isFist) detectedPose = "FIST";
      else detectedPose = "OPEN";

      if (wrist.x < 0.35) detectedTarget = "R";
      else if (wrist.x > 0.65) detectedTarget = "L";
      else if (wrist.y < 0.35) detectedTarget = "U";
      else if (wrist.y > 0.65) detectedTarget = "D";
      else detectedTarget = "C";
      
      currentConfidence = 98;

      // Fix: Update detailed data with calculated/placeholder values
      const thumbFlex = results.rightHandLandmarks[4].y > results.rightHandLandmarks[2].y ? 1 : 0;
      const indexFlex = results.rightHandLandmarks[8].y > results.rightHandLandmarks[6].y ? 1 : 0;
      const middleFlex = results.rightHandLandmarks[12].y > results.rightHandLandmarks[10].y ? 1 : 0;
      const ringFlex = results.rightHandLandmarks[16].y > results.rightHandLandmarks[14].y ? 1 : 0;
      const pinkyFlex = results.rightHandLandmarks[20].y > results.rightHandLandmarks[18].y ? 1 : 0;

      setDetailedData({
        flexion: [thumbFlex, indexFlex, middleFlex, ringFlex, pinkyFlex],
        wristRotation: (results.rightHandLandmarks[0].x - results.rightHandLandmarks[9].x) * 100,
        isFlat: !isFist,
        spread: Math.abs(results.rightHandLandmarks[4].x - results.rightHandLandmarks[20].x),
        jitter: Math.random() * 0.002, // Simulating jitter for debug
        wristFlexion: results.rightHandLandmarks[0].y - results.rightHandLandmarks[9].y
      });
    }

    setIsHandDetected(handFound);
    setRawLandmarks(results.rightHandLandmarks || null);
    setCurrentPose(detectedPose);
    setCurrentTarget(detectedTarget);
    setConfidence(currentConfidence);
    setFaceLandmarks(results.faceLandmarks || null);
    setPoseLandmarks(results.poseLandmarks || null);

    setMetrics({
      fps: Math.round(smoothFps),
      stability: currentConfidence,
      isHealthy: smoothFps > 15
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
          modelComplexity: 0,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        holisticRef.current.onResults(onResults);
      }

      if (!cameraRef.current && videoRef.current) {
        cameraRef.current = new win.Camera(videoRef.current, {
          onFrame: async () => {
            if (holisticRef.current && videoRef.current) {
               await holisticRef.current.send({ image: videoRef.current });
            }
          },
          width: 640, height: 480
        });
        await cameraRef.current.start();
        setIsCameraActive(true);
      }
    } catch (err) {
      setTrackingError("CAMERA_FAIL");
    }
  };

  const stopTracking = () => {
    if (cameraRef.current) cameraRef.current.stop();
    cameraRef.current = null;
    setIsCameraActive(false);
    setIsReady(false);
  };

  return (
    <MotionContext.Provider value={{ 
      isCameraActive, isReady, confidence, isHandDetected, currentPose, currentTarget, rawLandmarks,
      faceLandmarks, poseLandmarks, normalizedWrist, metrics,
      startTracking, stopTracking, videoRef, canvasRef, showDebug,
      toggleDebug: () => setShowDebug(prev => !prev),
      trackingError,
      isCalibrating,
      // Fix: provide detailedData in context
      detailedData
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
