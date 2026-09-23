import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ProductDisclaimerProps {
  variant?: 'banner' | 'card' | 'inline' | 'compact';
  className?: string;
}

export function ProductDisclaimer({ variant = 'banner', className = '' }: ProductDisclaimerProps) {
  const disclaimerText =
    'REHAB-AI is an assistive rehabilitation technology prototype. It does not replace professional medical advice, diagnosis, or treatment.';

  if (variant === 'compact') {
    return (
      <div
        role="note"
        aria-label="Medical Technology Prototype Disclaimer"
        className={`text-[11px] text-slate-400 text-center leading-relaxed ${className}`}
      >
        <span className="font-semibold text-slate-300">Disclaimer: </span>
        {disclaimerText}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        role="note"
        aria-label="Medical Technology Prototype Disclaimer"
        className={`p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs flex items-start gap-3 backdrop-blur-sm ${className}`}
      >
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5">
          <span className="font-semibold text-white block">Medical Disclaimer</span>
          <p className="text-slate-400 leading-relaxed">{disclaimerText}</p>
        </div>
      </div>
    );
  }

  return (
    <aside
      role="note"
      aria-label="Medical Technology Prototype Disclaimer"
      className={`w-full py-2 px-4 bg-slate-950/80 border-t border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-center gap-2 text-center ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
      <span>{disclaimerText}</span>
    </aside>
  );
}
