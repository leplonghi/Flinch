
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { CHALLENGES, getAllChallenges } from '../data/registry';
import { ProgressionSystem } from '../services/ProgressionSystem';
import ChallengeCard from '../components/ChallengeCard';
import Progress from '../components/UI/Progress';
import Button from '../components/UI/Button';
import { Challenge, Difficulty } from '../types';

const HomePage: React.FC = () => {
  const { playerProgress, startGame } = useGame();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

  const challenges = getAllChallenges();
  const selectedChallenge = selectedId ? CHALLENGES[selectedId] : null;
  const xpInfo = ProgressionSystem.getXPProgress(playerProgress.totalXP);

  const handleStart = () => {
    if (selectedChallenge) {
      startGame(selectedChallenge, difficulty);
      navigate(`/run/${selectedChallenge.id}`);
    }
  };

  return (
    <div className="space-y-10 pb-32">
      {/* Header & Level Info */}
      <header className="space-y-6 px-1">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-5xl font-black font-heading italic tracking-tighter text-white">
              ⚡ FLINCH<span className="text-brand-accent">.</span>
            </h1>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Neural Reaction Network</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Global Streak</p>
             <p className="text-2xl font-black italic text-white leading-none">🔥 {playerProgress.dailyStreak} DAYS</p>
          </div>
        </div>

        <div className="bg-brand-muted/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent flex items-center justify-center text-brand-black font-black text-xl italic rotate-3">
                {xpInfo.level}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/30 uppercase">Operator Level</span>
                <span className="text-sm font-black italic text-white uppercase tracking-tighter">Class IV Technician</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-brand-accent uppercase">{Math.round(xpInfo.percentage)}% to Level {xpInfo.level + 1}</span>
            </div>
          </div>
          <Progress value={xpInfo.percentage} className="h-2.5 shadow-[0_0_15px_rgba(204,255,0,0.1)]" />
        </div>
      </header>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-3 gap-3 px-1">
        <StatCard label="Total Runs" value={playerProgress.runsCompleted} />
        <StatCard label="Mastery XP" value={Math.round(playerProgress.totalXP / 100) * 100} accent />
        <StatCard label="Achievements" value={`${playerProgress.achievements.filter(a => a.unlockedAt).length}/${playerProgress.achievements.length || 6}`} />
      </div>

      {/* Challenge Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-0.5">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Available Ops</h3>
            <p className="text-sm font-black italic text-white uppercase tracking-tight">Select Neural Target</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {challenges.map(c => (
            <ChallengeCard 
              key={c.id} 
              challenge={c} 
              masteryXp={playerProgress.mastery[c.id]} 
              isSelected={selectedId === c.id}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>
      </section>

      {/* Bottom Selection Panel */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[60] p-6 pb-10 bg-brand-black/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{selectedChallenge.icon}</span>
                  <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">{selectedChallenge.name}</h4>
                    <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{selectedChallenge.category} PROTOCOL</p>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-white/20 hover:text-white transition-colors p-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`
                      py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                      ${difficulty === d 
                        ? 'bg-brand-white text-brand-black border-brand-white' 
                        : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <Button onClick={handleStart} className="w-full h-16 rounded-2xl shadow-[0_15px_40px_rgba(204,255,0,0.3)]">
                ESTABLISH LINK
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Preview */}
      <section className="px-1 space-y-4">
        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Latest Merits</h3>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {playerProgress.achievements.slice(0, 4).map(a => (
            <div key={a.id} className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 ${a.unlockedAt ? 'bg-brand-accent/20 border-brand-accent grayscale-0' : 'bg-brand-muted border-white/5 grayscale opacity-20'}`}>
              {a.id === 'first_blood' ? '🎯' : a.id === 'master' ? '👑' : '⭐'}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="bg-brand-surface/30 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-xl font-black italic tracking-tighter ${accent ? 'text-brand-accent' : 'text-white'}`}>{value}</span>
  </div>
);

export default HomePage;
