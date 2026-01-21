
import React from 'react';
import { motion } from 'framer-motion';
import { useMotion } from '../../contexts/MotionContext';

const HandTrackerOverlay: React.FC = () => {
  const { isCameraActive, isHandDetected, confidence, trackingError, isCalibrating } = useMotion();

  if (!isCameraActive && !trackingError) return null;

  return (
    <div className="fixed top-24 left-0 right-0 flex justify-center z-40 pointer-events-none px-6">
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`bg-brand-black/60 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3 flex items-center gap-3 shadow-2xl transition-colors duration-500`}
      >
        <div className={`w-2 h-2 rounded-full ${isHandDetected ? 'bg-brand-accent animate-pulse' : 'bg-brand-danger'}`} />
        <span className="text-[10px] font-black tracking-[0.2em] text-white/80 uppercase">
          {trackingError ? 'CAMERA ERROR' : isCalibrating ? 'STABILIZING' : isHandDetected ? 'HAND LINKED' : 'SEARCHING'}
        </span>
        {isHandDetected && !isCalibrating && (
          <span className="text-[10px] font-black text-brand-accent">{confidence}%</span>
        )}
      </motion.div>
    </div>
  );
};

export default HandTrackerOverlay;
