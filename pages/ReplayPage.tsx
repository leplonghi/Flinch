
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { firestoreService, RunData } from '../services/firestore';
import { ReplayFrame } from '../types';

const ReplayPage: React.FC = () => {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<RunData | null>(null);
  const [frame, setFrame] = useState<ReplayFrame | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (runId) firestoreService.getRun(runId).then(setRun);
  }, [runId]);

  useEffect(() => {
    if (!run?.replayLog?.fullLog) return;
    const log = run.replayLog.fullLog as ReplayFrame[];
    let idx = 0;
    
    const interval = setInterval(() => {
      if (idx >= log.length) {
        idx = 0; // Loop
        return;
      }
      setFrame(log[idx]);
      idx++;
    }, 16); // ~60fps logic
    
    return () => clearInterval(interval);
  }, [run]);

  if (!run || !frame) return null;

  return (
    <div className="fixed inset-0 bg-brand-black z-[100] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[360px] aspect-[9/16] bg-brand-muted rounded-[3rem] relative overflow-hidden border-2 border-white/5 shadow-2xl">
         {/* Ghost Reconstruction */}
         <div className="absolute w-20 h-20 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center"
              style={{ 
                left: `${frame.targetPos.x * 100}%`, 
                top: `${frame.targetPos.y * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}>
            <span className="text-[8px] text-white/20">{frame.targetPose}</span>
         </div>

         {/* Player Reconstruction */}
         <div className="absolute w-16 h-16 bg-brand-accent/30 border border-brand-accent rounded-full flex items-center justify-center"
              style={{ 
                left: `${frame.userPos.x * 100}%`, 
                top: `${frame.userPos.y * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}>
            <span className="text-[8px] font-black text-brand-accent">{frame.userPose}</span>
         </div>

         {/* Overlay Info */}
         <div className="absolute bottom-10 w-full text-center px-6">
            <h3 className="text-4xl font-black italic text-brand-accent">{run.score} PTS</h3>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">STABILITY REPLAY</p>
         </div>

         {/* CRT Lines Effect */}
         <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-10 bg-[length:100%_4px]" />
      </div>

      <div className="mt-10 flex gap-4 w-full max-w-sm">
        <button onClick={() => navigate(-1)} className="flex-1 bg-white/10 py-4 rounded-2xl font-black italic">EXIT</button>
        <button className="flex-1 bg-brand-accent text-brand-black py-4 rounded-2xl font-black italic">EXPORT CLIP</button>
      </div>
    </div>
  );
};

export default ReplayPage;
