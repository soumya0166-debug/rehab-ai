'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Calendar, 
  Bell, 
  Sparkles, 
  Send, 
  MessageSquareHeart, 
  Activity, 
  User, 
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { getPatients } from '@/lib/data/store';
import { PatientProfile } from '@/types/rehab';

export default function CaregiverPortalPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [cheerMessage, setCheerMessage] = useState('');
  const [sentCheer, setSentCheer] = useState(false);

  useEffect(() => {
    const list = getPatients();
    if (list.length > 0) {
      setPatient(list[0]); // Sarah Connor
    }
  }, []);

  if (!patient) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        Loading caregiver portal...
      </div>
    );
  }

  const latestSession = patient.history[0];
  const caregiver = patient.caregiver || {
    name: 'John Connor',
    relationship: 'Spouse / Primary Caregiver',
    notifyOnPainAlert: true,
  };

  const handleSendCheer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheerMessage.trim()) return;
    setSentCheer(true);
    setCheerMessage('');
    setTimeout(() => setSentCheer(false), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Caregiver Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-950/40 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-950">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Family & Caregiver Portal</h1>
                <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-semibold text-pink-400 border border-pink-500/20">
                  {caregiver.relationship}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Monitoring Recovery for: <strong className="text-white">{patient.name}</strong> ({patient.condition})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Notifications Active
            </span>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs">
          
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Today's Workout</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="h-4 w-4" /> Completed on Schedule
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Pain Level</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5">
                {latestSession ? `${latestSession.painScore} / 10 (Mild)` : '2 / 10 (Mild)'}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-medium">
              Stable
            </span>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Adherence Streak</span>
              <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                <Flame className="h-4 w-4 fill-amber-400" /> {patient.complianceStreak} Consecutive Days
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 font-medium">92% Weekly</span>
          </div>

        </div>
      </div>

      {/* Main Grid: AI Plain-English Digest & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Plain-English AI Milestone Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Weekly Recovery Digest Card */}
          <div className="rounded-2xl border border-pink-900/40 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-400" />
                <div>
                  <h2 className="text-base font-bold text-white">AI Weekly Family Recovery Update</h2>
                  <p className="text-xs text-slate-400">Plain-language recovery milestones synthesized from camera telemetry</p>
                </div>
              </div>
              <span className="text-[10px] bg-pink-950 text-pink-300 border border-pink-800 px-2.5 py-0.5 rounded-full font-medium">
                Week 5 Post-Op
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong className="text-white">Great news!</strong> {patient.name} has completed all <strong className="text-emerald-400">6 of 6</strong> assigned rehabilitation sessions this week.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
                <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Mobility Milestone</span>
                  <span className="text-sm font-bold text-cyan-300 mt-1 block">Full 180° Knee Extension Reached!</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Her computer vision knee angle measured 180°, meeting Dr. Chen's post-op target 4 days ahead of schedule.
                  </p>
                </div>
                <div className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Movement Safety & Comfort</span>
                  <span className="text-sm font-bold text-emerald-300 mt-1 block">Zero Compensations Detected</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    She avoided leaning backward to cheat the quadriceps lift, showing strong thigh muscle recovery.
                  </p>
                </div>
              </div>
              <p className="text-slate-400 text-[11px]">
                Reported discomfort was minimal (2 out of 10), and she has not triggered any clinical pain alerts this week.
              </p>
            </div>
          </div>

          {/* Send Cheer & Encouragement Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquareHeart className="h-5 w-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Send Encouragement to {patient.name}</h3>
                <p className="text-xs text-slate-400">Your message will display directly on her workout screen</p>
              </div>
            </div>

            <form onSubmit={handleSendCheer} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Proud of your 6-day streak! Keep up the great work! ❤️"
                  value={cheerMessage}
                  onChange={(e) => setCheerMessage(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-pink-950 hover:from-pink-400 hover:to-rose-500 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send Cheer
                </button>
              </div>

              {sentCheer && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Encouragement sent! It will show at the start of {patient.name}'s next workout.
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Right Column (1 Col): Caregiver Notifications Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="h-4 w-4 text-cyan-400" />
              Caregiver Notifications
            </h3>
            <span className="text-[10px] text-slate-500">Live Feed</span>
          </div>

          <div className="space-y-3">
            
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Session Completed
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Today 14:15</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {patient.name} completed 10 reps of Seated Knee Extension with a 98% form score.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" /> Milestone Reached
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Yesterday</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Knee extension range reached 180° full extension milestone!
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400" /> Streak Milestone
                </span>
                <span className="text-[10px] text-slate-500 font-mono">2 days ago</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {patient.name} achieved a 5-day continuous exercise streak without missing a day.
              </p>
            </div>

          </div>

          {/* Primary Clinician Contact Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2 mt-4 text-xs">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Supervising Clinician</span>
            <div className="font-bold text-white">{patient.assignedClinician}</div>
            <p className="text-slate-400 text-[11px]">Sports Orthopedic Physical Therapy Clinic</p>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px]">
              <span className="text-slate-400">Next Clinic Check-in:</span>
              <span className="text-emerald-400 font-medium">Oct 4, 2026</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
