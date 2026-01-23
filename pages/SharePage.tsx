
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';

// Use a typed constant for motion components to avoid JSX syntax errors with inline casting
const MotionDiv = motion.div as any;

type SharePhase = 'FOCUS' | 'FLINCH' | 'FREEZE' | 'SLOWMO' | 'OUTRO';

const SharePage: React.FC = () => {
  const navigate = useNavigate();
  const { runId } = useParams<{ runId: string }>();
  const [searchParams] = useSearchParams();
  const score = searchParams.get('score') || '230';
  
  const [phase, setPhase] = useState<SharePhase>('FOCUS');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      setPhase('FOCUS');
      await new Promise(r => setTimeout(r, 2000));
      setPhase('FLINCH');
      await new Promise(r => setTimeout(r, 100));
      setPhase('FREEZE');
      await new Promise(r => setTimeout(r, 600));
      setPhase('SLOWMO');
      await new Promise(r => setTimeout(r, 2500));
      setPhase('OUTRO');
      await new Promise(r => setTimeout(r, 2000));
      sequence(); // Loop the preview
    };
    sequence();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`Beat my FLINCH score of ${score}ms! https://flinch.game/run/blink`);
    setShowToast(true);
  };

  return (
    <div className="fixed inset-0 bg-brand-black z-[100] flex flex-col items-center">
      {/* Header */}
      <div className="w-full p-6 flex justify-between items-center bg-brand-black/50 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-brand-accent tracking-widest uppercase">Content Studio</span>
          <h3 className="text-xl font-black font-heading italic">SHARE_CLIP.MP4</h3>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Main Replay Area (9:16) */}
      <div className="flex-1 w-full flex items-center justify-center px-6 py-4">
        <div className="w-full h-full max-w-[360px] aspect-[9/16] relative rounded-[2rem] overflow-hidden bg-brand-surface border-2 border-white/5 shadow-2xl">
          {/* Background Visuals per Phase */}
          <div className={`absolute inset-0 transition-colors duration-200 ${
            phase === 'FREEZE' ? 'bg-brand-danger' : 
            phase === 'FLINCH' ? 'bg-white' : 
            'bg-brand-black'
          }`}>
            {/* Focal Point */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence>
                {phase === 'FOCUS' && (
                  /* Using MotionDiv constant instead of inline casting to fix syntax errors */
                  <MotionDiv 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center"
                  >
                    <div className="w-4 h-4 rounded-full bg-white/40 animate-pulse" />
                  </MotionDiv>
                )}
                
                {(phase === 'FREEZE' || phase === 'SLOWMO') && (
                  /* Using MotionDiv constant instead of inline casting to fix syntax errors */
                  <MotionDiv 
                    initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    className="text-center px-6"
                  >
                    <h4 className="text-[8rem] font-black font-heading italic text-brand-accent tracking-tighter leading-none mb-4">
                      {score}
                      <span className="text-2xl block not-italic text-white/60">MILLISECONDS</span>
                    </h4>
                    <p className="text-xl font-black uppercase bg-brand-black text-white px-4 py-2 inline-block">
                      {parseInt(score) < 200 ? "INSANE SPEED" : "I FLINCHED."}
                    </p>
                  </MotionDiv>
                )}

                {phase === 'OUTRO' && (
                  /* Using MotionDiv constant instead of inline casting to fix syntax errors */
                  <MotionDiv 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center"
                  >
                    <h2 className="text-4xl font-black font-heading italic mb-2 tracking-tighter text-brand-accent">FLINCH</h2>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">BEAT MY SCORE</p>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Social Branding Overlays */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-brand-black font-black text-xs">F</div>
            <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">@PLAYER_ONE</span>
          </div>

          {/* Glitch / Filter Effects */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {phase === 'SLOWMO' && (
               /* Using MotionDiv constant instead of inline casting to fix syntax errors */
               <MotionDiv 
                 animate={{ opacity: [0, 0.2, 0] }}
                 transition={{ repeat: Infinity, duration: 0.1 }}
                 className="absolute inset-0 bg-brand-accent mix-blend-overlay" 
               />
            )}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-soft-light" />
          </div>
        </div>
      </div>

      {/* Share Controls */}
      <div className="w-full max-w-md p-8 pb-12 bg-brand-black/80 backdrop-blur-xl border-t border-white/5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button variant="primary" className="py-4 gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/></svg>
            INSTA STORY
          </Button>
          <Button variant="secondary" className="py-4 gap-2" onClick={handleCopyLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            COPY LINK
          </Button>
        </div>
        <Button variant="ghost" className="w-full text-white/40" onClick={() => navigate('/play')}>
          SKIP FOR NOW
        </Button>
      </div>

      <Toast 
        message="Challenge link copied!" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        type="success" 
      />
    </div>
  );
};

export default SharePage;
