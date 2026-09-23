'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Stethoscope, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth/auth-context';
import { CanonicalRole } from '@/types';
import { SEED_PROFILES } from '@/lib/auth/auth-service';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const { login, isLoading: authLoading } = useAuth();

  const [role, setRole] = useState<CanonicalRole>('PATIENT');
  const [email, setEmail] = useState('sarah.connor@rehab-ai.health');
  const [password, setPassword] = useState('Password123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (newRole: CanonicalRole) => {
    setRole(newRole);
    setErrorMsg(null);
    const seed = SEED_PROFILES[newRole];
    if (seed) {
      setEmail(seed.email);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password, role);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to authenticate. Please verify your credentials.');
      }
      // If successful, login() in AuthContext handles redirection to role dashboard!
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl">Sign in to REHAB-AI</CardTitle>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800">
              Supabase Auth
            </span>
          </div>
          <CardDescription>
            Select your clinical role to access your personalized telemetry dashboard.
          </CardDescription>
        </CardHeader>

        {/* 4-Role Quick Switcher for Demo / Fast Login */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleChange('PATIENT')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
              role === 'PATIENT' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('PHYSIOTHERAPIST')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
              role === 'PHYSIOTHERAPIST' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Physiotherapist</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('CAREGIVER')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
              role === 'CAREGIVER' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Caregiver</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('ADMIN')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
              role === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>
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

        {redirectTo && (
          <div className="px-6 pb-2">
            <Alert variant="info">
              <span className="text-xs">
                Authentication required: Please sign in to access <strong className="font-mono">{redirectTo}</strong>.
              </span>
            </Alert>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 px-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full" 
            isLoading={isSubmitting || authLoading}
          >
            <span>Continue to {role} Dashboard</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <CardFooter className="flex flex-col space-y-3 mt-4">
          <div className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:underline font-semibold">
              Create one now
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading login terminal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
