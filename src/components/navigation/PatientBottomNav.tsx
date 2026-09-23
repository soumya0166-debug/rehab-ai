'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PatientBottomNav() {
  const pathname = usePathname();

  // Only render on patient views
  if (!pathname.startsWith('/patient')) {
    return null;
  }

  const isToday = pathname === '/patient' || pathname === '/patient/dashboard';
  const isLive = pathname.startsWith('/patient/exercises') || pathname.startsWith('/patient/session');
  const isTelemetry = pathname.startsWith('/patient/progress') || pathname.startsWith('/patient/history');
  const isCare = pathname.startsWith('/patient/profile');

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 pb-safe bg-[#f8f9ff]/95 backdrop-blur-xl border-t border-[#dce9ff] shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      {/* Clinician Guidance Sub-Bar */}
      <div className="flex items-center justify-center py-1 bg-[#eff4ff]/80 border-b border-[#dce9ff]/50">
        <div className="flex items-center gap-1.5 text-[#3d4947] px-3 py-0.5">
          <span className="material-symbols-outlined text-[14px] text-[#00685f]">verified_user</span>
          <span className="font-label-sm text-[11px] tracking-tight">Clinician-Configured • Virtual Assistant Guidance Only</span>
        </div>
      </div>

      {/* Primary 4-Tab Navigation */}
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        <Link
          href="/patient/dashboard"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            isToday ? 'text-[#00685f] font-semibold' : 'text-[#565e74] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          <span className="font-label-sm text-[11px] mt-0.5">Today</span>
        </Link>

        <Link
          href="/patient/exercises"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            isLive ? 'text-[#00685f] font-semibold' : 'text-[#565e74] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          <span className="font-label-sm text-[11px] mt-0.5">Live Rehab</span>
        </Link>

        <Link
          href="/patient/progress"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            isTelemetry ? 'text-[#00685f] font-semibold' : 'text-[#565e74] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">insights</span>
          <span className="font-label-sm text-[11px] mt-0.5">Telemetry</span>
        </Link>

        <Link
          href="/patient/profile"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            isCare ? 'text-[#00685f] font-semibold' : 'text-[#565e74] hover:text-[#0b1c30]'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">stethoscope</span>
          <span className="font-label-sm text-[11px] mt-0.5">Care</span>
        </Link>
      </div>
    </nav>
  );
}
