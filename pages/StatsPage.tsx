import React from 'react';
import { motion } from 'framer-motion';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import type { PlayerProgress } from '../types';

interface StatsPageProps {
  progress: PlayerProgress;
  onClose: () => void;
}

const MotionDiv = motion.div as any;

export function StatsPage({ progress, onClose }: StatsPageProps) {
  const { stats, mastery } = progress;
  const totalHits = stats.totalHits || 0;
  
  const accuracy = totalHits > 0 
    ? ((stats.perfectHits / totalHits) * 100).toFixed(1)
    : '0.0';

  const totalPlayTimeHours = (stats.totalPlayTimeMs / (1000 * 60 * 60)).toFixed(1);

  return (
    <MotionDiv 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-black z-[150] overflow-y-auto scrollbar-hide flex flex-col"
    >
      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-12 flex flex-col gap-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic text-brand-accent uppercase tracking-tighter">
              STATISTICS
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operational Insights</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Top Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Runs" value={progress.runsCompleted.toString()} accent />
          <StatCard label="Level" value={progress.level.toString()} />
          <StatCard label="Accuracy" value={`${accuracy}%`} />
          <StatCard label="Play Time" value={`${totalPlayTimeHours}h`} />
        </div>

        {/* Performance Graph */}
        <MotionDiv 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-surface/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md"
        >
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">Performance Distribution</h2>
          <div className="space-y-6">
            <PerformanceBar
              label="PERFECT"
              value={stats.perfectHits}
              max={totalHits}
              color="#ccff00"
            />
            <PerformanceBar
              label="GOOD"
              value={stats.totalGoods}
              max={totalHits}
              color="#00d4ff"
            />
            <PerformanceBar
              label="MISS"
              value={stats.totalMisses}
              max={totalHits}
              color="#ff3333"
            />
          </div>
        </MotionDiv>

        {/* Mastery List */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] px-2">Sector Mastery</h2>
          <div className="space-y-4">
            {OFFICIAL_CHALLENGES.map((challenge, idx) => {
              const m = mastery?.[challenge.id] || { runs: 0, perfectRuns: 0 };
              return (
                <MotionDiv 
                  key={challenge.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (idx * 0.05) }}
                  className="bg-brand-surface/20 border border-white/5 p-5 rounded-3xl flex items-center gap-5 group"
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-brand-black border border-white/10 transition-colors"
                    style={{ color: challenge.accentColor }}
                  >
                    {challenge.category[0]}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black italic uppercase tracking-tighter text-white/80">{challenge.name.split(' · ')[1]}</span>
                      <span className="text-[10px] font-black text-white/20 uppercase">{m.runs} Runs</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <MotionDiv
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((m.runs / 10) * 100, 100)}%` }}
                        className="h-full"
                        style={{ backgroundColor: challenge.accentColor }}
                      />
                    </div>
                  </div>
                  {m.perfectRuns > 0 && (
                    <div className="text-brand-accent text-xl animate-pulse">👑</div>
                  )}
                </MotionDiv>
              );
            })}
          </div>
        </div>
        
        <footer className="py-12 flex justify-center opacity-10">
           <span className="text-[10px] font-black uppercase tracking-[1em]">Flinch Network</span>
        </footer>
      </div>
    </MotionDiv>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-brand-surface/40 border border-white/5 p-6 rounded-[2rem] text-center space-y-1">
      <div className={`text-3xl font-black font-heading italic ${accent ? 'text-brand-accent' : 'text-white'}`}>{value}</div>
      <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function PerformanceBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black italic" style={{ color }}>{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full shadow-[0_0_10px_currentColor]"
          style={{ backgroundColor: color, color }}
        />
      </div>
    </div>
  );
}