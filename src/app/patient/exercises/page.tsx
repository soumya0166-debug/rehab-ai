'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PatientExercisesPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'favorites'>('today');
  const [adjustmentRequested, setAdjustmentRequested] = useState(false);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-5">
      {/* 1. Header Context Meta */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-2xl sm:text-3xl text-[#0b1c30] font-bold tracking-tight">
            My Exercises
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dae2fd] text-[#5c647a] font-label-sm text-xs font-semibold border border-[#dce9ff]">
            <span className="material-symbols-outlined text-[15px] text-[#00685f]">medical_services</span>
            Rx Sync Active
          </span>
        </div>
        <p className="font-body text-xs sm:text-sm text-[#565e74] flex items-center gap-2">
          <span>Prescribed by Dr. Mehta</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#bcc9c6]"></span>
          <span className="font-label-md text-xs font-bold text-[#00685f]">Day 18 of 42</span>
        </p>
      </div>

      {/* 2. Top Clinical Summary Card (Bento Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 sm:p-6 shadow-md border border-[#dce9ff]">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#eff4ff] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#00685f] font-bold">
                Prescribed Protocol
              </span>
              <h2 className="font-headline text-base sm:text-lg font-bold text-[#0b1c30] mt-0.5 leading-snug">
                Right Shoulder Post-Op Subacromial Decompression
              </h2>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00855b] text-white font-label-sm text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe] animate-ping"></span>
              Active Protocol
            </span>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="flex flex-col rounded-xl bg-[#eff4ff] p-3 border border-[#dce9ff]">
              <span className="font-label-sm text-[11px] text-[#565e74]">Daily Total</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] mt-0.5">3 Drills</span>
            </div>
            <div className="flex flex-col rounded-xl bg-[#eff4ff] p-3 border border-[#dce9ff]">
              <span className="font-label-sm text-[11px] text-[#565e74]">Estimated Time</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] mt-0.5">12 mins</span>
            </div>
            <div className="flex flex-col rounded-xl bg-[#eff4ff] p-3 border border-[#dce9ff]">
              <span className="font-label-sm text-[11px] text-[#565e74]">Kinetic ROM</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#00685f] mt-0.5">70°–85°</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Segment Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-full font-label-md text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'today'
              ? 'bg-[#00685f] text-white shadow-sm'
              : 'bg-[#e5eeff] text-[#3d4947] hover:bg-[#dce9ff]'
          }`}
        >
          Today&apos;s Protocol (3)
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full font-label-md text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'all'
              ? 'bg-[#00685f] text-white shadow-sm'
              : 'bg-[#e5eeff] text-[#3d4947] hover:bg-[#dce9ff]'
          }`}
        >
          All Exercises (8)
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-full font-label-md text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
            activeTab === 'favorites'
              ? 'bg-[#00685f] text-white shadow-sm'
              : 'bg-[#e5eeff] text-[#3d4947] hover:bg-[#dce9ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[15px] text-[#ba1a1a]">favorite</span>
          Saved Favorites
        </button>
      </div>

      {/* 4. Primary Exercise Card: Active / Ready Now */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-md border border-[#dce9ff] flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008378]/20 text-[#00685f] font-label-sm text-xs font-bold border border-[#008378]/30">
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            Computer Vision Ready
          </span>
          <span className="font-label-sm text-xs text-[#565e74] flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#006947]">check_circle</span>
            Phase II Stabilization
          </span>
        </div>

        {/* Demonstration Media Preview with Coach Priya */}
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden group">
          <img
            alt="Coach Priya Shoulder Raise"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFKIg0V-LhpkLXmXw7vZWnwr5qkneGFX1F_W220GL1MhvMzlAKDWcXbOYN5nhchHG-xDvn7gb6o-FoZbcCR_ENYcpTuKWncMLi6NwBOYRPpLmm71KveIMIt0_fo6tj5LIRjB0L7fUEIhhdOlSDc0BQ9i71myRIanTp5P-vkxujZGD0c5r1M8SbhhxIX1mbvdWaEVr7PUDH3ALdsl9CeHsPdzEw00LpOWQk2eThXLhi3nFej3lJNnIy6g"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/85 via-transparent to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00685f] flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[20px] text-white">play_arrow</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-xs text-[#89f5e7] font-bold">Coach Priya • Guided Reps</span>
                  <span className="font-body text-[11px] text-white/90">60 FPS Precision Landmark Tracking</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#213145]/80 text-[#eaf1ff] font-label-sm text-[11px] backdrop-blur-md">
                2.4s Cadence
              </span>
            </div>
          </div>
        </div>

        {/* Title & Biometrics Matrix */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <h3 className="font-headline text-lg sm:text-xl font-bold text-[#0b1c30]">
              Left Shoulder Scapular Raise
            </h3>
            <button aria-label="Bookmark exercise" className="p-1 rounded-full text-[#565e74] hover:text-[#00685f] transition-colors">
              <span className="material-symbols-outlined text-[20px]">bookmark_border</span>
            </button>
          </div>

          {/* Prescribed Targets Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-xl bg-[#eff4ff] p-2.5 text-center border border-[#dce9ff]">
              <span className="font-label-sm text-[10px] text-[#565e74] block uppercase font-bold">Target ROM</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#00685f]">70°–80°</span>
            </div>
            <div className="rounded-xl bg-[#eff4ff] p-2.5 text-center border border-[#dce9ff]">
              <span className="font-label-sm text-[10px] text-[#565e74] block uppercase font-bold">Volume</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30]">3 × 10</span>
            </div>
            <div className="rounded-xl bg-[#eff4ff] p-2.5 text-center border border-[#dce9ff]">
              <span className="font-label-sm text-[10px] text-[#565e74] block uppercase font-bold">Hold / Pace</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30]">2.4s Slow</span>
            </div>
          </div>

          {/* Target Musculature Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#3d4947] font-label-sm text-[11px] font-semibold border border-[#dce9ff]">Anterior Deltoid</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#3d4947] font-label-sm text-[11px] font-semibold border border-[#dce9ff]">Serratus Anterior</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#3d4947] font-label-sm text-[11px] font-semibold border border-[#dce9ff]">Supraspinatus</span>
          </div>

          {/* Clinician Note Callout */}
          <div className="rounded-xl bg-[#dce9ff]/70 p-3.5 flex items-start gap-2.5 mt-1 border border-[#bcc9c6]/60">
            <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">note_alt</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-[#00685f] font-bold">Dr. Mehta Note</span>
              <p className="font-body text-xs text-[#3d4947] leading-relaxed mt-0.5">
                Focus on keeping scapula retracted, no hiking. Pause 0.5s at peak corridor.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Interactive Trigger */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/patient/session/ex-002"
            className="w-full py-3.5 px-4 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white font-headline text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span>Start Exercise with Coach Priya</span>
          </Link>
          <Link
            href="/patient/session/ex-002"
            className="w-full py-2.5 px-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-headline text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#e5eeff] border border-[#dce9ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[#565e74]">view_in_ar</span>
            <span>Preview 3D Mechanics</span>
          </Link>
        </div>
      </div>

      {/* 5. Exercise Card 2: Wall Slide & Scapular Retraction */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#dce9ff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dae2fd] flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-[22px]">accessibility_new</span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Wall Slide &amp; Retraction</h3>
              <span className="font-label-sm text-xs text-[#565e74]">Scheduled Today • Up Next</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#eff4ff] text-[#565e74] font-label-sm text-xs font-bold border border-[#dce9ff]">
            2 Sets × 8
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1">
          <div className="rounded-xl bg-[#eff4ff] p-2.5 border border-[#dce9ff]">
            <span className="font-label-sm text-[10px] text-[#565e74] block uppercase font-bold">Target Angle</span>
            <span className="font-headline text-sm font-bold text-[#00685f]">85° Max Elevation</span>
          </div>
          <div className="rounded-xl bg-[#eff4ff] p-2.5 border border-[#dce9ff]">
            <span className="font-label-sm text-[10px] text-[#565e74] block uppercase font-bold">Clinical Focus</span>
            <span className="font-headline text-sm font-bold text-[#0b1c30] truncate">Thoracic Stability</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-label-sm text-xs text-[#565e74] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#006947]">check</span>
            Glenohumeral posture calibrated
          </span>
          <Link
            href="/patient/session/ex-001"
            className="px-3.5 py-1.5 rounded-lg bg-[#eff4ff] text-[#00685f] font-label-md text-xs font-bold hover:bg-[#00685f] hover:text-white border border-[#dce9ff] transition-all flex items-center gap-1"
          >
            <span>Ready</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* 6. Exercise Card 3: Isometric External Rotation */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#dce9ff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5eeff] flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-[22px]">rotate_right</span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Isometric External Rotation</h3>
              <span className="font-label-sm text-xs text-[#565e74]">Scheduled Today • End Finisher</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#eff4ff] text-[#565e74] font-label-sm text-xs font-bold border border-[#dce9ff]">
            3 Sets × 15s
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1">
          <div className="rounded-xl bg-[#eff4ff] p-2.5 border border-[#dce9ff]">
            <span className="font-label-sm text-[10px] text-[#565e74] block uppercase font-bold">Angle Range</span>
            <span className="font-headline text-sm font-bold text-[#00685f]">Neutral 0°–15°</span>
          </div>
          <div className="rounded-xl bg-[#eff4ff] p-2.5 border border-[#dce9ff]">
            <span className="font-label-sm text-[10px] text-[#565e74] block uppercase font-bold">Static Hold</span>
            <span className="font-headline text-sm font-bold text-[#0b1c30]">15s Tension</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-label-sm text-xs text-[#565e74] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">timer</span>
            Submaximal rotator cuff cue
          </span>
          <Link
            href="/patient/session/ex-003"
            className="px-3.5 py-1.5 rounded-lg bg-[#eff4ff] text-[#00685f] font-label-md text-xs font-bold hover:bg-[#00685f] hover:text-white border border-[#dce9ff] transition-all flex items-center gap-1"
          >
            <span>Ready</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* 7. Exercise Card 4: Locked / Progression Preview */}
      <div className="rounded-2xl bg-[#eff4ff] p-5 border border-[#dce9ff] flex flex-col gap-2.5 opacity-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d3e4fe] flex items-center justify-center text-[#565e74]">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Pendulum &amp; Codman Swing</h3>
              <span className="font-label-sm text-xs text-[#565e74]">Passive Joint Decompression</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#d3e4fe] text-[#3d4947] font-label-sm text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock_clock</span>
            Unlocks Day 21
          </span>
        </div>
        <p className="font-body text-xs text-[#565e74] leading-relaxed">
          Targeted for next rehabilitation checkpoint following your live Range-of-Motion assessment with Dr. Mehta.
        </p>
      </div>

      {/* 8. Bottom Clinician Escalation & Adjustment Card */}
      <div className="rounded-2xl bg-[#eff4ff] p-4 sm:p-5 flex items-center justify-between gap-3 border border-[#dce9ff]">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#00685f] text-[24px] mt-0.5">tune</span>
          <div className="flex flex-col">
            <h4 className="font-headline text-sm sm:text-base font-bold text-[#0b1c30]">Need an adjustment?</h4>
            <p className="font-body text-xs text-[#565e74]">Request resistance or angle modification from Dr. Mehta.</p>
          </div>
        </div>
        <button
          onClick={() => setAdjustmentRequested(true)}
          disabled={adjustmentRequested}
          aria-label="Request prescription change"
          className="shrink-0 px-3.5 py-2 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:bg-[#00855b]"
        >
          <span className="material-symbols-outlined text-[16px]">
            {adjustmentRequested ? 'check' : 'send'}
          </span>
          <span>{adjustmentRequested ? 'Transmitted' : 'Request'}</span>
        </button>
      </div>
    </div>
  );
}
