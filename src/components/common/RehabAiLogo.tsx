import React from 'react';

interface RehabAiLogoProps {
  className?: string;
  size?: number;
}

export function RehabAiLogo({ className = 'h-8 w-8', size }: RehabAiLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="REHAB-AI Kinetic Cross Logo"
    >
      <rect width="100" height="100" rx="24" fill="#0F172A" />
      <path
        d="M28 50C28 37.8497 37.8497 28 50 28C62.1503 28 72 37.8497 72 50"
        stroke="#14B8A6"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="14" fill="#0D9488" />
      <path
        d="M50 36V64M36 50H64"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="72" cy="50" r="4" fill="#38BDF8" />
    </svg>
  );
}
