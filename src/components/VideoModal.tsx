import React, { useEffect } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

export function VideoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#050505] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] ring-1 ring-white/5"
      >
        <div className="absolute top-4 right-4 z-10 flex gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 border border-white/10 transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] pointer-events-none" />

          <video
            autoPlay
            muted
            controls
            className="w-full h-full object-cover relative z-10"
            src="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </motion.div>
    </motion.div>
  );
}
