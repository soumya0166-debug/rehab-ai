import React from 'react';
import { Activity } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 animate-pulse">
        <Activity className="h-6 w-6 animate-spin" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">Loading Clinical Environment...</h4>
        <p className="text-xs text-slate-400">Verifying session credentials and deterministic parameters.</p>
      </div>
    </div>
  );
}
