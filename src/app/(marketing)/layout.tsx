import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      {/* Medical Boundary Advisory Strip */}
      <aside aria-label="Medical Disclaimer" className="bg-slate-950 border-b border-slate-800/80 px-4 py-2 text-center text-[11px] text-slate-400">
        <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>{siteConfig.medicalDisclaimer.short}</span>
        </div>
      </aside>

      {/* Marketing Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 shadow-sm shadow-cyan-900/40">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">{siteConfig.name}</span>
              <span className="ml-1.5 rounded bg-cyan-950 px-1 py-0.5 text-[9px] font-semibold text-cyan-300 border border-cyan-800/60">
                PROTOTYPE
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400">
            {siteConfig.navigation.marketing.map((item) => (
              <a key={item.name} href={item.href} className="hover:text-white transition-colors">
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/patient/dashboard">
              <Button variant="primary" size="sm">
                Launch Portal <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">{siteConfig.name}</span>
              <span>— Assistive Tele-Rehabilitation Technology</span>
            </div>
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} {siteConfig.company}. All rights reserved.
            </p>
          </div>
          <p className="text-[11px] leading-relaxed border-t border-slate-900 pt-4 text-slate-400">
            {siteConfig.medicalDisclaimer.full}
          </p>
        </div>
      </footer>
    </div>
  );
}
