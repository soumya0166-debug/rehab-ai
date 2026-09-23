'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Activity, 
  User, 
  Stethoscope, 
  HeartHandshake, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  ChevronDown, 
  Menu, 
  X,
  Check
} from 'lucide-react';
import { resetDemoData } from '@/lib/data/store';
import { USER_PERSONAS, getActivePersona, setActivePersona, UserPersona } from '@/lib/auth/rbac';
import { useAuth } from '@/lib/auth/auth-context';
import { normalizeRole } from '@/lib/auth/auth-service';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [resetNotice, setResetNotice] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(USER_PERSONAS[0]);

  useEffect(() => {
    setCurrentPersona(getActivePersona());
  }, []);

  const isClinician = pathname.startsWith('/clinician');
  const isPatient = pathname.startsWith('/patient');
  const isCaregiver = pathname.startsWith('/caregiver');
  const isAdmin = pathname.startsWith('/admin');

  const handleReset = () => {
    resetDemoData();
    setResetNotice(true);
    setTimeout(() => {
      setResetNotice(false);
      window.location.reload();
    }, 800);
  };

  const handleSelectPersona = (persona: UserPersona) => {
    setActivePersona(persona);
    setCurrentPersona(persona);
    setPersonaMenuOpen(false);

    // Auto-navigate to respective portal
    if (persona.role === 'patient') {
      router.push('/patient');
    } else if (persona.role === 'clinician') {
      router.push('/clinician');
    } else if (persona.role === 'caregiver') {
      router.push('/caregiver');
    } else if (persona.role === 'admin') {
      router.push('/admin');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-md shadow-cyan-900/40 group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-base font-bold tracking-tight text-white">REHAB</span>
              <span className="rounded bg-cyan-500/20 px-1 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/30">AI</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide">Computer Vision Recovery</p>
          </div>
        </Link>

        {/* Portal Switcher Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 p-1 shadow-inner">
          <Link
            href="/patient"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
              isPatient && !pathname.includes('/analytics')
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Patient
          </Link>

          <Link
            href="/patient/analytics"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              pathname.includes('/analytics')
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Analytics
          </Link>

          <Link
            href="/clinician"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
              isClinician
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Physiotherapist
          </Link>

          <Link
            href="/caregiver"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
              isCaregiver
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm shadow-pink-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            Caregiver
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
              isAdmin
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </Link>
        </nav>

        {/* Persona Switcher & Reset */}
        <div className="hidden sm:flex items-center gap-2.5">
          
          {/* Active Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition-colors"
            >
              <img
                src={currentPersona.avatarUrl}
                alt={currentPersona.name}
                className="h-5 w-5 rounded-full object-cover border border-slate-700"
              />
              <div className="text-left">
                <span className="font-semibold block leading-none">{currentPersona.name}</span>
                <span className="text-[10px] text-slate-400 font-normal capitalize">{currentPersona.role}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-1" />
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-800 bg-slate-950 p-1.5 shadow-2xl z-50 space-y-1 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-slate-500">
                  Switch Active Role (RBAC)
                </div>
                {USER_PERSONAS.map((persona) => {
                  const isSelected = persona.id === currentPersona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleSelectPersona(persona)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-left">
                        <img
                          src={persona.avatarUrl}
                          alt={persona.name}
                          className="h-6 w-6 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="text-white text-xs">{persona.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{persona.title}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleReset}
            title="Reset simulated cohort data"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            {resetNotice ? 'Resetting...' : 'Reset'}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2 text-xs">
          <Link
            href="/patient"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg p-2 text-slate-200 hover:bg-slate-800"
          >
            <User className="h-4 w-4 text-cyan-400" /> Patient Portal
          </Link>
          <Link
            href="/patient/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg p-2 text-slate-200 hover:bg-slate-800"
          >
            <TrendingUp className="h-4 w-4 text-purple-400" /> Analytics & Trends
          </Link>
          <Link
            href="/clinician"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg p-2 text-slate-200 hover:bg-slate-800"
          >
            <Stethoscope className="h-4 w-4 text-emerald-400" /> Physiotherapist Portal
          </Link>
          <Link
            href="/caregiver"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg p-2 text-slate-200 hover:bg-slate-800"
          >
            <HeartHandshake className="h-4 w-4 text-pink-400" /> Caregiver Portal
          </Link>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Select Persona</span>
            {USER_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => {
                  handleSelectPersona(persona);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:bg-slate-900"
              >
                <img src={persona.avatarUrl} alt={persona.name} className="h-5 w-5 rounded-full" />
                <span>{persona.name} ({persona.role})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
