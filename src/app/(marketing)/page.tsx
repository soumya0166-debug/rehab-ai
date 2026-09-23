import Link from 'next/link';
import { 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Eye, 
  Scale, 
  UserCheck, 
  FileCheck2, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';

export default function MarketingPage() {
  return (
    <div className="space-y-24 py-16 px-4 sm:px-6">
      
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl text-center space-y-6">
        <Badge variant="default" className="px-3.5 py-1 text-xs">
          Assistive Clinical Technology · In-Browser Privacy
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Precision Computer Vision for{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Home Rehabilitation
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          REHAB-AI observes prescribed rehabilitation exercises, measures movement quality, provides real-time biomechanical feedback, and creates structured progress histories for your physiotherapist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link href="/patient/dashboard">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Open Patient Dashboard
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/clinician/dashboard">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Clinician Command Center
            </Button>
          </Link>
        </div>

        {/* Regulatory & Safety Callout */}
        <div className="pt-6 max-w-xl mx-auto">
          <Alert variant="info" title="Product Boundary Notice">
            REHAB-AI is an assistive rehabilitation monitoring system. It is not a doctor, diagnostic tool, or replacement for your licensed physiotherapist.
          </Alert>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section id="how-it-works" className="mx-auto max-w-7xl space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-semibold text-cyan-400 tracking-wider">Clinical Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How REHAB-AI Operates</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered with strict separation between deterministic biomechanics and assistive intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card className="hover:border-cyan-900/60">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 mb-2">
                <Eye className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">1. Computer Vision Tracking</CardTitle>
              <CardDescription>
                High-frequency browser pose estimation extracts 33 anatomical keypoints locally on your hardware. Zero video leaves your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  30+ FPS edge landmark extraction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  100% in-browser client computation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:border-teal-900/60">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-950/60 text-teal-400 border border-teal-800/80 mb-2">
                <Scale className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">2. Deterministic Biomechanics</CardTitle>
              <CardDescription>
                Mathematical vector engines calculate joint angles and count repetitions. Movement quality is verified against clinician-defined targets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  Exact 3D angle trigonometry
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  No AI hallucination in rep counts
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-900/60">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 mb-2">
                <UserCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">3. Clinician In The Loop</CardTitle>
              <CardDescription>
                Physiotherapists review verified telemetry, progression trends, and adjust prescription dosage. Telemetry bridges clinical follow-ups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  Structured progress trajectory
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  Full clinician prescription authority
                </li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Trust & Boundary Card */}
      <section id="safety" className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <Lock className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Our Responsible Healthcare Commitment</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          REHAB-AI does not use Large Language Models (LLMs) to diagnose, triage emergencies, or prescribe treatments. AI assistance is strictly confined to plain-English session summaries, multi-language coaching translations, and conversational guidance under licensed clinical supervision.
        </p>
      </section>

    </div>
  );
}
