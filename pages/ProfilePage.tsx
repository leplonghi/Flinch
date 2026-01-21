
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Progress from '../components/UI/Progress';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="space-y-10 py-6">
      <header className="flex flex-col items-center text-center px-4 relative">
        <div className="relative mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-32 h-32 rounded-full bg-brand-surface border-4 border-brand-accent p-1.5 overflow-hidden shadow-[0_15px_40px_rgba(204,255,0,0.2)]"
          >
            <img 
              src={user?.photoURL || "https://api.dicebear.com/7.x/pixel-art/svg?seed=flinch"} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-2 -right-2 bg-brand-white text-brand-black text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-xl border-4 border-brand-black"
          >
            LVL {user?.stats?.level || 1}
          </motion.div>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-4xl font-black font-heading uppercase tracking-tighter italic leading-none">
            {user?.displayName || 'OPERATOR_00'}
          </h2>
          <p className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em]">
            {user?.isGuest ? 'GUEST_PROFILE' : 'VERIFIED_CHAMPION'}
          </p>
        </div>
      </header>

      {user?.isGuest && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-brand-accent text-brand-black p-8 rounded-[3rem] space-y-4 border-none shadow-[0_20px_40px_rgba(204,255,0,0.15)]">
             <div className="space-y-1">
               <h4 className="font-black italic text-2xl uppercase tracking-tighter leading-tight">Sync Identity.</h4>
               <p className="text-sm font-bold opacity-70">Guest stats are temporary and will be wiped.</p>
             </div>
             <Button 
              variant="primary" 
              className="w-full bg-brand-black text-brand-accent border-none h-16 rounded-2xl"
              onClick={openAuthModal}
             >
              CLAIM YOUR REPUTATION
             </Button>
          </Card>
        </motion.div>
      )}

      <section className="grid grid-cols-2 gap-5 px-1">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="text-center py-8 rounded-[2.5rem] bg-brand-surface/40 border-white/5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Avg React</p>
            <p className="text-4xl font-black font-heading text-brand-accent italic leading-none">
              {user?.stats?.avgReact || 0}<span className="text-[10px] ml-1 not-italic opacity-40 uppercase">ms</span>
            </p>
          </Card>
        </motion.div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card className="text-center py-8 rounded-[2.5rem] bg-brand-surface/40 border-white/5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Total Runs</p>
            <p className="text-4xl font-black font-heading text-white italic leading-none">{user?.stats?.totalGames || 0}</p>
          </Card>
        </motion.div>
      </section>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <Card className="p-8 rounded-[3rem] space-y-8 bg-brand-surface/20 border-white/5 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Skill Tier</span>
                <span className="text-sm font-black italic uppercase tracking-tighter">Reflex Precision</span>
              </div>
              <span className="text-xs font-black text-brand-accent uppercase">Top 12%</span>
            </div>
            <Progress value={user?.isGuest ? 15 : 78} className="h-2.5" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Stability</span>
                <span className="text-sm font-black italic uppercase tracking-tighter">Movement Economy</span>
              </div>
              <span className="text-xs font-black text-white/40 uppercase">Gold II</span>
            </div>
            <Progress value={user?.isGuest ? 5 : 45} color="bg-white/20" className="h-2.5" />
          </div>
        </Card>
      </motion.div>

      <div className="space-y-4 pt-4 pb-12 px-2">
        {!user?.isGuest && (
          <Button 
            variant="secondary" 
            className="w-full justify-between h-16 rounded-2xl px-6 group"
            onClick={() => setShowToast(true)}
          >
            <span className="font-black italic text-sm">SECURITY SETTINGS</span>
            <svg className="group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Button>
        )}
        <Button 
          variant={user?.isGuest ? 'ghost' : 'danger'} 
          className={`w-full h-16 rounded-2xl font-black italic ${user?.isGuest ? 'opacity-40' : ''}`}
          onClick={user?.isGuest ? openAuthModal : logout}
        >
          {user?.isGuest ? 'LOGIN_REQUIRED' : 'LOG_OUT_SESSION'}
        </Button>
      </div>

      <Toast 
        message="Protocol Updated." 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        type="success" 
      />
    </div>
  );
};

export default ProfilePage;
