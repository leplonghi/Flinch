
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const variants = {
    primary: 'bg-brand-accent text-brand-black font-black',
    secondary: 'bg-brand-muted/80 backdrop-blur-md text-brand-white font-bold border border-brand-white/10',
    ghost: 'bg-transparent text-brand-white/60 font-medium hover:text-brand-white',
    danger: 'bg-brand-danger text-brand-white font-black'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95, y: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      disabled={disabled}
      onClick={onClick}
      className={`
        px-6 py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-tight
        aggressive-ease transition-colors active:opacity-90
        ${variants[variant]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default Button;
