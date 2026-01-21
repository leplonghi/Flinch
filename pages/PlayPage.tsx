
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { ChallengeType } from '../types';

// Updated PreviewLoop to handle previews based on challenge ID as well as Type
const PreviewLoop: React.FC<{ type: ChallengeType; id: string; color: string }> = ({ type, id, color }) => {
  const checkType = id.toUpperCase();
  
  if (checkType.includes('BLINK')) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-brand-black/50 rounded-2xl overflow-hidden relative border border-white/5">
        <motion.div 
          animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          className="w-12 h-12 rounded-full blur-xl"
          style={{ backgroundColor: color }}
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-6 rounded-full border-2 z-10"
          style={{ borderColor: color }}
        />
      </div>
    );
  }
  if (checkType.includes('HOLD') || checkType.includes('LOCK')) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-brand-black/50 rounded-2xl p-4 gap-2 border border-white/5">
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "anticipate" }}
            className="h-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/20" />)}
        </div>
      </div>
    );
  }
  if (checkType.includes('SNAP') || checkType.includes('LASER') || checkType.includes('CHAOS') || checkType.includes('SWITCH')) {
    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 bg-brand-black/50 rounded-2xl p-3 border border-white/5">
        {[0, 1, 2, 3].map(i => (
          <motion.div 
            key={i}
            animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
            className="rounded-lg"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  }
  // Fallback for general DANCE challenges
  return (
    <div className="w-full h-full flex items-center justify-center bg-brand-black/50 rounded-2xl border border-white/5">
      <motion.div 
        animate={{ rotate: 360, borderRadius: ["20%", "50%", "20%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="w-10 h-10 border-2 border-brand-accent/40"
        style={{ borderColor: color }}
      />
    </div>
  );
};

const PlayPage: React.FC = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="space-y-12 pb-20 pt-4">
      {/* Enhanced Hero */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative px-1"
      >
        <div 
          onClick={() => navigate('/run/blink')}
          className="relative h-72 rounded-[3.5rem] overflow-hidden bg-brand-accent cursor-pointer flex flex-col justify-end p-10 group active:scale-[0.98] transition-transform shadow-[0_30px_60px_-15px_rgba(204,255,0,0.3)]"
        >
          {/* Animated Glow Backdrop */}
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" 
          />
          
          <div className="absolute top-10 right-10">
            <div className="flex items-center gap-2 bg-brand-black/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-white">LIVE_EVENT</span>
            </div>
          </div>
          
          <div className="relative z-10 text-brand-black">
            <h2 className="text-[5.5rem] font-black font-heading leading-[0.75] tracking-tighter mb-4 italic uppercase">
              FLASH<br />POINT
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] bg-brand-black text-brand-accent px-3 py-1">SEASON 01</span>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 italic">Global Grid</span>
            </div>
          </div>

          <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none flex items-center overflow-hidden">
             <motion.p 
               animate={{ x: [0, -1000] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="text-[15rem] font-black italic whitespace-nowrap leading-none"
             >
               FLINCH FLINCH FLINCH FLINCH FLINCH FLINCH FLINCH FLINCH
             </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Modes Grid */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Active Drills</h3>
            <p className="text-sm font-black italic tracking-tight">STRIKE FAST. STAY STEADY.</p>
          </div>
          <div className="w-12 h-0.5 bg-brand-accent/20" />
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          {OFFICIAL_CHALLENGES.map((challenge) => (
            <motion.div key={challenge.id} variants={item}>
              <Card 
                onClick={() => navigate(`/run/${challenge.id}`)}
                className="group p-6 border-white/5 bg-brand-surface/60 backdrop-blur-md hover:bg-brand-muted/80 transition-all duration-300 rounded-[2.5rem]"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-24 h-24 flex-shrink-0">
                    <PreviewLoop type={challenge.type} id={challenge.id} color={challenge.accentColor} />
                  </div>
                  
                  <div className="flex-1 space-