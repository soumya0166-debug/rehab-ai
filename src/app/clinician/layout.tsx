'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Users, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  LogOut,
  Stethoscope 
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/lib/auth/auth-context';

export default function ClinicianLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Caseload Overview', href: '/clinician/dashboard', icon: LayoutDashboard },
    { name: 'Patient Directory', href: '/clinician/patients', icon: Users },
    { name: 'Protocol Library', href: '/clinician/exercises', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col md:flex-row">
      
      {/* Clinician Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600/30 text-teal-400 border border-teal-500/30">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight">{siteConfig.name}</span>
                <span className="text-[10px] text-teal-400 font-semibold block leading-none">CLINICIAN DESK</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-950/80 text-teal-300 border border-teal-800/80 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Clinical Authority Strip */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-[11px] text-slate-400 leading-snug">
            <span className="flex items-center gap-1 font-semibold text-teal-300 mb-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> Clinical Supervision
            </span>
            All telemetry is deterministic. Target authority resides with you.
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-rose-400 transition-colors px-1 cursor-pointer w-full text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out ({user?.role || 'Physiotherapist'})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

    </div>
  );
}
