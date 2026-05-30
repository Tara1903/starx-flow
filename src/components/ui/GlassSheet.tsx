import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { sheetEnter, overlayBackdrop } from '../../lib/motionVariants';

export interface GlassSheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
}

export function GlassSheet({
  open,
  onClose,
  title,
  children,
  side = 'right',
  className
}: GlassSheetProps) {
  
  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const sideClasses = {
    left: 'left-0 top-0 bottom-0 w-full sm:w-[400px]',
    right: 'right-0 top-0 bottom-0 w-full sm:w-[400px]',
    bottom: 'bottom-0 left-0 right-0 w-full rounded-t-3xl h-[85vh] sm:h-[60vh]',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex">
          <motion.div
            variants={overlayBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            custom={side}
            variants={sheetEnter}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute bg-[#050505]/90 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden",
              side === 'left' && "border-r",
              side === 'right' && "border-l",
              side === 'bottom' && "border-t",
              sideClasses[side],
              className
            )}
          >
            {/* Top glass gradient edge */}
            {(side === 'left' || side === 'right') && (
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            )}
            {side === 'bottom' && (
              <div className="absolute top-4 inset-x-0 flex justify-center">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
            )}

            {(title || onClose) && (
              <div className={cn(
                "flex items-center justify-between px-6 py-5 border-b border-white/5",
                side === 'bottom' && "mt-6"
              )}>
                <div className="text-lg font-bold text-white tracking-tight">{title}</div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto glass-scrollbar p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
