import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Progress from '../components/UI/Progress';
import { firestoreService } from '../services/firestore';

const MotionHeader = motion.header as any;
const MotionDiv = motion.div as any;

const CountingScore: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) { setCount(Math.floor(v)); },
    });
    return () => controls.stop();
  }, [value]);
  return <>{count}</>;
};

const ResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const { user } = useAuth();
  
  const score = parseInt(searchParams.get('score') || '0');
  const maxCombo = parseInt(searchParams.get('combo') || '0');
  const type = searchParams.get('type') || 'blink';
  
  const [percentile, setPercentile] = useState<number | null>(null);
  const [xpProgress, setXpProgress] = useState(0);

  useEffect(() => {
    firestoreService.getPercentile(type, score).then(setPercentile);
    // Simula ganho de XP
    setTimeout(() => setXpProgress(65), 500);
  }, [type, score]);

  return (
    <div className="min-h-full flex flex-col pb-24 pt-10 px-6 bg-brand-black overflow-x-hidden">
      <MotionHeader 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 mb-10"
      >
        <div className="relative inline-block">
          <MotionDiv className="text-[8rem] font-black font-heading italic leading-none tracking-tighter text-brand-accent">
            <CountingScore value={score} />
          </MotionDiv>
          <div className="absolute -bottom-2 right-0 bg-white text-brand-black font-black text-[9px] px-3 py-1 uppercase tracking-widest">
            TOTAL_STRIKE
          </div>
        </div>
      </MotionHeader>

      <div className="space-y-4">
        <Card className="p-6 bg-brand-surface/50 border-white/5 flex justify-between items-center">
           <div>
             <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Max Combo</p>
             <h4 className="text-3xl font-black italic">x{maxCombo}</h4>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Global Rank</p>
             <h4 className="text-3xl font-black italic text-brand-accent">TOP {percentile !== null ? 100 - percentile : '--'}%</h4>
           </div>
        </Card>

        {/* Level Progression Gamification */}
        <Card className="p-8 space-y-6 rounded-[2.5rem] bg-brand-accent/5 border-brand-accent/20">
           <div className="flex justify-between items-end">
              <div className="space-y-1">
                 <h5 className="text-xs font-black uppercase tracking-widest">Operator Level {user?.stats?.level || 1}</h5>
                 <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">{score} XP EARNED</p>
              </div>
              <span className="text-[10px] font-black text-brand-accent italic">NEXT LVL: {Math.round(xpProgress)}%</span>
           </div>
           <Progress value={xpProgress} color="bg-brand-accent shadow-[0_0_15px_#ccff00]" className="h-3" />
        </Card>
      </div>

      <footer className="mt-auto space-y-4 pt-12">
        <Button 
          variant="primary" 
          className="w-full h-20 text-xl font-black italic rounded-[2rem] shadow-[0_15px_40px_rgba(204,255,0,0.2)]"
          onClick={() => navigate(`/run/${type}`)}
        >
          STRIKE AGAIN
        </Button>
        <Button variant="ghost" className="w-full text-white/40 font-black italic" onClick={() => navigate('/play')}>
          BACK TO HUB
        </Button>
      </footer>
    </div>
  );
};

export default ResultPage;