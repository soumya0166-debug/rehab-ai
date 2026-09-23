'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Camera, 
  Volume2, 
  Bell, 
  Save, 
  Check, 
  ArrowLeft 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { getCurrentUser } from '@/lib/auth/auth';
import { siteConfig } from '@/config/site';

export default function SettingsPage() {
  const user = getCurrentUser();
  const [voiceAssistance, setVoiceAssistance] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-cyan-400" />
            System & Accessibility Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account preferences, computer vision settings, and accessibility options.
          </p>
        </div>

        <Link href={user.role === 'patient' ? '/patient/dashboard' : '/clinician/dashboard'}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* User Account Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-base">Active Account Profile</CardTitle>
            </div>
            <CardDescription>Your registered identity in REHAB-AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={user.fullName}
                disabled
              />
              <Input
                label="Email Address"
                value={user.email}
                disabled
              />
            </div>
            <div className="text-[11px] text-slate-500">
              Account Role: <strong className="text-slate-300 capitalize">{user.role}</strong> (Assigned via clinical portal)
            </div>
          </CardContent>
        </Card>

        {/* Vision & Camera Privacy Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-teal-400" />
              <CardTitle className="text-base">Computer Vision & Privacy</CardTitle>
            </div>
            <CardDescription>Edge-computing privacy controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">In-Browser Landmark Extraction</span>
                  <p className="text-[11px] text-slate-400">Never transmit video streams or frames across the network.</p>
                </div>
                <span className="text-emerald-400 font-mono text-xs font-semibold">Enforced (Always Active)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
              <div>
                <span className="font-semibold text-white block">Audio Coaching Prompts</span>
                <p className="text-[11px] text-slate-400">Real-time voice guidance during repetition holds.</p>
              </div>
              <input
                type="checkbox"
                checked={voiceAssistance}
                onChange={(e) => setVoiceAssistance(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimers & Legal Notice */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-base">Medical Safety Disclaimers</CardTitle>
            </div>
            <CardDescription>Clinical boundaries and terms of use</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 leading-relaxed">
              {siteConfig.medicalDisclaimer.full}
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="h-4 w-4" />
              <span>Preferences saved successfully.</span>
            </div>
          ) : <div />}

          <Button type="submit" variant="primary">
            <Save className="h-4 w-4 mr-1.5" />
            <span>Save Preferences</span>
          </Button>
        </div>

      </form>

    </div>
  );
}
