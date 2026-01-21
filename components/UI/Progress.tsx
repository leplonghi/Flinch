
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressProps {
  value: number; // 0 to 100
  color?: string;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, color = 'bg-brand-accent', className = '' }) => {
  return (
    <div className={`h-2 w-full bg-brand-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full ${color}`}
      />
    </div>
  );
};

export default Progress;
