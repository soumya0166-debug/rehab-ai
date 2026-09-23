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
        className={`text-[11px] text-[#565e74] text-center leading-relaxed ${className}`}
      >
        <span className="font-semibold text-[#0b1c30]">Disclaimer: </span>
        {disclaimerText}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        role="note"
        aria-label="Medical Technology Prototype Disclaimer"
        className={`p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-[#3d4947] text-xs flex items-start gap-3 shadow-sm ${className}`}
      >
        <AlertCircle className="w-4 h-4 text-[#00685f] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5">
          <span className="font-semibold text-[#0b1c30] block">Clinical Verification Notice</span>
          <p className="text-[#565e74] leading-relaxed">{disclaimerText}</p>
        </div>
      </div>
    );
  }

  return (
    <aside
      role="note"
      aria-label="Medical Technology Prototype Disclaimer"
      className={`w-full py-2.5 px-4 bg-[#eff4ff] border-t border-b border-[#dce9ff] text-xs text-[#565e74] flex items-center justify-center gap-2 text-center ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-[#00685f] shrink-0" aria-hidden="true" />
      <span>{disclaimerText}</span>
    </aside>
  );
}
