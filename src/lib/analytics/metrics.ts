// REHAB-AI: Telemetry & Clinical Analytics Calculators

export function calculateAdherenceRate(completedDays: number, prescribedDays: number): number {
  if (prescribedDays <= 0) return 100;
  return Math.min(100, Math.round((completedDays / prescribedDays) * 100));
}

export function calculateCleanRepRatio(cleanReps: number, totalReps: number): number {
  if (totalReps <= 0) return 100;
  return Math.round((cleanReps / totalReps) * 100);
}

export function evaluateRomProgression(initialRom: number, currentRom: number, targetRom: number): {
  netGainDegrees: number;
  percentageToTarget: number;
} {
  const netGain = Math.max(0, currentRom - initialRom);
  const totalNeeded = Math.max(1, targetRom - initialRom);
  const percent = Math.min(100, Math.round((netGain / totalNeeded) * 100));

  return {
    netGainDegrees: netGain,
    percentageToTarget: percent,
  };
}
