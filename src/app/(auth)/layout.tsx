import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      
      {/* Top Header */}
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/30 text-cyan-400 border border-cyan-500/30">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">{siteConfig.name}</span>
        </Link>

        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Auth Content */}
      <div className="w-full py-8">{children}</div>

      {/* Bottom Safety Disclaimer */}
      <div className="mx-auto w-full max-w-lg text-center text-[11px] text-slate-400">
        <p>{siteConfig.medicalDisclaimer.short}</p>
      </div>

    </div>
  );
}
