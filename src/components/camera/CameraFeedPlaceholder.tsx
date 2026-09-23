'use client';

import React from 'react';
import { Camera, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CameraFeedPlaceholderProps {
  onEnableCamera?: () => void;
  status?: 'idle' | 'requesting' | 'ready' | 'denied';
}

export function CameraFeedPlaceholder({
  onEnableCamera,
  status = 'idle',
}: CameraFeedPlaceholderProps) {
  return (
    <div className="relative aspect-video w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden">
      {/* Background soft grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 shadow-inner">
          <Camera className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Browser Computer Vision Ready</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All pose estimation runs locally inside your browser. No video feed or camera images are ever transmitted to any external server.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="h-4 w-4" />
          <span>Client-Side Privacy Guaranteed</span>
        </div>

        {status === 'denied' ? (
          <div className="rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Camera permission was denied. Please allow camera access in your browser address bar.</span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onEnableCamera}
            isLoading={status === 'requesting'}
          >
            {status === 'ready' ? 'Camera Active' : 'Enable Camera Tracking'}
          </Button>
        )}
      </div>
    </div>
  );
}
