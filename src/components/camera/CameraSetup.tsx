'use client';

import React from 'react';
import { CheckCircle2, UserCheck, SunMedium, MoveHorizontal, Sparkles } from 'lucide-react';
import { CameraPositioningGuidance } from '@/types/exercises';
import { Button } from '@/components/ui/button';

interface CameraSetupProps {
  guidance: CameraPositioningGuidance;
  isReady: boolean;
  onContinue: () => void;
}

export function CameraSetup({ guidance, isReady, onContinue }: CameraSetupProps) {
  return (
    <div className="bg-card/70 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">
          Camera Positioning & Setup Checklist
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 flex flex-col items-start">
          <MoveHorizontal className="w-4 h-4 text-primary mb-2" />
          <span className="text-xs font-semibold text-foreground">Target Distance</span>
          <span className="text-xs text-muted-foreground mt-0.5">
            About {guidance.distanceMeters} meters away
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 flex flex-col items-start">
          <UserCheck className="w-4 h-4 text-primary mb-2" />
          <span className="text-xs font-semibold text-foreground">Camera Height</span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {guidance.cameraHeight}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-background/60 border border-border/60 flex flex-col items-start">
          <SunMedium className="w-4 h-4 text-primary mb-2" />
          <span className="text-xs font-semibold text-foreground">Lighting</span>
          <span className="text-xs text-muted-foreground mt-0.5">
            Front-lit room, avoid backlights
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {guidance.instructions.map((step, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!isReady}
          className="gap-2 px-6"
        >
          {isReady ? 'Position Confirmed — Start' : 'Adjusting Position...'}
        </Button>
      </div>
    </div>
  );
}
