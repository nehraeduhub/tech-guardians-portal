import { motion } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'green' | 'purple';
  onClick?: () => void;
}

const GlassCard = ({ children, className = '', onClick }: GlassCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      className={`glass-card p-6 ${className}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
