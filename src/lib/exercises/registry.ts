// REHAB-AI: Standard Biomechanical Exercise Registry
import { ExerciseDefinition } from '@/types';

export const EXERCISE_REGISTRY: ExerciseDefinition[] = [
  {
    id: 'knee-extension',
    name: 'Seated Terminal Knee Extension (TKE)',
    slug: 'knee-extension',
    category: 'lower_extremity',
    targetJoint: 'Knee Flexion / Extension',
    description: 'Rebuilds quadriceps control and restores full extension range of motion post-injury or surgery.',
    clinicalPurpose: 'Vastus Medialis Oblique (VMO) motor unit recruitment with end-range knee extension.',
    defaultTargets: {
      startAngle: 95,
      targetAngleMin: 172,
      targetAngleMax: 180,
      holdDurationSeconds: 2,
      targetReps: 10,
      targetSets: 3,
      cadenceSecondsPerRep: 4,
    },
    instructions: [
      'Sit comfortably on a firm chair with back upright and feet flat.',
      'Smoothly extend your affected leg until fully straight.',
      'Squeeze the quadriceps thigh muscle at the peak for the hold duration.',
      'Lower slowly with control back to starting angle.',
    ],
    contraindications: ['Acute uncontrolled patellar dislocation', 'Unhealed tibial fracture'],
  },
  {
    id: 'bodyweight-squat',
    name: 'Controlled Rehabilitation Squat',
    slug: 'bodyweight-squat',
    category: 'lower_extremity',
    targetJoint: 'Bilateral Hip & Knee Flexion',
    description: 'Functional closed-kinetic chain exercise restoring bilateral knee, hip, and core load tolerance.',
    clinicalPurpose: 'Symmetrical knee flexion without dynamic knee valgus collapse or excessive forward trunk pitch.',
    defaultTargets: {
      startAngle: 172,
      targetAngleMin: 90,
      targetAngleMax: 105,
      holdDurationSeconds: 1.5,
      targetReps: 8,
      targetSets: 3,
      cadenceSecondsPerRep: 4,
    },
    instructions: [
      'Stand with feet shoulder-width apart, toes turned slightly out.',
      'Keep your chest elevated and descend as if sitting onto a chair.',
      'Ensure knees track in line with toes, avoiding inward collapse.',
      'Push evenly through both heels to return to standing.',
    ],
    contraindications: ['Severe acute meniscal tear with mechanical lock'],
  },
  {
    id: 'shoulder-scaption',
    name: 'Shoulder Scaption / Elevation',
    slug: 'shoulder-scaption',
    category: 'upper_extremity',
    targetJoint: 'Glenohumeral Joint Elevation',
    description: 'Elevation in the plane of the scapula to restore subacromial space clearance and strengthen supraspinatus.',
    clinicalPurpose: 'Restores 90-110 degree elevation without upper trapezius shoulder hiking or lateral trunk lean.',
    defaultTargets: {
      startAngle: 25,
      targetAngleMin: 90,
      targetAngleMax: 110,
      holdDurationSeconds: 2,
      targetReps: 10,
      targetSets: 3,
      cadenceSecondsPerRep: 4,
    },
    instructions: [
      'Stand or sit tall with arms resting at your sides.',
      'Thumb pointed upwards at a 30-degree forward angle (scapular plane).',
      'Smoothly raise your arm to shoulder level without shrugging your neck.',
      'Hold momentarily, then lower with steady control.',
    ],
    contraindications: ['Acute full-thickness rotator cuff rupture requiring immobilization'],
  },
];

export function getExerciseBySlug(slug: string): ExerciseDefinition {
  return EXERCISE_REGISTRY.find((e) => e.slug === slug) || EXERCISE_REGISTRY[0];
}
