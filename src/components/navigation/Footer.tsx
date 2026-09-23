'use client';

import React from 'react';
import { ProductDisclaimer } from '@/components/common/ProductDisclaimer';
import { EmergencyGuidanceModal } from '@/components/common/EmergencyGuidanceModal';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';
import { PatientBottomNav } from '@/components/navigation/PatientBottomNav';
import { RehabAiLogo } from '@/components/common/RehabAiLogo';

export function Footer() {
  return (
    <>
      {/* Mobile Patient Floating Navigation Bar */}
      <PatientBottomNav />

      <footer className="mt-auto border-t border-[#dce9ff] bg-[#eff4ff] text-[#565e74] text-xs pb-24 md:pb-0">
        {/* Top Disclaimer Banner */}
        <ProductDisclaimer variant="banner" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Branding & Status */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 font-semibold text-[#0b1c30]">
              <RehabAiLogo className="w-5 h-5" />
              <span>REHAB-AI Platform</span>
            </div>
            <span className="hidden sm:inline text-[#bcc9c6]">|</span>
            <span className="text-[11px] text-[#565e74]">
              Clinical Tele-Rehabilitation & Computer Vision Biomechanics
            </span>
            <SyncStatusBadge />
          </div>

          {/* Right: Emergency & Actions */}
          <div className="flex items-center gap-3">
            <EmergencyGuidanceModal />
            <div className="text-[11px] text-[#6d7a77]">
              v2.5.0 • Stitch UI/UX
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
