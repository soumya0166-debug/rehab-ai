'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RehabAiLogo } from '@/components/common/RehabAiLogo';
import { USER_PERSONAS, getActivePersona, setActivePersona, UserPersona } from '@/lib/auth/rbac';
import { useAuth } from '@/lib/auth/auth-context';
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';
import { EmergencyGuidanceModal } from '@/components/common/EmergencyGuidanceModal';
import { resetDemoData } from '@/lib/data/store';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'EN' | 'HI' | 'OR'>('EN');
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(USER_PERSONAS[0]);
  const [resetNotice, setResetNotice] = useState(false);

  useEffect(() => {
    setCurrentPersona(getActivePersona());
  }, []);

  const getSectionTitle = () => {
    if (pathname.startsWith('/clinician')) return '| Clinician Care';
    if (pathname.startsWith('/caregiver')) return '| Caregiver';
    if (pathname.startsWith('/admin')) return '| Administration';
    if (pathname.includes('/exercises')) return '| Protocol Catalog';
    if (pathname.includes('/progress')) return '| Kinematic Telemetry';
    if (pathname.includes('/session')) return '| Live Session';
    return '| Today';
  };

  const handleSelectPersona = (persona: UserPersona) => {
    setActivePersona(persona);
    setCurrentPersona(persona);
    setPersonaMenuOpen(false);

    if (persona.role === 'patient') {
      router.push('/patient/dashboard');
    } else if (persona.role === 'clinician') {
      router.push('/clinician/dashboard');
    } else if (persona.role === 'caregiver') {
      router.push('/caregiver/dashboard');
    } else if (persona.role === 'admin') {
      router.push('/admin/dashboard');
    }
  };

  const handleReset = () => {
    resetDemoData();
    setResetNotice(true);
    setTimeout(() => {
      setResetNotice(false);
      window.location.reload();
    }, 800);
  };

  return (
    <header className="sticky top-0 w-full z-50 pt-safe bg-[#f8f9ff]/85 backdrop-blur-xl border-b border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-18 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand Logo & Context */}
        <div className="flex items-center gap-3">
          <Link href="/patient/dashboard" className="flex items-center gap-2.5 group">
            <RehabAiLogo className="h-8 w-8 object-contain transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-base text-[#00685f] tracking-tight">REHAB-AI</span>
                <span className="font-headline text-sm text-[#3d4947] font-normal">{getSectionTitle()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006947] animate-pulse"></span>
                <span className="font-label-sm text-[11px] text-[#006947]">Vision Engine: Active (60fps)</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Portal Switcher Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-[#eff4ff] p-1 rounded-full border border-[#dce9ff]">
          <Link
            href="/patient/dashboard"
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              pathname.startsWith('/patient')
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#dce9ff]/50'
            }`}
          >
            Patient
          </Link>
          <Link
            href="/clinician/dashboard"
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              pathname.startsWith('/clinician')
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#dce9ff]/50'
            }`}
          >
            Clinician
          </Link>
          <Link
            href="/caregiver/dashboard"
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              pathname.startsWith('/caregiver')
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#dce9ff]/50'
            }`}
          >
            Caregiver
          </Link>
          <Link
            href="/admin/dashboard"
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              pathname.startsWith('/admin')
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-[#dce9ff]/50'
            }`}
          >
            Admin
          </Link>
        </nav>

        {/* Right Utility Bar: Language + Offline Badge + Persona Profile */}
        <div className="flex items-center gap-2">
          {/* Offline Sync Status Badge */}
          <SyncStatusBadge />

          {/* Emergency Medical Guidance */}
          <EmergencyGuidanceModal />

          {/* Language Switch Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-label="Language switch"
              className="h-9 px-2.5 rounded-lg flex items-center gap-1 text-[#3d4947] hover:text-[#00685f] hover:bg-[#eff4ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">translate</span>
              <span className="font-label-sm text-[11px] uppercase font-bold">{currentLang}</span>
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white border border-[#dce9ff] shadow-lg py-1 z-50 text-xs">
                <button
                  onClick={() => { setCurrentLang('EN'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#eff4ff] ${currentLang === 'EN' ? 'font-bold text-[#00685f]' : 'text-[#0b1c30]'}`}
                >
                  <span>English</span>
                  {currentLang === 'EN' && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
                <button
                  onClick={() => { setCurrentLang('HI'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#eff4ff] ${currentLang === 'HI' ? 'font-bold text-[#00685f]' : 'text-[#0b1c30]'}`}
                >
                  <span>हिन्दी</span>
                  {currentLang === 'HI' && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
                <button
                  onClick={() => { setCurrentLang('OR'); setLangMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#eff4ff] ${currentLang === 'OR' ? 'font-bold text-[#00685f]' : 'text-[#0b1c30]'}`}
                >
                  <span>ଓଡ଼ିଆ</span>
                  {currentLang === 'OR' && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
              </div>
            )}
          </div>

          {/* User Persona Profile Pill / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-1.5 p-1 pl-2 bg-[#eff4ff] border border-[#dce9ff] rounded-full hover:bg-[#e5eeff] transition-all"
              aria-label="User Persona Selector"
            >
              <span className="text-xs font-semibold text-[#0b1c30] hidden sm:inline max-w-[90px] truncate">
                {currentPersona.name.split(' ')[0]}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#00685f] flex items-center justify-center text-white shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#dce9ff] shadow-xl p-2 z-50">
                <div className="px-3 py-2 border-b border-[#eff4ff]">
                  <p className="text-xs font-bold text-[#0b1c30]">{currentPersona.name}</p>
                  <p className="text-[11px] text-[#565e74] capitalize">{currentPersona.role} Mode</p>
                </div>

                <div className="py-1">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#565e74]">Switch Persona</p>
                  {USER_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPersona(p)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentPersona.id === p.id
                          ? 'bg-[#e5eeff] text-[#00685f] font-semibold'
                          : 'hover:bg-[#eff4ff] text-[#0b1c30]'
                      }`}
                    >
                      <div>
                        <span className="block font-medium">{p.name}</span>
                        <span className="block text-[10px] text-[#565e74] capitalize">{p.role}</span>
                      </div>
                      {currentPersona.id === p.id && (
                        <span className="material-symbols-outlined text-[16px] text-[#00685f]">check</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-1 mt-1 border-t border-[#eff4ff] flex flex-col gap-1">
                  <button
                    onClick={handleReset}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#565e74] hover:bg-[#eff4ff] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">refresh</span>
                    <span>Reset Prototype Store</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {resetNotice && (
        <div className="bg-[#00855b] text-white text-center py-1 text-xs font-medium">
          Prototype data reset successfully!
        </div>
      )}
    </header>
  );
}
