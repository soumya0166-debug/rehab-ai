'use client';

import React, { useState } from 'react';
import {
  User,
  Globe,
  Mic,
  Volume2,
  ShieldCheck,
  Check,
  Save,
  Phone,
  Mail,
  HeartPulse,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/i18n/languages';
import { speechEngine } from '@/lib/voice/speech-engine';

export default function PatientProfilePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [voiceAssistanceEnabled, setVoiceAssistanceEnabled] = useState(true);
  const [speechCommandsEnabled, setSpeechCommandsEnabled] = useState(true);
  const [largeTextMode, setLargeTextMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    speechEngine.setLanguage(lang);
    const greeting = lang === 'hi' ? 'भाषा हिन्दी में सेट की गई।' : lang === 'or' ? 'ଭାଷା ଓଡ଼ିଆରେ ସେଟ୍ ହୋଇଛି।' : 'Language set to English.';
    speechEngine.speak(greeting, lang);
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className={`space-y-8 max-w-4xl mx-auto py-2 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="h-7 w-7 text-primary" />
          Patient Profile & Accessibility Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal information, language preferences, and voice navigation options.
        </p>
      </div>

      {/* Patient Demographic Card */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Personal Health Record Profile</CardTitle>
              <CardDescription>Managed under clinical supervision</CardDescription>
            </div>
            <Badge variant="success">Active Protocol</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Full Patient Name</span>
              <span className="font-bold text-white text-sm">Sarah Connor</span>
              <span className="text-slate-400 block text-[11px]">DOB: 12/04/1965 (Age 61)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Current Rehabilitation Goal</span>
              <span className="font-bold text-white text-sm">Right Total Knee Arthroplasty (TKA)</span>
              <span className="text-slate-400 block text-[11px]">Surgery Date: August 15, 2026</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Supervising Physiotherapist</span>
              <span className="font-bold text-white text-sm">Dr. Michael Chen, PT, DPT</span>
              <span className="text-slate-400 block text-[11px]">Clinic: Metro Orthopedic Recovery Center</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Emergency & Caregiver Contact</span>
              <span className="font-bold text-white text-sm">John Connor (Spouse)</span>
              <span className="text-slate-400 block text-[11px]">+1 (555) 234-8901 · Notified on pain flags</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Voice Accessibility Card */}
      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="text-base text-white">Language & Spoken Guidance</CardTitle>
          </div>
          <CardDescription>
            Choose your preferred language for written instructions, voice coaching, and speech recognition.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection Radios */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Primary Interface Language:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/15 border-primary text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold block">{lang.nativeLabel}</span>
                      <span className="text-[11px] text-slate-400">{lang.label}</span>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Guidance Toggles */}
          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Read Instructions Aloud (Text-to-Speech)</span>
                  <span className="text-slate-400 text-[11px]">
                    Provides clear, deliberate spoken coaching cues during exercises for elderly assistance.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceAssistanceEnabled}
                onChange={(e) => setVoiceAssistanceEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Hands-Free Voice Commands</span>
                  <span className="text-slate-400 text-[11px]">
                    Allows speaking commands (&quot;Start exercise&quot;, &quot;Pause&quot;, &quot;Resume&quot;, &quot;Stop&quot;).
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={speechCommandsEnabled}
                onChange={(e) => setSpeechCommandsEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Large Accessible Text Mode</span>
                  <span className="text-slate-400 text-[11px]">
                    Increases interface typography size and button contrast for enhanced readability.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={largeTextMode}
                onChange={(e) => setLargeTextMode(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer rounded"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-2 border-t border-slate-800">
          <Button onClick={handleSaveSettings} className="gap-2 px-6">
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
