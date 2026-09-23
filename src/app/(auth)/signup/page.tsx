'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  User, 
  Stethoscope, 
  HeartHandshake, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth/auth-context';
import { CanonicalRole } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading: authLoading } = useAuth();

  const [role, setRole] = useState<CanonicalRole>('PATIENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [hasConsented, setHasConsented] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await signup({
        email,
        password,
        fullName,
        role,
        language,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed. Please check your inputs.');
      }
      // If successful, AuthContext signup automatically navigates to appropriate dashboard!
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during account registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-xl">Create REHAB-AI Account</CardTitle>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800">
              Supabase Auth
            </span>
          </div>
          <CardDescription>
            Register for clinical tele-rehabilitation monitoring and movement tracking.
          </CardDescription>
        </CardHeader>

        {/* Role Selector Grid */}
        <div className="px-6">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Clinical Role</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
                role === 'PATIENT' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('PHYSIOTHERAPIST')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
                role === 'PHYSIOTHERAPIST' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Physiotherapist</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('CAREGIVER')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
                role === 'CAREGIVER' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Caregiver</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
                role === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="px-6 pb-2">
            <Alert variant="destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs">{errorMsg}</span>
              </div>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 px-6">
          <Input
            label="Full Legal Name"
            placeholder={
              role === 'PATIENT' ? 'e.g. Sarah Connor' : 
              role === 'PHYSIOTHERAPIST' ? 'e.g. Dr. Michael Chen, DPT' :
              role === 'CAREGIVER' ? 'e.g. John Connor' : 'e.g. Admin User'
            }
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Secure Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="en">English (US)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Consent Checkbox */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                required
              />
              <span className="text-slate-300 leading-snug">
                I understand REHAB-AI is an <strong>assistive monitoring system</strong> enforcing PostgreSQL RLS data isolation and clinical safety protocols.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting || authLoading}
            disabled={!hasConsented}
          >
            <span>Create {role} Account & Continue</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <CardFooter className="flex flex-col space-y-3 mt-4">
          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
