import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}

export function Card({ title, children, className = '', tilt = true }: CardProps) {
  return (
    <motion.section 
      className={`bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={tilt ? { rotateX: 5, rotateY: 5, scale: 1.02, y: -10 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 1000 }}
    >
      {title && <div className="px-5 py-4 border-b border-gray-100 font-semibold text-secondary-900">{title}</div>}
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

