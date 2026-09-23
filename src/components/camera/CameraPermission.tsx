'use client';

import React from 'react';
import { Camera, ShieldAlert, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraPermissionProps {
  onRetry: () => void;
  permissionError?: string | null;
  isRetrying?: boolean;
}

export function CameraPermission({
  onRetry,
  permissionError,
  isRetrying = false,
}: CameraPermissionProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card/60 backdrop-blur-md rounded-2xl border border-border shadow-lg text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 ring-8 ring-primary/5">
        <Camera className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
        Camera Access Required for Movement Guidance
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        REHAB-AI tracks your joint angles directly inside your web browser.
        <strong className="text-foreground font-medium block mt-1">
          Your video is never uploaded or recorded to any server.
        </strong>
      </p>

      {permissionError && (
        <div className="w-full mb-6 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 text-left">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-0.5">Camera access was blocked</div>
            <div>{permissionError}</div>
          </div>
        </div>
      )}

      <div className="w-full bg-muted/40 p-4 rounded-xl border border-border/50 text-left mb-6 text-xs text-muted-foreground space-y-2">
        <div className="font-medium text-foreground flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          How to grant camera access:
        </div>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Click the lock or camera icon in your browser address bar.</li>
          <li>Set Camera permission to <strong>Allow</strong>.</li>
          <li>Click the <strong>Try Again</strong> button below to reconnect.</li>
        </ol>
      </div>

      <Button
        onClick={onRetry}
        disabled={isRetrying}
        className="w-full sm:w-auto px-8 gap-2"
        size="lg"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Connecting to Camera...' : 'Allow Camera & Continue'}
      </Button>
    </div>
  );
}
