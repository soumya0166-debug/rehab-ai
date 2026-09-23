'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error caught by error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950/60 text-rose-400 border border-rose-800/80">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-bold text-white">Temporary System Issue</h4>
        <p className="text-xs text-slate-400">
          An unexpected error occurred while rendering this view. Your saved clinical session telemetry remains secure.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="secondary" size="sm" onClick={() => reset()}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          <span>Try Again</span>
        </Button>
        <Link href="/">
          <Button variant="outline" size="sm">
            <Home className="h-3.5 w-3.5 mr-1.5" />
            <span>Return to Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
