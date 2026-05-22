import React from 'react';
import { motion } from 'motion/react';

interface StepCardProps {
  children: React.ReactNode;
}

export function StepCard({ children }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Custom premium ease-out
      className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.06] bg-[#090909]/40 backdrop-blur-md relative overflow-hidden flex-1 shadow-2xl shadow-black/40"
    >
      {/* Decorative gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-white/[0.02] pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </motion.div>
  );
}
