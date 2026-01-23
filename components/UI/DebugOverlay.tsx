import React from 'react';
import { motion } from 'framer-motion';
import { useMotion } from '../../contexts/MotionContext';

const MotionDiv = motion.div as any;

const DebugOverlay: React.FC = () => {
  const { metrics, currentPose, confidence, isHandDetected, showDebug, detailedData } = useMotion();

  if (!showDebug) return null;

  const data = [
    { label: 'Neural_FPS', value: metrics.fps, color: metrics.fps > 28 ? 'text-brand-accent' : 'text-brand-danger' },
    { label: 'Signal_Conf', value: `${confidence}%`, color: confidence > 50 ? 'text-brand-accent' : 'text-orange-500' },
    { label: 'Jitter_Var', value: detailedData.jitter.toFixed(5), color: detailedData.jitter < 0.005 ? 'text-brand-accent' : 'text-brand-danger' },
    { label: 'Pose_ID', value: currentPose, color: 'text-brand-accent' },
    { label: 'Wrist_Roll', value: `${Math.round(detailedData.wristRotation)}°`, color: 'text-white' },
    { label: 'Wrist_Flex', value: detailedData.wristFlexion.toFixed(2), color: 'text-white' },
  ];

  const fingerNames = ['T', 'I', 'M', 'R', 'P'];

  return (
    <MotionDiv
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-24 right-4 z-[100] bg-brand-black/95 border-2 border-white/10 p-5 rounded-[2rem] backdrop-blur-3xl shadow-2xl pointer-events-none w-48 font-mono"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${metrics.isHealthy ? 'bg-brand-accent animate-pulse' : 'bg-brand-danger'}`} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Bio_Link_v2</span>
          </div>
          <span className="text-[8px] text-white/20">LIVE</span>
        </div>

        {/* Core Metrics */}
        <div className="space-y-1.5">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-[10px]">
              <span className="text-white/30 uppercase font-black text-[8px]">{item.label}</span>
              <span className={`font-black italic ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Finger Flexion Visualizer */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Digital_Flexion</p>
          <div className="flex justify-between items-end h-12 gap-1 px-1">
            {detailedData.flexion.map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-white/5 rounded-full h-8 relative overflow-hidden">
                  <MotionDiv 
                    initial={false}
                    animate={{ height: `${val * 100}%` }}
                    className={`absolute bottom-0 left-0 right-0 ${val > 0.8 ? 'bg-brand-accent' : 'bg-white/40'}`}
                  />
                </div>
                <span className="text-[7px] font-black text-white/30">{fingerNames[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Alert */}
        {!isHandDetected && (
          <div className="bg-brand-danger/20 border border-brand-danger/40 p-2 rounded-xl text-center">
             <p className="text-[8px] font-black text-brand-danger uppercase animate-pulse">Sync_Interrupted</p>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

export default DebugOverlay;