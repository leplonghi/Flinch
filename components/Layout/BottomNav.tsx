import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'rank', icon: <RankIcon />, path: '/rank' },
    { id: 'play', icon: <PlayIcon />, path: '/play' },
    { id: 'profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-black/90 backdrop-blur-xl border-t border-brand-white/10 pb-8 pt-4 px-6 z-50">
      <div className="flex items-center justify-between relative">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center p-2 group transition-all duration-150"
            >
              <div className={`relative z-10 ${isActive ? 'text-brand-accent' : 'text-brand-white/40'}`}>
                {tab.icon}
              </div>
              
              {isActive && (
                <MotionDiv
                  layoutId="bubble"
                  className="absolute inset-0 bg-brand-accent/10 rounded-2xl -z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              
              {isActive && (
                <MotionDiv
                  layoutId="indicator"
                  className="absolute -top-1 w-1 h-1 bg-brand-accent rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const RankIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

const PlayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default BottomNav;