'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  LayoutDashboard, 
  Dumbbell, 
  TrendingUp, 
  Settings, 
  ShieldCheck, 
  LogOut,
  AlertTriangle 
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/lib/auth/auth-context';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'My Exercises', href: '/patient/exercises', icon: Dumbbell },
    { name: 'Progress & Trends', href: '/patient/progress', icon: TrendingUp },
    { name: 'Session History', href: '/patient/history', icon: Activity },
    { name: 'Profile & Language', href: '/patient/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-500/30">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight">{siteConfig.name}</span>
                <span className="text-[10px] text-cyan-400 font-semibold block leading-none">PATIENT PORTAL</span>
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
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Safety Strip */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-[11px] text-slate-400 leading-snug">
            <span className="flex items-center gap-1 font-semibold text-slate-300 mb-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Assistive System
            </span>
            All movements tracked in-browser under clinical supervision.
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-rose-400 transition-colors px-1 cursor-pointer w-full text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out ({user?.role || 'Patient'})</span>
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
