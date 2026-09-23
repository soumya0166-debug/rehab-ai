'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowRight, LogOut, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { getRoleDashboardPath, normalizeRole } from '@/lib/auth/auth-service';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const { user, role, logout } = useAuth();

  const currentRole = role || normalizeRole(searchParams.get('currentRole') || 'PATIENT');
  const requiredRole = normalizeRole(searchParams.get('requiredRole') || 'ADMIN');
  const targetPath = searchParams.get('targetPath') || 'the requested clinical portal';
  const myDashboardPath = getRoleDashboardPath(currentRole);

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <Card className="border-rose-900/60 bg-slate-950/90 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-white font-bold tracking-tight">
            Unauthorized Access
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-1">
            Access to <span className="font-mono text-cyan-400">{targetPath}</span> is restricted by Clinical Role-Based Access Control (RBAC).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Diagnostic Role Matrix */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Your Verified Role</span>
              <span className="font-semibold text-amber-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                {currentRole}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Required Role</span>
              <span className="font-semibold text-rose-400 flex items-center gap-1.5 mt-0.5">
                <Lock className="h-3 w-3" />
                {requiredRole}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-200">Database-Level Security Enforcement</p>
            <p className="leading-relaxed text-[11px]">
              REHAB-AI enforces strict PostgreSQL Row Level Security (RLS). Patient clinical telemetry and prescription management are legally isolated to assigned clinicians, authorized caregivers, and respective patients.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 pt-2">
          <Link href={myDashboardPath} className="w-full">
            <Button variant="primary" className="w-full">
              <span>Return to My Dashboard ({currentRole})</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            className="w-full text-slate-400 hover:text-rose-400"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span>Sign Out & Switch Account</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Verifying permissions...</div>}>
        <UnauthorizedContent />
      </Suspense>
    </div>
  );
}
