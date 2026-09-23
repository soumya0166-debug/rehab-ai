'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { speechEngine } from '@/lib/voice/speech-engine';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const patientName = user?.fullName?.split(' ')[0] || 'Rahul';

  // Greeting
  const [greeting, setGreeting] = useState('Good morning');
  const [voicePromptsOn, setVoicePromptsOn] = useState(true);
  const [highContrastOn, setHighContrastOn] = useState(false);
  const [activeLang, setActiveLang] = useState<'EN' | 'HI' | 'OR'>('EN');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleSpeakGuidance = () => {
    if (!voicePromptsOn) return;
    speechEngine.speak(
      `Hello ${patientName}. Dr. Priya here. Ready for today's rehabilitation? Your clinician Dr. Mehta scheduled three controlled mobility sets targeting 70 to 80 degrees range of motion.`
    );
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 gap-5">
      {/* 1. Header Greeting & Streak */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-[11px] text-[#565e74] tracking-wider uppercase font-semibold">
            Rehabilitation Program • Day 18
          </span>
          <h1 className="font-headline text-2xl sm:text-3xl text-[#0b1c30] font-bold tracking-tight mt-0.5">
            {greeting}, {patientName}.
          </h1>
        </div>
        <div className="flex items-center gap-1.5 bg-[#e5eeff] px-3 py-1 rounded-full shadow-sm border border-[#dce9ff]">
          <span className="material-symbols-outlined text-[#00685f] text-[18px]">local_fire_department</span>
          <span className="font-label-md text-xs text-[#0b1c30] font-bold">5 Day Streak</span>
        </div>
      </div>

      {/* 2. Readiness & Pace Metric Strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#eff4ff] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm border border-[#dce9ff]">
          <div className="w-11 h-11 rounded-full bg-[#008378]/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#00685f] text-[22px]">vital_signs</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-xs text-[#565e74] truncate">Readiness Score</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-headline text-2xl sm:text-3xl font-bold text-[#0b1c30]">92</span>
              <span className="font-label-sm text-xs font-bold text-[#00685f]">%</span>
            </div>
          </div>
        </div>

        <div className="bg-[#eff4ff] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm border border-[#dce9ff]">
          <div className="w-11 h-11 rounded-full bg-[#00855b]/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#006947] text-[22px]">pace</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-xs text-[#565e74] truncate">Prescribed Pace</span>
            <span className="font-headline text-lg sm:text-xl font-bold text-[#0b1c30] mt-0.5">Gentle Arc</span>
          </div>
        </div>
      </div>

      {/* 3. Virtual Human AI Coach Priya Hero Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-[#dce9ff] overflow-hidden flex flex-col">
        {/* Metahuman Cinematic Media Canvas */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#d3e4fe] overflow-hidden">
          <img
            alt="Dr. Priya, Virtual AI Physiotherapist"
            className="w-full h-full object-cover object-top"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw5ltbGG3SchKZAl_jZlM3nar9VV9EpbsznkY3PBMc_2qq5834aeNvct-pBbDc3XxonmztbgJAFI2mHJI5J-WVFAVU1NOWEtNFEtPdA5AVic3eDsDUdt1lNtXqnFsRBzBEcBLnJKv_mblVsEvutfl9TVq69vypNaR8HH_Rp5xKjWpu4DqKWOWmANMppvHsZbdfO_PsoSUjpuyiFO0rZI-BT7i7o0J_KDVGIDuicU1FyvNxLv1j6M4ZHA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/90 via-[#213145]/25 to-transparent"></div>

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 bg-[#213145]/85 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 shadow-sm border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6bd8cb] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#89f5e7]"></span>
            </span>
            <span className="font-label-sm text-[11px] text-[#eaf1ff]">Virtual Human AI • Idle &amp; Listening</span>
          </div>

          <div className="absolute top-3 right-3 bg-[#213145]/80 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 text-[#eaf1ff] shadow-sm border border-white/10">
            <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">mic</span>
            <span className="font-label-sm text-[11px] pr-1">Ready</span>
          </div>

          {/* Bottom Conversational Guidance Quote */}
          <div className="absolute bottom-3 left-3 right-3 bg-[#213145]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl text-[#eaf1ff] shadow-lg border border-white/10">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#89f5e7] text-[20px] shrink-0 mt-0.5">format_quote</span>
              <p className="font-body text-sm sm:text-base text-[#eaf1ff] leading-snug">
                Ready for today&apos;s rehabilitation? Your clinician Dr. Mehta scheduled 3 controlled mobility sets.
              </p>
            </div>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10">
              <span className="font-label-sm text-[11px] text-[#6bd8cb] font-semibold">Dr. Priya • Kinetic Specialist AI</span>
              <button
                onClick={handleSpeakGuidance}
                className="font-label-sm text-[11px] text-[#dae2fd] hover:text-white flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">volume_up</span> Voice Synthesizer Active
              </button>
            </div>
          </div>
        </div>

        {/* Protocol Details & Primary Action Trigger */}
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#565e74] uppercase tracking-wider font-semibold">Plan Directive</span>
              <h2 className="font-headline text-lg sm:text-xl font-bold text-[#0b1c30]">Today&apos;s Rehabilitation</h2>
            </div>
            <span className="font-label-md text-xs bg-[#dae2fd] text-[#5c647a] px-3 py-1 rounded-full font-semibold border border-[#dce9ff]">
              Target: 70° - 80° ROM
            </span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 sm:px-4 bg-[#eff4ff] rounded-xl text-[#565e74] border border-[#dce9ff]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#00685f]">fitness_center</span>
              <span className="font-label-md text-xs font-semibold">3 exercises</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#bcc9c6]"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#00685f]">schedule</span>
              <span className="font-label-md text-xs font-semibold">12 minutes</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#bcc9c6]"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#00685f]">videocam</span>
              <span className="font-label-md text-xs font-semibold">CV Tracking</span>
            </div>
          </div>

          <Link
            href="/patient/session/ex-002"
            className="relative group w-full h-14 bg-[#00685f] rounded-2xl flex items-center justify-center gap-2.5 text-white shadow-lg hover:bg-[#005049] active:scale-[0.99] transition-all overflow-hidden"
            id="start-session-btn"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            <span className="font-headline text-base font-semibold tracking-wide">Start Live Session with Priya</span>
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* 4. Exercise Protocol Preview */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline text-base sm:text-lg font-bold text-[#0b1c30]">Exercise Protocol Preview</h3>
          <span className="font-label-sm text-xs text-[#565e74]">Ordered by Dr. Mehta</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Exercise 1 */}
          <Link
            href="/patient/session/ex-002"
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#dce9ff] flex items-center justify-between gap-3 hover:border-[#00685f] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#e5eeff] flex items-center justify-center font-headline text-lg font-bold text-[#00685f] group-hover:bg-[#00685f] group-hover:text-white transition-colors">
                1
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] group-hover:text-[#00685f] transition-colors">
                  Left Shoulder Scapular Raise
                </span>
                <div className="flex items-center gap-2 text-[#565e74] mt-0.5">
                  <span className="font-label-sm text-[11px] bg-[#dce9ff] px-2 py-0.5 rounded text-[#3d4947] font-semibold">
                    Target: 70°–80°
                  </span>
                  <span className="font-body text-xs">• 10 reps</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#00685f] text-[24px] group-hover:scale-110 transition-transform">
              play_circle
            </span>
          </Link>

          {/* Exercise 2 */}
          <Link
            href="/patient/session/ex-001"
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#dce9ff] flex items-center justify-between gap-3 hover:border-[#00685f] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#e5eeff] flex items-center justify-center font-headline text-lg font-bold text-[#00685f] group-hover:bg-[#00685f] group-hover:text-white transition-colors">
                2
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] group-hover:text-[#00685f] transition-colors">
                  Elbow Flexion &amp; Extension
                </span>
                <div className="flex items-center gap-2 text-[#565e74] mt-0.5">
                  <span className="font-label-sm text-[11px] bg-[#dce9ff] px-2 py-0.5 rounded text-[#3d4947] font-semibold">
                    Target: 35°–145°
                  </span>
                  <span className="font-body text-xs">• 10 reps</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#565e74] text-[24px] group-hover:text-[#00685f] transition-colors">
              play_circle
            </span>
          </Link>

          {/* Exercise 3 */}
          <Link
            href="/patient/session/ex-003"
            className="bg-white rounded-2xl p-4 shadow-sm border border-[#dce9ff] flex items-center justify-between gap-3 hover:border-[#00685f] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#e5eeff] flex items-center justify-center font-headline text-lg font-bold text-[#00685f] group-hover:bg-[#00685f] group-hover:text-white transition-colors">
                3
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30] group-hover:text-[#00685f] transition-colors">
                  Controlled Sit-to-Stand
                </span>
                <div className="flex items-center gap-2 text-[#565e74] mt-0.5">
                  <span className="font-label-sm text-[11px] bg-[#dce9ff] px-2 py-0.5 rounded text-[#3d4947] font-semibold">
                    Target: 70°–160° Knee
                  </span>
                  <span className="font-body text-xs">• 8 reps</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#565e74] text-[24px] group-hover:text-[#00685f] transition-colors">
              play_circle
            </span>
          </Link>
        </div>
      </div>

      {/* 5. Session Accessibility Preferences */}
      <div className="bg-[#eff4ff] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-sm border border-[#dce9ff]">
        <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#565e74] font-bold">
          Session Accessibility Preferences
        </span>

        <div className="flex items-center justify-between py-1 border-b border-[#dce9ff]/60">
          <div className="flex items-center gap-2 text-[#0b1c30]">
            <span className="material-symbols-outlined text-[20px] text-[#00685f]">language</span>
            <span className="font-label-md text-xs sm:text-sm font-semibold">Audio Language</span>
          </div>
          <div className="flex items-center gap-1 bg-[#e5eeff] p-1 rounded-xl border border-[#dce9ff]">
            <button
              onClick={() => setActiveLang('EN')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLang === 'EN' ? 'bg-[#00685f] text-white shadow-sm' : 'text-[#3d4947] hover:text-[#00685f]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLang('HI')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLang === 'HI' ? 'bg-[#00685f] text-white shadow-sm' : 'text-[#3d4947] hover:text-[#00685f]'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setActiveLang('OR')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLang === 'OR' ? 'bg-[#00685f] text-white shadow-sm' : 'text-[#3d4947] hover:text-[#00685f]'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setVoicePromptsOn(!voicePromptsOn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
              voicePromptsOn ? 'bg-[#008378] text-white' : 'bg-[#e5eeff] text-[#565e74] border border-[#dce9ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
            <span>Voice Prompts: {voicePromptsOn ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setHighContrastOn(!highContrastOn)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
              highContrastOn ? 'bg-[#008378] text-white' : 'bg-[#e5eeff] text-[#565e74] border border-[#dce9ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">contrast</span>
            <span>High Contrast: {highContrastOn ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e5eeff] text-[#3d4947] text-xs font-semibold border border-[#dce9ff]">
            <span className="material-symbols-outlined text-[16px] text-[#006947]">motion_sensor_idle</span>
            <span>Motion Stabilizer: Active</span>
          </div>
        </div>
      </div>

      {/* 6. Clinical Verification Notice */}
      <div className="bg-[#dce9ff]/70 rounded-2xl p-4 flex items-start gap-3 border border-[#bcc9c6]/60">
        <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0 mt-0.5">verified_user</span>
        <div className="flex flex-col">
          <span className="font-label-sm text-[11px] uppercase tracking-wide text-[#00685f] font-bold">Clinical Verification Notice</span>
          <p className="font-body text-xs text-[#3d4947] leading-relaxed mt-0.5">
            Virtual Rehabilitation Assistant guidance only. Demonstrates clinician-configured exercises. Does not diagnose or replace professional medical care.
          </p>
        </div>
      </div>
    </div>
  );
}
