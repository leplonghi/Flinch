
import React, { useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMotion } from '../../contexts/MotionContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { toggleDebug } = useMotion();
  const navigate = useNavigate();
  
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    
    if (clickCount.current === 3) {
      toggleDebug();
      clickCount.current = 0;
    } else {
      clickTimer.current = window.setTimeout(() => {
        clickCount.current = 0;
        navigate('/play');
      }, 300);
    }
  };

  return (
    <header className="px-6 py-4 flex items-center justify-between bg-brand-black/80 backdrop-blur-md sticky top-0 z-50">
      <h1 
        onClick={handleLogoClick}
        className="text-2xl font-black font-heading tracking-tighter text-brand-white cursor-pointer select-none"
      >
        FLINCH<span className="text-brand-accent">.</span>
      </h1>
      
      <div className="flex gap-3 items-center">
        {user?.isGuest ? (
          <button 
            onClick={openAuthModal}
            className="text-[10px] font-black tracking-widest text-brand-accent border border-brand-accent/20 px-3 py-1.5 rounded-full hover:bg-brand-accent hover:text-brand-black transition-colors"
          >
            LOG IN
          </button>
        ) : (
          <div 
            onClick={() => navigate('/profile')}
            className="h-9 w-9 rounded-full bg-brand-muted flex items-center justify-center border-2 border-brand-accent p-0.5 overflow-hidden cursor-pointer"
          >
            <img src={user?.photoURL || ''} alt="" className="w-full h-full rounded-full" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
