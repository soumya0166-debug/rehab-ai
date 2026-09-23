'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function PatientProgressPage() {
  const [exporting, setExporting] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const handleConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00685f', '#14B8A6', '#38BDF8', '#6ffbbe'],
      });
    } catch {
      // Fallback if browser canvas is restricted
    }
  };

  const handleExportPdf = () => {
    setExporting(true);
    setExportToast('Compiling 18-day Kinematic Packet (Encrypted PDF generated)...');

    setTimeout(() => {
      setExportToast('Transmitted directly to Dr. Mehta\'s Clinical EMR portal!');
    }, 1500);

    setTimeout(() => {
      setExportToast(null);
      setExporting(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-5">
      {/* 1. Screen Context Title & Restorative Encouragement */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="font-headline text-2xl sm:text-3xl text-[#0b1c30] font-bold tracking-tight">
            Kinematic Progress &amp; Recovery
          </h1>
          <span className="font-body text-xs sm:text-sm text-[#565e74] flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#00855b]"></span>
            Telemetry synced with Dr. Mehta • Day 18 Post-Op
          </span>
        </div>
        <button
          onClick={handleConfetti}
          className="w-11 h-11 rounded-full bg-[#008378] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          title="Milestone Cheer"
          aria-label="Celebrate recovery milestone"
        >
          <span className="material-symbols-outlined text-[22px]">celebration</span>
        </button>
      </div>

      {/* 2. Top Stat Ribbon: Kinetic Triple Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Stat 1: ROM Gain */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#dce9ff] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[#00685f]">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold">ROM Gain</span>
          </div>
          <div className="my-1.5">
            <div className="font-headline text-xl sm:text-2xl font-bold text-[#00685f] tracking-tight">+28%</div>
            <div className="font-label-sm text-[11px] text-[#565e74] leading-tight">48° → 76° Peak</div>
          </div>
          <div className="w-full bg-[#eff4ff] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Stat 2: Adherence */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#dce9ff] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[#006947]">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold">Adherence</span>
          </div>
          <div className="my-1.5">
            <div className="font-headline text-xl sm:text-2xl font-bold text-[#006947] tracking-tight">96%</div>
            <div className="font-label-sm text-[11px] text-[#565e74] leading-tight">17 of 18 done</div>
          </div>
          <div className="w-full bg-[#eff4ff] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#00855b] h-full rounded-full" style={{ width: '96%' }}></div>
          </div>
        </div>

        {/* Stat 3: Pain / Fatigue Index */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#dce9ff] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[#5c647a]">
            <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold">Pain Index</span>
          </div>
          <div className="my-1.5">
            <div className="font-headline text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight">
              1.4<span className="font-body text-xs text-[#565e74] font-normal">/5</span>
            </div>
            <div className="font-label-sm text-[11px] text-[#006947] leading-tight flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">arrow_downward</span> Mild • Falling
            </div>
          </div>
          <div className="w-full bg-[#eff4ff] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#565e74] h-full rounded-full" style={{ width: '28%' }}></div>
          </div>
        </div>
      </div>

      {/* 3. Main Visual Chart Card: Shoulder Abduction Trajectory */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#dce9ff] flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="font-headline text-base sm:text-lg font-bold text-[#0b1c30]">
              Active Shoulder Abduction ROM
            </h2>
            <span className="font-body text-xs text-[#565e74]">Kinematic arc across Days 1 – 18</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#dae2fd] text-[#131b2e] font-label-sm text-xs font-semibold flex items-center gap-1.5 border border-[#dce9ff]">
            <span className="w-2 h-2 rounded-full bg-[#00685f] animate-ping"></span>
            Target: 80°
          </span>
        </div>

        {/* Interactive Annotation Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#eff4ff] text-[#00685f] text-xs border border-[#dce9ff]">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span className="font-headline text-xs font-bold flex-1">Optimal target corridor reached on Day 14!</span>
          <span className="font-label-sm text-[11px] text-[#565e74]">Ahead of average</span>
        </div>

        {/* Inline Vector Trajectory Curve with Corridor Band */}
        <div className="relative w-full h-52 bg-white rounded-xl pt-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 340 160">
            <defs>
              <linearGradient id="curveGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00685f" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00685f" stopOpacity="0.0" />
              </linearGradient>
              <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
                <feDropShadow dx="0" dy="2" floodColor="#00685f" floodOpacity="0.35" stdDeviation="3" />
              </filter>
            </defs>

            {/* Shaded target corridor band (70° - 85°) */}
            <rect fill="#dce9ff" fillOpacity="0.5" height="36" rx="6" width="340" x="0" y="24" />
            <text fill="#565e74" fontFamily="Inter" fontSize="9" fontWeight="600" x="8" y="35">
              TARGET RECOVERY CORRIDOR (70° - 85°)
            </text>

            {/* Horizontal Guides */}
            {/* Target Goal Line (80°) */}
            <line stroke="#008378" strokeDasharray="4,4" strokeOpacity="0.8" strokeWidth="1.5" x1="0" x2="340" y1="36" y2="36" />
            <text fill="#00685f" fontFamily="Plus Jakarta Sans" fontSize="10" fontWeight="600" x="290" y="32">
              80° Goal
            </text>

            {/* Day 1 Baseline Line (48°) */}
            <line stroke="#bec6e0" strokeDasharray="3,3" strokeWidth="1.2" x1="0" x2="340" y1="125" y2="125" />
            <text fill="#5c647a" fontFamily="Plus Jakarta Sans" fontSize="10" x="260" y="136">
              Baseline 48°
            </text>

            {/* Gradient Area Fill */}
            <path
              d="M 15 125 C 55 120, 85 112, 120 98 C 160 82, 205 60, 240 48 C 275 39, 305 40, 325 40 L 325 150 L 15 150 Z"
              fill="url(#curveGradient)"
            />

            {/* Trajectory Bezier Curve */}
            <path
              d="M 15 125 C 55 120, 85 112, 120 98 C 160 82, 205 60, 240 48 C 275 39, 305 40, 325 40"
              fill="none"
              filter="url(#glow)"
              stroke="#00685f"
              strokeLinecap="round"
              strokeWidth="3.5"
            />

            {/* Milestones */}
            <circle cx="15" cy="125" fill="#ffffff" r="4.5" stroke="#565e74" strokeWidth="2.5" />
            <circle cx="120" cy="98" fill="#ffffff" r="3.5" stroke="#00685f" strokeWidth="2" />
            <circle cx="240" cy="48" fill="#6ffbbe" r="4.5" stroke="#006947" strokeWidth="2" />
            <circle cx="325" cy="40" fill="#89f5e7" fillOpacity="0.5" r="7" />
            <circle cx="325" cy="40" fill="#ffffff" r="4.5" stroke="#00685f" strokeWidth="3" />
          </svg>
        </div>

        {/* Timeline X-Axis & Today Indicator */}
        <div className="flex justify-between items-center px-1 text-[#565e74] font-label-sm text-[11px] border-t border-[#eff4ff] pt-2">
          <span>Day 1 (48°)</span>
          <span>Day 6</span>
          <span className="text-[#006947] font-semibold">Day 14 (Target Met)</span>
          <span className="text-[#00685f] font-bold">Today: Day 18 (76°)</span>
        </div>
      </div>

      {/* 4. Weekly Kinematic Breakdown: 3 Quality Pillars */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-headline text-base sm:text-lg font-bold text-[#0b1c30]">
            Kinematic Telemetry Quality
          </span>
          <span className="font-label-sm text-xs text-[#006947] bg-[#eff4ff] border border-[#dce9ff] px-2.5 py-0.5 rounded-full font-semibold">
            CV Engine • Validated
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Quality Score */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-[#dce9ff] flex flex-col items-center text-center">
            <div className="relative w-14 h-14 flex items-center justify-center my-1">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path className="text-[#eff4ff]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <path className="text-[#00685f]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="92, 100" strokeLinecap="round" strokeWidth="3.5" />
              </svg>
              <span className="absolute font-headline text-base font-bold text-[#00685f]">92</span>
            </div>
            <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">Form Quality</span>
            <span className="font-label-sm text-[10px] text-[#565e74]">Top tier range</span>
          </div>

          {/* Velocity Stability */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-[#dce9ff] flex flex-col items-center text-center">
            <div className="relative w-14 h-14 flex items-center justify-center my-1">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path className="text-[#eff4ff]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <path className="text-[#00855b]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="94, 100" strokeLinecap="round" strokeWidth="3.5" />
              </svg>
              <span className="absolute font-headline text-base font-bold text-[#006947]">94%</span>
            </div>
            <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">Cadence Smooth</span>
            <span className="font-label-sm text-[10px] text-[#565e74]">Velocity steady</span>
          </div>

          {/* Trunk Compensation */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-[#dce9ff] flex flex-col items-center text-center">
            <div className="relative w-14 h-14 flex items-center justify-center my-1">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path className="text-[#eff4ff]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <path className="text-[#008378]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="4, 100" strokeLinecap="round" strokeWidth="3.5" />
              </svg>
              <span className="absolute font-headline text-base font-bold text-[#0b1c30]">4%</span>
            </div>
            <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">Trunk Lean</span>
            <span className="font-label-sm text-[10px] text-[#006947] font-semibold">Minimal • Safe</span>
          </div>
        </div>
      </div>

      {/* 5. Visual Delight & Recovery Affirmation Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#008378] to-[#00685f] text-white rounded-3xl p-5 sm:p-6 shadow-md flex items-center gap-4">
        <div className="flex-1 z-10">
          <div className="flex items-center gap-1.5 text-[#89f5e7] mb-1">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold">Milestone Unlocked</span>
          </div>
          <h3 className="font-headline text-base sm:text-lg font-bold text-white">Functional Independence Band</h3>
          <p className="font-body text-xs sm:text-sm text-[#f4fffc]/90 mt-0.5 leading-snug">
            Your 76° abduction lets you perform unassisted overhead reach tasks safely!
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm z-10">
          <span className="material-symbols-outlined text-[32px] text-[#89f5e7]">accessibility_new</span>
        </div>
        <div className="absolute -right-6 -bottom-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* 6. Recent Session History */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-headline text-base sm:text-lg font-bold text-[#0b1c30]">Recent Session History</span>
          <span className="font-label-sm text-xs text-[#00685f] font-bold">18 Completed</span>
        </div>

        {/* Session Item 1 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dce9ff] flex flex-col gap-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#00685f]">
                <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] leading-tight">
                  Shoulder Raise &amp; Wall Slides
                </span>
                <span className="font-body text-xs text-[#565e74]">Today • 10:35 AM • 18 min</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#006947] font-label-sm text-xs flex items-center gap-1 font-semibold border border-[#dce9ff]">
              <span className="material-symbols-outlined text-[13px]">cloud_done</span>
              Synced
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-1 bg-[#eff4ff] p-2.5 rounded-xl text-center border border-[#dce9ff]/60">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Reps</span>
              <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">10/10</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Peak ROM</span>
              <span className="font-headline text-xs sm:text-sm font-bold text-[#00685f]">76°</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Confidence</span>
              <span className="font-headline text-xs sm:text-sm font-bold text-[#006947]">94%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Reported</span>
              <span className="font-headline text-xs sm:text-sm font-semibold text-[#565e74]">Mild 2/5</span>
            </div>
          </div>
        </div>

        {/* Session Item 2 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#dce9ff] flex flex-col gap-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#00685f]">
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] leading-tight">
                  External Rotation &amp; Scapular Hold
                </span>
                <span className="font-body text-xs text-[#565e74]">Yesterday • 4:15 PM • 15 min</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#006947] font-label-sm text-xs flex items-center gap-1 font-semibold border border-[#dce9ff]">
              <span className="material-symbols-outlined text-[13px]">cloud_done</span>
              Synced
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-1 bg-[#eff4ff] p-2.5 rounded-xl text-center border border-[#dce9ff]/60">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Reps</span>
              <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">12/12</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Peak ROM</span>
              <span className="font-headline text-xs sm:text-sm font-bold text-[#00685f]">74°</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Confidence</span>
              <span className="font-headline text-xs sm:text-sm font-bold text-[#006947]">91%</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Reported</span>
              <span className="font-headline text-xs sm:text-sm font-semibold text-[#565e74]">Min 1/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Export Telemetry Action & Clinician Note */}
      <div className="flex flex-col gap-2.5 pt-1">
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="w-full h-13 bg-[#00685f] hover:bg-[#005049] text-white rounded-2xl font-headline text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all disabled:opacity-75"
          id="export-pdf-btn"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          <span>{exporting ? 'Processing Encrypted PDF...' : 'Export Telemetry PDF for Dr. Mehta'}</span>
        </button>

        {exportToast && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#e5eeff] text-[#0b1c30] text-xs border border-[#dce9ff] transition-all">
            <span className="material-symbols-outlined text-[#00685f] text-[18px]">check_circle</span>
            <span className="font-medium">{exportToast}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[#565e74] pt-1">
          <span className="material-symbols-outlined text-[16px] text-[#00685f]">security</span>
          <span className="font-label-sm text-[11px]">HIPAA • 256-Bit Cryptographic Telemetry Signature</span>
        </div>
      </div>
    </div>
  );
}
