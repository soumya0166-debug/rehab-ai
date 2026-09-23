'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ClinicianDashboardPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'flagged' | 'completed' | 'awaiting'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stage3Approved, setStage3Approved] = useState(false);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-4">
      
      {/* 1. Top Clinician Context Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] animate-pulse shrink-0"></span>
          <span className="font-label-sm text-xs text-[#00685f] uppercase tracking-wider font-bold truncate">
            Apollo Orthopedic Clinic • PT Mode Active
          </span>
        </div>
        <span className="font-label-sm text-xs bg-[#dae2fd] text-[#5c647a] px-3 py-1 rounded-full font-semibold border border-[#dce9ff] shrink-0">
          Dr. Mehta, PT
        </span>
      </div>

      {/* 2. Alert / Triage Ribbon */}
      <div className="bg-[#ffdad6] text-[#93000a] p-4 sm:p-5 rounded-2xl shadow-sm border border-[#ffdad6] flex items-start gap-3.5">
        <span className="material-symbols-outlined text-[#ba1a1a] text-[24px] shrink-0 mt-0.5">crisis_alert</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-headline text-sm sm:text-base font-bold text-[#93000a]">Triage Attention</p>
            <span className="font-label-sm text-[10px] bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full font-bold">
              High Priority
            </span>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#93000a] mt-0.5 leading-snug">
            2 Patients require angle threshold review today based on CV telemetry limits.
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Area */}
      <div className="flex flex-col gap-3 pt-1">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#565e74] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-[#0b1c30] font-body text-sm pl-11 pr-4 py-3 rounded-2xl shadow-sm border border-[#dce9ff] focus:outline-none focus:border-[#00685f] placeholder:text-[#565e74]"
            placeholder="Search patient by name, MRN, or condition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
              activeFilter === 'all'
                ? 'bg-[#00685f] text-white'
                : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e5eeff] border border-[#dce9ff]'
            }`}
          >
            <span>All Active</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">24</span>
          </button>
          <button
            onClick={() => setActiveFilter('flagged')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
              activeFilter === 'flagged'
                ? 'bg-[#00685f] text-white'
                : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e5eeff] border border-[#dce9ff]'
            }`}
          >
            <span>Flagged</span>
            <span className="bg-[#ba1a1a] text-white px-1.5 py-0.2 rounded-full text-[10px]">3</span>
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
              activeFilter === 'completed'
                ? 'bg-[#00685f] text-white'
                : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e5eeff] border border-[#dce9ff]'
            }`}
          >
            <span>Completed</span>
            <span className="bg-[#dce9ff] text-[#0b1c30] px-1.5 py-0.2 rounded-full text-[10px]">18</span>
          </button>
          <button
            onClick={() => setActiveFilter('awaiting')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-xs font-semibold transition-all ${
              activeFilter === 'awaiting'
                ? 'bg-[#00685f] text-white'
                : 'bg-[#eff4ff] text-[#3d4947] hover:bg-[#e5eeff] border border-[#dce9ff]'
            }`}
          >
            Awaiting Protocol
          </button>
        </div>
      </div>

      {/* 4. Patient Cards Roster */}
      <div className="flex flex-col gap-4">
        {/* Card 1: Rahul Sharma */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#dce9ff] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-13 h-13 rounded-full overflow-hidden shrink-0 bg-[#eff4ff] border border-[#dce9ff]">
                <img
                  className="w-full h-full object-cover"
                  alt="Rahul Sharma Headshot"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw5FQyIa5BxFDhfvgL6IH7CvhF7a9uEShKwo-tCYd7Oa_WfDdaT8rRY6q4bcFLReGLIEkgTJXZNIwxLnRbJEV6-i-qw2sKXyd-scCp778KPMh6TbrU7vacDSmiXrWA8BdhLPh2IQyShIwsQfcG3SoNmNSimcAdOauhsg3NgAYzeoTsVhWjSithelhMwrJA8enwWEJfhYR7Xuz_cpoFAD7B8Tverl-lyqEW78cKI9ZQgDf_ZlQCgo8IOw"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-base sm:text-lg font-bold text-[#0b1c30] truncate">Rahul Sharma</h2>
                  <span className="font-label-sm text-[11px] text-[#565e74] bg-[#eff4ff] px-2 py-0.5 rounded-md font-semibold border border-[#dce9ff]">
                    MRN-8820
                  </span>
                </div>
                <p className="font-body text-xs text-[#565e74] truncate mt-0.5">Adhesive Capsulitis • Right Shoulder</p>
              </div>
            </div>
            <span className="font-label-sm text-xs bg-[#00855b]/20 text-[#006947] px-3 py-1 rounded-full flex items-center gap-1.5 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006947]"></span>
              Active
            </span>
          </div>

          {/* Telemetry Live Status Strip */}
          <div className="bg-[#eff4ff] rounded-2xl p-4 flex flex-col gap-2 border border-[#dce9ff]">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs text-[#565e74]">Session Completed 42m ago</span>
              <span className="font-label-sm text-xs text-[#00685f] font-bold">Target: 70° - 80°</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl font-bold text-[#00685f]">76°</span>
                <span className="font-label-md text-xs text-[#3d4947]">Active ROM</span>
              </div>
              <span className="font-label-sm text-xs text-[#006947] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +6° vs last week
              </span>
            </div>
            {/* Angular Progress Bar */}
            <div className="w-full bg-[#dce9ff] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#00685f] h-full rounded-full" style={{ width: '76%' }}></div>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-3 gap-2 bg-[#eff4ff] p-3 rounded-2xl text-center border border-[#dce9ff]">
            <div className="flex flex-col items-center">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Compliance</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] mt-0.5">96%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Streak</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-[#00685f]">local_fire_department</span>
                <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30]">5 Days</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Pain Level</span>
              <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] mt-0.5">
                2/5 <span className="font-label-sm text-[10px] text-[#565e74] font-normal">(Mild)</span>
              </span>
            </div>
          </div>

          {/* AI Coach Priya Telemetry Insight */}
          <div className="bg-[#e5eeff] rounded-2xl p-4 flex items-start gap-3 border border-[#dce9ff]">
            <div className="w-8 h-8 rounded-full bg-[#00685f] flex items-center justify-center shrink-0 text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label-sm text-[11px] text-[#00685f] uppercase font-bold">AI Coach Priya Insight</span>
                <span className="font-label-sm text-[10px] text-[#565e74] font-semibold">Auto-CV</span>
              </div>
              <p className="font-body text-xs text-[#3d4947] mt-1 leading-relaxed">
                Stable glenohumeral rhythm. Trunk compensation negligible (&lt;4%). Ready for +5° corridor elevation.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link
              href="/clinician/analytics"
              className="w-full bg-[#00685f] hover:bg-[#005049] text-white py-3 px-3 rounded-xl font-headline text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">query_stats</span>
              <span className="truncate">Review Kinematics</span>
            </Link>
            <Link
              href="/clinician/prescriptions/new"
              className="w-full bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] py-3 px-3 rounded-xl font-headline text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#dce9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="truncate">Adjust Angles</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Pooja Verma (Flagged Deficit) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#dce9ff] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-13 h-13 rounded-full overflow-hidden shrink-0 bg-[#eff4ff] border border-[#dce9ff]">
                <img
                  className="w-full h-full object-cover"
                  alt="Pooja Verma Headshot"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuANsChtS6EYM0LHqU8M1RNmJdl5_R8etsftbsvtYEmOFXWIfc5LrqFSLvuvKzWOlodkGpsIBDDiagVsXh5EqgI4RK8YqGyPBluNVsJvFEaRzIo20c_PAllIAcLD2TlGusGxf-pmjV2NRYiTApS3gJO4GCM05Qbm68iLMaHWOspqOfLVoY7NyAiVDCaRgWuvmz3-C1FHxV3xDw75f639ZgpxECYTTLwKDzKdv7Zeu3PoE1ewT7O5wFrLQg"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-base sm:text-lg font-bold text-[#0b1c30] truncate">Pooja Verma</h2>
                  <span className="font-label-sm text-[11px] text-[#565e74] bg-[#eff4ff] px-2 py-0.5 rounded-md font-semibold border border-[#dce9ff]">
                    MRN-6419
                  </span>
                </div>
                <p className="font-body text-xs text-[#565e74] truncate mt-0.5">Post-ACL Reconstruction • Left Knee</p>
              </div>
            </div>
            <span className="font-label-sm text-xs bg-[#ffdad6] text-[#ba1a1a] px-3 py-1 rounded-full flex items-center gap-1.5 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
              Flagged Deficit
            </span>
          </div>

          <div className="bg-[#ffdad6]/40 p-4 rounded-2xl flex flex-col gap-1.5 border border-[#ffdad6]">
            <div className="flex items-center justify-between">
              <span className="font-headline text-xs font-bold text-[#ba1a1a] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">warning</span> Extension deficit -4°
              </span>
              <span className="font-label-sm text-xs text-[#3d4947]">Pain: 3.5/5 (Elevated)</span>
            </div>
            <p className="font-body text-xs text-[#3d4947] leading-relaxed">
              Terminal knee extension locked at -4° with hamstring guarding detected during terminal stance phase.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#eff4ff] p-3 rounded-2xl text-center border border-[#dce9ff]">
            <div className="flex flex-col items-center">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Compliance</span>
              <span className="font-headline text-sm font-bold text-[#ba1a1a] mt-0.5">78%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase">Attendance</span>
              <span className="font-headline text-sm font-bold text-[#565e74] mt-0.5">Missed Yesterday</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button className="w-full bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] py-3 px-3 rounded-xl font-headline text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#dce9ff] transition-colors">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span className="truncate">Message Patient</span>
            </button>
            <button className="w-full bg-[#00685f] hover:bg-[#005049] text-white py-3 px-3 rounded-xl font-headline text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">video_call</span>
              <span className="truncate">Tele-Consult</span>
            </button>
          </div>
        </div>

        {/* Card 3: Vikram Singh (On Track / Milestone Ready) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#dce9ff] flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-13 h-13 rounded-full overflow-hidden shrink-0 bg-[#eff4ff] border border-[#dce9ff]">
                <img
                  className="w-full h-full object-cover"
                  alt="Vikram Singh Headshot"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvn1ketBeIJ7BPI-CC5eVKZj4Yv-3SGpkaDXreG8M25zXmx0tTiXG_VgbGGpvi7b3LfeW5N9Ceqmk0eEm7Ur4N5ouamruuJmdbNPp4B8iyFXcsk8qBj1-Vv8bbpovu3YFWHqkq92MIgmMdbCXuzdB8MRulj138CNTC-WGqpLMB01w_M3Kl08NXGMtLcMVI65BLz-Lb2m2qkm9UrS88iTVxnyEeAP1qYqTZUhvLQ5iTOdg7kVxGc0iv3Q"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline text-base sm:text-lg font-bold text-[#0b1c30] truncate">Vikram Singh</h2>
                  <span className="font-label-sm text-[11px] text-[#565e74] bg-[#eff4ff] px-2 py-0.5 rounded-md font-semibold border border-[#dce9ff]">
                    MRN-5012
                  </span>
                </div>
                <p className="font-body text-xs text-[#565e74] truncate mt-0.5">Rotator Cuff Repair • Stage 2 Protocol</p>
              </div>
            </div>
            <span className="font-label-sm text-xs bg-[#dae2fd] text-[#5c647a] px-3 py-1 rounded-full flex items-center gap-1.5 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#565e74]"></span>
              On Track
            </span>
          </div>

          <div className="bg-[#eff4ff] rounded-2xl p-4 flex flex-col gap-2 border border-[#dce9ff]">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs text-[#565e74]">Timeline Milestone</span>
              <span className="font-label-sm text-xs text-[#00685f] font-bold">Day 32 of 60</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl font-bold text-[#00685f]">85°</span>
                <span className="font-label-md text-xs text-[#3d4947]">Abduction Arc</span>
              </div>
              <span className="font-label-sm text-xs text-[#006947] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Criteria Passed
              </span>
            </div>
            <div className="w-full bg-[#dce9ff] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#00855b] h-full rounded-full" style={{ width: '53%' }}></div>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => setStage3Approved(true)}
              disabled={stage3Approved}
              className={`w-full py-3.5 px-4 rounded-xl font-headline text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                stage3Approved
                  ? 'bg-[#00855b] text-white'
                  : 'bg-[#00685f] hover:bg-[#005049] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {stage3Approved ? 'task_alt' : 'verified'}
              </span>
              <span>{stage3Approved ? 'Stage 3 Approved' : 'Approve Stage 3 Protocol'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
