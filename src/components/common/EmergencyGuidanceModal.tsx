'use client';

import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, X, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmergencyGuidanceModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
        title="Emergency guidance and local helpline numbers"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>Emergency Help</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-dialog-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertOctagon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <h2 id="emergency-dialog-title" className="text-base font-bold text-white">
                  Emergency Medical Guidance
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                aria-label="Close emergency modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Non-diagnostic emergency disclaimer */}
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 leading-relaxed">
              <strong className="block text-rose-300 mb-1">Important Safety Notice:</strong>
              REHAB-AI is an assistive software prototype and does <strong>not</strong> detect,
              diagnose, or treat acute medical conditions, cardiac emergencies, or injuries.
              If you or someone nearby is experiencing acute symptoms, stop exercise immediately.
            </div>

            {/* Acute Warning Signs */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-200">
                Stop exercise immediately if you experience:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Chest pain, heaviness, tightness, or pressure</li>
                <li>Sudden severe shortness of breath, dizziness, or fainting</li>
                <li>Sudden numbness, weakness on one side of the body, or difficulty speaking</li>
                <li>Sharp, tearing, or unmanageable acute joint/muscle pain</li>
              </ul>
            </div>

            {/* Emergency Contacts Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-200">
                Local Emergency Dispatch Services:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">United States / Canada</span>
                  <a
                    href="tel:911"
                    className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5 hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> 911
                  </a>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Europe / UK (Universal)</span>
                  <a
                    href="tel:112"
                    className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5 hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> 112 / 999
                  </a>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">India (Emergency Services)</span>
                  <a
                    href="tel:112"
                    className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5 hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> 112 / 108
                  </a>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Australia</span>
                  <a
                    href="tel:000"
                    className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5 hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> 000
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <Button onClick={() => setIsOpen(false)} variant="outline" size="sm">
                Understood & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
