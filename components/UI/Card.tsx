import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const MotionDiv = motion.div as any;

const Card: React.FC<CardProps> = ({ children, onClick, className = '' }) => {
  return (
    <MotionDiv
      whileHover={onClick ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className={`
        bg-brand-surface border border-brand-white/5 p-5 rounded-3xl 
        ${onClick ? 'cursor-pointer hover:border-brand-accent/30' : ''}
        ${className}
      `}
    >
      {children}
    </MotionDiv>
  );
};

export default Card;