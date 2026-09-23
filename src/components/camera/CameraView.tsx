'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, SwitchCamera, VideoOff, ShieldCheck } from 'lucide-react';
import { CameraReadinessState } from '@/types/pose';
import { CameraStatus } from './CameraStatus';
import { CameraPermission } from './CameraPermission';
import { Button } from '@/components/ui/button';

interface CameraViewProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
  readinessState: CameraReadinessState;
  children?: React.ReactNode;
  className?: string;
  isMirrored?: boolean;
}

export function CameraView({
  onVideoReady,
  readinessState,
  children,
  className = '',
  isMirrored = true,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  const stopActiveStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const enumerateCameras = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setAvailableDevices(videoDevices);
    } catch {
      // Fallback silently
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHasPermission(false);
      setPermissionError('Camera access is not supported by your browser or environment.');
      return;
    }

    setIsInitializing(true);
    setPermissionError(null);
    stopActiveStream();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (onVideoReady) {
          onVideoReady(videoRef.current);
        }
      }

      setHasPermission(true);
      await enumerateCameras();
    } catch (err: any) {
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera permission was denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera device was detected on your system.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionError('Camera is currently in use by another application or tab.');
      } else {
        setPermissionError(err.message || 'Unable to start camera.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, onVideoReady, stopActiveStream, enumerateCameras]);

  useEffect(() => {
    startCamera();
    return () => {
      stopActiveStream();
    };
  }, [startCamera, stopActiveStream]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (hasPermission === false && permissionError) {
    return (
      <div className="w-full min-h-[420px] flex items-center justify-center p-4">
        <CameraPermission
          onRetry={startCamera}
          permissionError={permissionError}
          isRetrying={isInitializing}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-border/80 shadow-2xl flex items-center justify-center ${className}`}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover ${
          isMirrored && facingMode === 'user' ? 'scale-x-[-1]' : ''
        }`}
      />

      {/* Real-time pose canvas and overlays injected here */}
      <div className="absolute inset-0 pointer-events-none">
        {children}
      </div>

      {/* Top HUD Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-20">
        <CameraStatus readiness={readinessState} />

        <div className="flex items-center gap-2">
          {availableDevices.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFacingMode}
              className="h-8 px-2.5 bg-background/60 backdrop-blur-md border-border/60 hover:bg-background/80 text-xs gap-1.5"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>Flip</span>
            </Button>
          )}

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur-md border border-border/60 text-[11px] text-muted-foreground font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Local Processing Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
