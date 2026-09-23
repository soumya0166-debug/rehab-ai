'use client';

import React, { useEffect, useRef } from 'react';
import { PoseFrame } from '@/types/pose';
import { SKELETON_CONNECTIONS } from '@/lib/pose/landmark-utils';

interface PoseCanvasProps {
  frame: PoseFrame | null;
  activeJointName?: string;
  currentAngle?: number;
  targetRange?: { min: number; max: number };
  isMirrored?: boolean;
  className?: string;
}

export function PoseCanvas({
  frame,
  activeJointName,
  currentAngle,
  targetRange,
  isMirrored = true,
  className = '',
}: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas internal resolution to client display
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!frame || !frame.landmarks || Object.keys(frame.landmarks).length === 0) {
      return;
    }

    const { landmarks } = frame;
    const width = canvas.width;
    const height = canvas.height;

    // Helper to map normalized [0, 1] to canvas coordinates
    const toCanvasX = (normX: number) => {
      return isMirrored ? (1 - normX) * width : normX * width;
    };
    const toCanvasY = (normY: number) => normY * height;

    // 1. Draw Skeleton Lines
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.65)'; // Soft vibrant blue

    for (const [startName, endName] of SKELETON_CONNECTIONS) {
      const p1 = landmarks[startName];
      const p2 = landmarks[endName];

      if (p1 && p2 && p1.confidence > 0.4 && p2.confidence > 0.4) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(p1.x), toCanvasY(p1.y));
        ctx.lineTo(toCanvasX(p2.x), toCanvasY(p2.y));
        ctx.stroke();
      }
    }

    // 2. Draw Landmark Points
    for (const lm of Object.values(landmarks)) {
      if (lm.confidence < 0.4) continue;

      const cx = toCanvasX(lm.x);
      const cy = toCanvasY(lm.y);

      const isTarget = activeJointName && lm.name.includes(activeJointName);

      ctx.beginPath();
      ctx.arc(cx, cy, isTarget ? 7 : 4, 0, 2 * Math.PI);

      if (isTarget) {
        // Color based on target range fulfillment
        const inTarget =
          targetRange &&
          currentAngle !== undefined &&
          currentAngle >= targetRange.min &&
          currentAngle <= targetRange.max;

        ctx.fillStyle = inTarget ? '#10b981' : '#3b82f6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        // Draw Angle Badge beside target joint
        if (currentAngle !== undefined) {
          const badgeText = `${Math.round(currentAngle)}°`;
          ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
          const textWidth = ctx.measureText(badgeText).width;

          const badgeX = cx + (isMirrored ? -textWidth - 24 : 16);
          const badgeY = cy - 12;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.beginPath();
          ctx.roundRect(badgeX - 6, badgeY - 14, textWidth + 12, 22, 6);
          ctx.fill();
          ctx.strokeStyle = inTarget ? '#10b981' : 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = inTarget ? '#34d399' : '#ffffff';
          ctx.fillText(badgeText, badgeX, badgeY + 2);
        }
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = 'rgba(30, 58, 138, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [frame, activeJointName, currentAngle, targetRange, isMirrored]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
