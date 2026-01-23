import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { Pose, ChallengeDefinition } from '../types';
import { useGame } from '../contexts/GameContext';
import { StatsPage } from './StatsPage';

const MotionSection = motion.section as any;
const MotionDiv = motion.div as any;

const PoseIcon: React.FC<{ pose: Pose; size?: string; color?: string }> = ({ pose, size = "w-4 h-4", color = "currentColor" }) => {
  switch (pose) {
    case 'FIST':
      return <svg className={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M16 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M8 10V8a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M18 13V9a2 2 0 0 0-2-2v0M18 13a6 6 0 0 1-6 6H8.5L5 15.5a2 2 0 0 1 2.83-2.82l2.17 2.17" /></svg>;
    case 'POINT':
      return <svg className={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13V6a2 2 0 0 1 4 0v7M18 11V9a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15M14 11V9a2 2 0 1 1 4 0" /></svg>;
    case 'OPEN':
      return <svg className={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15M6 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /></svg>;
    case 'WAVE':
      return <svg className={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0M10 10.5V6a2 2 0 0 0-2-2v0M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>;
    default: return null;
  }
};

const PlayPage: React.FC = () => {
  const navigate = useNavigate();
  const { playerProgress } = useGame();
  const [showStats, setShowStats] = useState(false);

  const handleChallengeSelect = (challengeDef: ChallengeDefinition) => {
    // Navigate with difficulty info
    navigate(`/run/${challengeDef.id}?difficulty=${challengeDef.difficulty}`);
  };

  return (
    <div className="space-y-12 pb-20 pt-4">
      <MotionSection 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative px-1"
      >
        <div 
          onClick={() => handleChallengeSelect(OFFICIAL_CHALLENGES[0])}
          className="relative h-72 rounded-[3.5rem] overflow-hidden bg-brand-accent cursor-pointer flex flex-col justify-end p-10 group active:scale-[0.98] transition-transform shadow-[0_30px_60px_-15px_rgba(204,255,0,0.3)]"
        >
          <div className="absolute top-10 right-10">
            <div className="flex items-center gap-2 bg-brand-black/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-white">EVENTO_ATIVO</span>
            </div>
          </div>
          
          <div className="relative z-10 text-brand-black">
            <h2 className="text-[5rem] font-black font-heading leading-[0.75] tracking-tighter mb-4 italic uppercase">
              FLASH<br />POINT
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] bg-brand-black text-brand-accent px-3 py-1">TEMPORADA 01</span>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 italic">Global Grid</span>
            </div>
          </div>
        </div>
      </MotionSection>

      <section className="space-y-8">
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Operações Disponíveis</h3>
            <p className="text-sm font-black italic tracking-tight uppercase">Selecione seu vetor de ataque</p>
          </div>
          <button 
            onClick={() => setShowStats(true)}
            className="px-4 py-2 border-2 border-brand-accent/30 text-brand-accent text-[10px] font-black italic uppercase rounded-xl hover:bg-brand-accent/10 transition-colors"
          >
            Stats
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {OFFICIAL_CHALLENGES.map((challenge) => (
            <MotionDiv 
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card 
                onClick={() => handleChallengeSelect(challenge)}
                className="group p-0 overflow-hidden border-white/5 bg-brand-surface/40 backdrop-blur-md hover:bg-brand-muted/80 transition-all duration-300 rounded-[2.5rem]"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider bg-brand-black`} style={{ color: challenge.accentColor }}>
                           {challenge.category}
                         </span>
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{challenge.difficulty} TIER</span>
                      </div>
                      <h4 className="text-2xl font-black font-heading tracking-tighter group-hover:text-brand-accent transition-colors italic uppercase">
                        {challenge.name.split(' · ')[1]}
                      </h4>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-white/20 uppercase">Reward</p>
                       <p className="text-sm font-black text-brand-accent">+{challenge.xpReward} XP</p>
                    </div>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed font-medium pr-4">
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-4 items-center">
                       <div className="flex -space-x-1">
                          {challenge.posesRequired.map(pose => (
                            <div key={pose} className="w-7 h-7 rounded-full bg-brand-black border border-white/10 flex items-center justify-center text-white/40 group-hover:text-brand-accent transition-colors">
                              <PoseIcon pose={pose} size="w-3.5 h-3.5" />
                            </div>
                          ))}
                       </div>
                       <div className="h-4 w-px bg-white/10" />
                       <div className="flex flex-col">
                          <span className="text-[8px] text-white/20 font-black uppercase">Frequência</span>
                          <span className="text-[10px] font-black text-white/80 tracking-tighter">{challenge.bpm} BPM</span>
                       </div>
                    </div>
                    
                    <div className="bg-brand-accent/10 p-2.5 rounded-full group-hover:bg-brand-accent group-hover:text-brand-black transition-all">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </section>

      <footer className="px-2 py-10 opacity-10 flex flex-col items-center">
         <h1 className="text-4xl font-black italic tracking-tighter text-white">FLINCH</h1>
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Global Reaction Network</p>
      </footer>

      <AnimatePresence>
        {showStats && (
          <StatsPage 
            progress={playerProgress} 
            onClose={() => setShowStats(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayPage;