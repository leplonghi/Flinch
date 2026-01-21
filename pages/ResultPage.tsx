
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { firestoreService } from '../services/firestore';

const CountingScore: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        setCount(Math.floor(value));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <>{count}</>;
};

const ResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const { user, openAuthModal } = useAuth();
  
  const score = searchParams.get('score');
  const reactionMs = searchParams.get('ms');
  const type = searchParams.get('type');
  const early = searchParams.get('early');
  
  const scoreInt = parseInt(score || '0');
  const msInt = parseInt(reactionMs || '0');
  const earlyInt = parseInt(early || '0');
  
  const [percentile, setPercentile] = useState<number | null>(null);

  useEffect(() => {
    if (type && scoreInt && runId !== 'failed') {
      firestoreService.getPercentile(type, scoreInt).then(setPercentile);
    }
  }, [type, scoreInt, runId]);
  
  const getPhrase = () => {
    if (runId === 'failed') {
      return `${(earlyInt / 1000).toFixed(2)}s early.`;
    }
    if (msInt < 150) return "GODLIKE.";
    if (msInt < 200) return "ELITE.";
    if (msInt < 250) return "HUMAN.";
    if (msInt < 400) return "TURTLE.";
    return "ASLEEP.";
  };

  return (
    <div className="h-full flex flex-col pb-24 pt-10 px-6 bg-brand-black overflow-x-hidden">
      <motion.header 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-center space-y-6 mb-12"
      >
        <div className="flex justify-center">
           <span className="bg-brand-muted/60 text-white/40 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.3em] border border-white/5 backdrop-blur-md">
             {type || 'BLINK'} SESSION
           </span>
        </div>

        <div className="relative inline-block py-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10rem] font-black font-heading italic leading-none tracking-tighter text-brand-accent drop-shadow-[0_10px_40px_rgba(204,255,0,0.3)]"
          >
            {runId === 'failed' ? '0' : <CountingScore value={scoreInt} />}
          </motion.div>
          <div className="absolute -bottom-2 right-0 bg-white text-brand-black font-black text-[9px] px-3 py-1 uppercase tracking-widest shadow-xl">
            TOTAL SCORE
          </div>
        </div>

        <motion.p 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-3xl font-black uppercase tracking-tighter italic text-white"
        >
          {getPhrase()}
        </motion.p>
      </motion.header>

      <div className="flex-1 space-y-6">
        <section className="grid grid-cols-2 gap-4">
           <Card className="flex flex-col items-center py-8 bg-brand-muted/30 border-white/5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Reaction</span>
              <span className="text-3xl font-black font-heading italic">{runId === 'failed' ? 'FAIL' : `${msInt}ms`}</span>
           </Card>
           <Card className="flex flex-col items-center py-8 bg-brand-muted/30 border-white/5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Ranked</span>
              <span className="text-3xl font-black font-heading text-brand-accent italic">
                {percentile !== null ? `${percentile}%` : '---'}
              </span>
           </Card>
        </section>

        {percentile !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-accent text-brand-black p-4 rounded-2xl text-center shadow-[0_10px_40px_rgba(204,255,0,0.1)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              BETTER THAN {percentile}% OF HUMANITY
            </p>
          </motion.div>
        )}

        {user?.isGuest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-surface border border-white/5 p-8 rounded-[3rem] flex flex-col items-center text-center space-y-6 shadow-2xl"
          >
            <div className="space-y-2">
              <p className="font-black italic text-2xl uppercase tracking-tighter leading-tight">Claim your position.</p>
              <p className="text-xs font-medium text-white/40">Sync this score to appearing on the global grid.</p>
            </div>
            <Button 
              variant="primary" 
              className="w-full h-16 text-sm font-black italic rounded-2xl"
              onClick={openAuthModal}
            >
              SECURE RANK
            </Button>
          </motion.div>
        )}
      </div>

      <footer className="space-y-4 pt-12 pb-6">
        <Button 
          variant="primary" 
          className="w-full h-20 text-xl font-black italic rounded-[2rem] shadow-[0_10px_40px_rgba(204,255,0,0.2)]"
          onClick={() => navigate(`/run/${type || 'blink'}`)}
        >
          {runId === 'failed' ? 'RETRY RUN' : 'PUSH FURTHER'}
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" className="rounded-2xl h-14" onClick={() => navigate(`/share/${runId}?score=${score}&ms=${reactionMs}`)}>SHARE</Button>
          <Button variant="ghost" className="rounded-2xl h-14 opacity-40 hover:opacity-100" onClick={() => navigate('/play')}>LOBBY</Button>
        </div>
      </footer>
    </div>
  );
};

export default ResultPage;
