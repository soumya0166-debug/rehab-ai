'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Info } from 'lucide-react';
import { ProductDisclaimer } from '@/components/common/ProductDisclaimer';
import { EmergencyGuidanceModal } from '@/components/common/EmergencyGuidanceModal';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#060911] text-slate-400 text-xs">
      {/* Top Disclaimer Banner */}
      <ProductDisclaimer variant="banner" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>REHAB-AI Platform</span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="text-[11px] text-slate-400">
            Clinical Tele-Rehabilitation & Computer Vision Biomechanics
          </span>
          <SyncStatusBadge />
        </div>

        {/* Right: Emergency & Actions */}
        <div className="flex items-center gap-3">
          <EmergencyGuidanceModal />
          <div className="text-[11px] text-slate-500">
            v2.4.0 (Offline-Enabled)
          </div>
        </div>
      </div>
    </footer>
  );
}
