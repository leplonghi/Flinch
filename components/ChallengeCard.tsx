
import React from 'react';
import { motion } from 'framer-motion';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  masteryXp?: number;
  onClick: () => void;
  isSelected?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, masteryXp = 0, onClick, isSelected }) => {
  const level = Math.floor(Math.sqrt(masteryXp / 100)) + 1;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-pointer rounded-[2.5rem] p-6 transition-all duration-300 border-2
        ${isSelected 
          ? 'bg-brand-muted border-brand-accent shadow-[0_20px_50px_rgba(204,255,0,0.2)]' 
          : 'bg-brand-surface/40 border-white/5 hover:border-white/20 hover:bg-brand-surface/60'}
      `}
    >
      {/* Background Glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-20"
        style={{ backgroundColor: challenge.accentColor }}
      />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span 
              className="text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider text-black"
              style={{ backgroundColor: challenge.accentColor }}
            >
              {challenge.category}
            </span>
            {masteryXp > 0 && (
              <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest">
                LVL {level} MASTERED
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black font-heading italic uppercase tracking-tighter text-white mt-1">
            {challenge.name}
          </h3>
        </div>
        <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {challenge.icon}
        </span>
      </div>

      <p className="text-xs text-white/40 mt-3 font-medium line-clamp-2 pr-4">
        {challenge.description}
      </p>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase">Frequency</span>
            <span className="text-xs font-black text-white/80">{challenge.bpm} BPM</span>
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase">Reward</span>
            <span className="text-xs font-black text-brand-accent">+500 XP</span>
          </div>
        </div>

        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: isSelected ? challenge.accentColor : 'rgba(255,255,255,0.05)', color: isSelected ? 'black' : 'white' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;
