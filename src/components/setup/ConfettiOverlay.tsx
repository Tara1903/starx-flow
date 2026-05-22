import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  style: React.CSSProperties;
}

interface ConfettiOverlayProps {
  count?: number;
  active?: boolean;
}

export function ConfettiOverlay({ count = 120, active = true }: ConfettiOverlayProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const generated = Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100; // X position (percentage)
      const delay = Math.random() * 3.5; // animation delay (seconds)
      const duration = 2.5 + Math.random() * 2.0; // falling duration (seconds)
      const colors = ['#10b981', '#34d399', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return {
        id: i,
        style: {
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          width: `${4 + Math.random() * 6}px`,
          height: `${4 + Math.random() * 6}px`,
          top: '-10px'
        }
      };
    });

    setPieces(generated);
  }, [count, active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={piece.style}
        />
      ))}
    </div>
  );
}
