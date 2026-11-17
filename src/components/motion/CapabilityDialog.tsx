'use client';

import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  eyebrow: string;
  description: string;
  onClose: () => void;
  onEnable: () => void;
}

/** Native dialog supplies focus containment, Escape, inert background and focus return. */
export function CapabilityDialog({ open, title, eyebrow, description, onClose, onEnable }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={dialogRef} id="starx-modal-backdrop" aria-labelledby="modal-title" aria-describedby="modal-subtitle"
      className="sx-capability-dialog fixed inset-0 m-0 w-full h-full max-w-none max-h-none items-center justify-center p-4 text-emerald-50"
      style={{ background: 'rgba(2, 10, 7, 0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: 'linear-gradient(155deg, rgba(16, 48, 35, 0.96), rgba(5, 18, 13, 0.98))', border: '1px solid rgba(110, 231, 183, 0.45)', boxShadow: '0 0 50px rgba(16, 185, 129, 0.25)' }}>
        <button type="button" onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-emerald-300 hover:bg-emerald-800/40">×</button>
        <div id="modal-eyebrow" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400 pr-8">{eyebrow}</div>
        <h3 id="modal-title" className="font-editorial text-3xl font-normal text-white mt-1 pr-6">{title}</h3>
        <p id="modal-subtitle" className="text-xs text-emerald-200/80 mt-1.5 leading-relaxed">{description}</p>
        <button type="button" onClick={onEnable} className="mt-6 w-full py-2.5 rounded-full text-xs font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 active:scale-[.99]">Enable This Module →</button>
      </div>
    </dialog>
  );
}
