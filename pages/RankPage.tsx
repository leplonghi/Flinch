
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { firestoreService, RunData } from '../services/firestore';
import { OFFICIAL_CHALLENGES } from '../data/challenges';
import { motion, AnimatePresence } from 'framer-motion';

const RankPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState(OFFICIAL_CHALLENGES[0].id);
  const [leaderboard, setLeaderboard] = useState<RunData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRanks() {
      setIsLoading(true);
      const ranks = await firestoreService.getLeaderboard(selectedChallenge);
      setLeaderboard(ranks);
      setIsLoading(false);
    }
    fetchRanks();
  }, [selectedChallenge]);

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h2 className="text-4xl font-black font-heading tracking-tighter italic uppercase">Leaderboard</h2>
        <p className="text-brand-white/30 text-xs font-bold uppercase tracking-[0.2em]">Verified Reaction Velocity</p>
      </header>

      {/* Challenge Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
        {OFFICIAL_CHALLENGES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedChallenge(c.id)}
            className={`
              px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
              ${selectedChallenge === c.id 
                ? 'bg-brand-accent text-brand-black border-brand-accent shadow-[0_10px_30px_rgba(204,255,0,0.15)]' 
                : 'bg-brand-muted/40 text-brand-white/40 border-white/5'}
            `}
          >
            {c.type}
          </button>
        ))}
      </div>

      <div className="space-y-3 min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <div className="w-12 h-12 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-brand-accent animate-pulse">Syncing Grid...</p>
            </motion.div>
          ) : leaderboard.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-8"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-brand-muted/40 border border-white/5 flex items-center justify-center">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div className="space-y-2">
                <p className="text-brand-white/40 font-bold italic">This arena is currently empty.</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Claim the First Position</p>
              </div>
              <Button onClick={() => navigate(`/run/${selectedChallenge}`)} className="px-10 h-14 rounded-[1.5rem]">
                START RUN
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {leaderboard.map((run, idx) => (
                <motion.div
                  key={run.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`flex items-center gap-4 py-4 px-5 border-white/5 ${idx === 0 ? 'bg-brand-accent/5 border-brand-accent/20' : ''}`}>
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs
                      ${idx === 0 ? 'bg-brand-accent text-brand-black' : 'bg-brand-muted/80 text-brand-white/40'}
                    `}>
                      {idx + 1}
                    </div>
                    <div className="w-11 h-11 rounded-full border border-white/10 overflow-hidden bg-brand-muted flex-shrink-0">
                       <img src={run.userAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${run.userName}`} alt="" />
                    </div>
                    <div className="flex-1 truncate">
                      <h4 className="font-black italic uppercase tracking-tighter truncate">{run.userName}</h4>
                      <p className="text-[9px] text-brand-white/20 uppercase font-black tracking-widest">
                        {idx === 0 ? 'DOMINANT' : idx < 3 ? 'ELITE' : 'CHALLENGER'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xl font-black font-heading italic ${idx === 0 ? 'text-brand-accent' : 'text-brand-white'}`}>
                        {run.score}
                      </span>
                      <span className="text-[9px] font-bold text-brand-white/20 ml-1 uppercase">PTS</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {user?.isGuest && !isLoading && leaderboard.length > 0 && (
          <div className="relative pt-12">
            <div className="absolute inset-x-0 -top-20 bottom-0 flex flex-col items-center justify-center text-center px-6 z-10 bg-gradient-to-t from-brand-black via-brand-black/90 to-transparent">
              <div className="p-8 rounded-[3rem] bg-brand-muted/80 backdrop-blur-xl border border-white/10 w-full shadow-2xl space-y-6">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Stay Ranked</h4>
                  <p className="text-xs text-brand-white/40 font-medium">Guest profiles don't persist in the global grid.</p>
                </div>
                <Button onClick={openAuthModal} className="w-full h-14 rounded-2xl font-black italic">VERIFY IDENTITY</Button>
              </div>
            </div>
            {/* Background elements to blur */}
            <div className="opacity-10 blur-xl pointer-events-none space-y-3">
               {[1,2,3].map(i => (
                 <Card key={i} className="py-6"> <div className="h-4 w-full bg-white/20 rounded-full" /> </Card>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankPage;
