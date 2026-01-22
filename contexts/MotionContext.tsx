
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Pose, Target, HandLandmark } from '../types';
import { PoseClassifier } from '../services/PoseClassifier';
import { TargetMapper } from '../services/TargetMapper';
import { AdaptiveEMA } from '../services/AdaptiveEMA';

interface MotionContextType {
  currentPose: Pose;
  currentTarget: Target;
  isReady: boolean;
  isTracking: boolean;
  isHandDetected: boolean;
  showDebug: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  confidence: number;
  rawLandmarks: HandLandmark[] | null;
  faceLandmarks: any[] | null;
  poseLandmarks: any[] | null;
  metrics: {
    fps: number;
    isHealthy: boolean;
  };
  detailedData: {
    jitter: number;
    wristRotation: number;
    wristFlexion: number;
    flexion: number[];
  };
  startTracking: () => void;
  stopTracking: () => void;
  toggleDebug: () => void;
  isCalibrating: boolean;
}

const MotionContext = createContext<MotionContextType | null>(null);

export function useMotion() {
  const context = useContext(MotionContext);
  if (!context) throw new Error('useMotion must be used within MotionProvider');
  return context;
}

export function MotionProvider({ children }: { children?: React.ReactNode }) {
  const [currentPose, setCurrentPose] = useState<Pose>('OPEN');
  const [currentTarget, setCurrentTarget] = useState<Target>('C');
  const [isReady, setIsReady] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [rawLandmarks, setRawLandmarks] = useState<HandLandmark[] | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<any[] | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<any[] | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const [metrics, setMetrics] = useState({ fps: 0, isHealthy: true });
  const [detailedData, setDetailedData] = useState({
    jitter: 0,
    wristRotation: 0,
    wristFlexion: 0,
    flexion: [0, 0, 0, 0, 0]
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  const classifierRef = useRef(new PoseClassifier());
  const mapperRef = useRef(new TargetMapper());
  const emaRef = useRef(new AdaptiveEMA());

  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const lastWristPosRef = useRef<{x: number, y: number} | null>(null);
  const isInitializingRef = useRef(false);

  const calculateDetailedData = useCallback((landmarks: HandLandmark[]) => {
    const wrist = landmarks[0];
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerMcps = [2, 5, 9, 13, 17];
    
    const flexion = fingerTips.map((tipIdx, i) => {
      const tip = landmarks[tipIdx];
      const mcp = landmarks[fingerMcps[i]];
      const dist = Math.sqrt(Math.pow(tip.x - mcp.x, 2) + Math.pow(tip.y - mcp.y, 2));
      return Math.min(dist * 10, 1);
    });

    let jitter = 0;
    if (lastWristPosRef.current) {
      jitter = Math.sqrt(
        Math.pow(wrist.x - lastWristPosRef.current.x, 2) + 
        Math.pow(wrist.y - lastWristPosRef.current.y, 2)
      );
    }
    lastWristPosRef.current = { x: wrist.x, y: wrist.y };

    const middleMcp = landmarks[9];
    const wristRotation = Math.atan2(middleMcp.y - wrist.y, middleMcp.x - wrist.x) * (180 / Math.PI) + 90;

    return {
      jitter,
      wristRotation,
      wristFlexion: wrist.z || 0,
      flexion
    };
  }, []);

  const onResults = useCallback((results: any) => {
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastFpsUpdateRef.current > 1000) {
      const currentFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
      setMetrics({ fps: currentFps, isHealthy: currentFps > 10 });
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    setFaceLandmarks(results.faceLandmarks || null);
    setPoseLandmarks(results.poseLandmarks || null);

    const handLandmarks = results.rightHandLandmarks || results.leftHandLandmarks;

    if (handLandmarks && handLandmarks.length > 0) {
      const landmarks = handLandmarks as HandLandmark[];
      setIsHandDetected(true);
      setRawLandmarks(landmarks);
      
      const timestamp = performance.now();
      const classification = classifierRef.current.classify(landmarks);
      setConfidence(Math.round(classification.confidence * 100));
      
      const pose = classification.pose !== "UNKNOWN" ? classification.pose : "OPEN";
      const wrist = landmarks[0];
      const smoothedWrist = emaRef.current.smooth(wrist, timestamp);
      const target = mapperRef.current.mapTarget(smoothedWrist);

      setCurrentPose(pose);
      setCurrentTarget(target);
      setDetailedData(calculateDetailedData(landmarks));
    } else {
      setIsHandDetected(false);
      setRawLandmarks(null);
      setCurrentPose('OPEN');
      setCurrentTarget('C');
      setConfidence(0);
    }
  }, [calculateDetailedData]);

  const initializeHolistic = useCallback(async () => {
    if (holisticRef.current || isInitializingRef.current) return;
    isInitializingRef.current = true;
    
    const win = window as any;
    if (!win.Holistic) {
      console.warn("Holistic script not loaded yet.");
      isInitializingRef.current = false;
      return;
    }

    try {
      const holistic = new win.Holistic({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      holistic.onResults(onResults);
      holisticRef.current = holistic;
      setIsReady(true);
      setError(null);
    } catch (err) {
      console.error("Holistic init error:", err);
      setError(err instanceof Error ? err.message : 'Holistic Init Error');
    } finally {
      isInitializingRef.current = false;
    }
  }, [onResults]);

  const startTracking = useCallback(async () => {
    if (isTracking) return;
    const win = window as any;
    
    if (!holisticRef.current) {
      await initializeHolistic();
    }

    try {
      if (videoRef.current && !cameraRef.current && win.Camera) {
        cameraRef.current = new win.Camera(videoRef.current, {
          onFrame: async () => {
            const video = videoRef.current;
            if (video && holisticRef.current && video.readyState >= 2 && video.videoWidth > 0) {
              try {
                await holisticRef.current.send({ image: video });
              } catch (e) {
                console.error("Holistic send error:", e);
                // Don't crash the whole app, but maybe flag unhealthy
                setMetrics(m => ({ ...m, isHealthy: false }));
              }
            }
          },
          width: 640,
          height: 480
        });
        await cameraRef.current.start();
        setIsTracking(true);
      }
    } catch (err) {
      console.error("Camera start error:", err);
      setError("Câmera indisponível ou permissão negada");
    }
  }, [isTracking, initializeHolistic]);

  const stopTracking = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    setIsTracking(false);
    setIsHandDetected(false);
    setRawLandmarks(null);
  }, []);

  const toggleDebug = useCallback(() => setShowDebug(prev => !prev), []);

  useEffect(() => {
    initializeHolistic();
    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (holisticRef.current) holisticRef.current.close();
    };
  }, [initializeHolistic]);

  return (
    <MotionContext.Provider value={{ 
      currentPose, 
      currentTarget, 
      isReady, 
      isTracking,
      isHandDetected,
      showDebug,
      error, 
      videoRef, 
      canvasRef,
      confidence,
      rawLandmarks,
      faceLandmarks,
      poseLandmarks,
      metrics,
      detailedData,
      startTracking,
      stopTracking,
      toggleDebug,
      isCalibrating
    }}>
      {children}
    </MotionContext.Provider>
  );
}
