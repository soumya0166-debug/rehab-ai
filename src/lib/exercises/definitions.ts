// REHAB-AI: Prototype Exercise Configurations
// Seeded definitions for Elbow Flexion, Shoulder Raise, and Sit-to-Stand
// IMPORTANT: These are prototype exercise configurations and must be configured by a qualified physiotherapist.

import { ExerciseDefinition } from '@/types/exercises';

export const CLINICAL_PROTOTYPE_DISCLAIMER =
  'PROTOTYPE CONFIGURATION: Biomechanical angle thresholds, repetition counts, and cadence are simulated clinical templates. Specific rehabilitation protocols, target limits, and precautions must be established and customized by a qualified physiotherapist before active patient deployment.';

export const SEEDED_EXERCISE_DEFINITIONS: ExerciseDefinition[] = [
  {
    id: 'elbow-flexion',
    name: 'Elbow Flexion',
    description:
      'Isolated concentric flexion and controlled eccentric extension of the elbow joint to recover functional arm mobility and biceps control.',
    bodyPart: 'upper_extremity',
    difficulty: 'beginner',
    cameraView: 'sagittal_left',
    isPrototype: true,
    prototypeDisclaimer: CLINICAL_PROTOTYPE_DISCLAIMER,
    safetyNotes:
      'Discontinue if acute antecubital joint pain occurs. Avoid compensatory shoulder hiking or leaning the trunk back to hoist the forearm.',
    requiredLandmarks: [
      'LEFT_SHOULDER',
      'LEFT_ELBOW',
      'LEFT_WRIST',
      'LEFT_HIP',
    ],
    startingCondition: {
      postureDescription: 'Seated or standing upright with arm fully extended at side.',
      startAngleDegrees: 150.0,
      maxAngleDeviation: 15.0,
      settleTimeMs: 1000,
    },
    movementPhases: [
      'START_EXTENSION',
      'CONCENTRIC_FLEXION',
      'PEAK_HOLD',
      'ECCENTRIC_DESCENT',
      'REP_COMPLETED',
    ],
    repetitionLogic: {
      targetJointName: 'left_elbow',
      startAngle: 150.0,
      peakFlexionMinAngle: 35.0,
      peakFlexionMaxAngle: 55.0,
      returnExtensionThreshold: 140.0,
      minimumHoldSeconds: 1.5,
      cadenceSecondsPerRep: 4.0,
    },
    targetMeasurement: {
      metricName: 'elbow_flexion_angle',
      unit: 'degrees',
      defaultMinAngle: 40.0,
      defaultMaxAngle: 150.0,
      description: 'Angle subtended by shoulder, elbow, and wrist keypoints.',
    },
    feedbackRules: [
      {
        id: 'trunk_sway',
        conditionDescription: 'Trunk pitch exceeds 12 degrees rearward during curl.',
        verbalCue: 'Keep your torso still and avoid leaning backwards.',
        severity: 'moderate',
      },
      {
        id: 'shoulder_hiking',
        conditionDescription: 'Vertical shoulder displacement exceeds baseline by 25mm.',
        verbalCue: 'Anchor your elbow at your side and relax your neck.',
        severity: 'moderate',
      },
      {
        id: 'incomplete_extension',
        conditionDescription: 'Repetition restarted before reaching 140 degrees extension.',
        verbalCue: 'Lower your arm all the way down before beginning the next repetition.',
        severity: 'minor',
      },
    ],
    cameraPositioningGuidance: {
      distanceMeters: 2.0,
      recommendedAngle: '90-degree sagittal side profile',
      cameraHeight: 'Mid-chest level',
      instructions: [
        'Position camera perpendicular to the exercising arm side.',
        'Keep shoulder, elbow, and wrist visible throughout full arc.',
        'Avoid loose clothing that obscures the elbow joint joint vertex.',
      ],
    },
  },

  {
    id: 'shoulder-raise',
    name: 'Shoulder Raise',
    description:
      'Active elevation in the scapular plane (scaption/abduction) targeting supraspinatus recruitment and subacromial clearance.',
    bodyPart: 'upper_extremity',
    difficulty: 'intermediate',
    cameraView: 'frontal',
    isPrototype: true,
    prototypeDisclaimer: CLINICAL_PROTOTYPE_DISCLAIMER,
    safetyNotes:
      'Do not force elevation through a painful subacromial arc. Stop immediately if pinching pain or numbness radiates into forearm.',
    requiredLandmarks: [
      'LEFT_SHOULDER',
      'RIGHT_SHOULDER',
      'LEFT_ELBOW',
      'RIGHT_ELBOW',
      'LEFT_WRIST',
      'RIGHT_WRIST',
      'LEFT_HIP',
      'RIGHT_HIP',
    ],
    startingCondition: {
      postureDescription: 'Standing tall, feet hip-width apart, arms resting comfortably by sides.',
      startAngleDegrees: 20.0,
      maxAngleDeviation: 10.0,
      settleTimeMs: 1200,
    },
    movementPhases: [
      'RESTING_NEUTRAL',
      'SCAPTION_ASCENT',
      'PEAK_ELEVATION_HOLD',
      'CONTROLLED_DESCENT',
      'REP_COMPLETED',
    ],
    repetitionLogic: {
      targetJointName: 'glenohumeral_scaption_angle',
      startAngle: 20.0,
      peakFlexionMinAngle: 85.0,
      peakFlexionMaxAngle: 110.0,
      returnExtensionThreshold: 30.0,
      minimumHoldSeconds: 2.0,
      cadenceSecondsPerRep: 5.0,
    },
    targetMeasurement: {
      metricName: 'shoulder_elevation_angle',
      unit: 'degrees',
      defaultMinAngle: 85.0,
      defaultMaxAngle: 110.0,
      description: 'Angle formed between mid-torso axis and humerus upper arm segment.',
    },
    feedbackRules: [
      {
        id: 'trapezius_hike',
        conditionDescription: 'Shoulder elevation angle rises before humeral abduction starts.',
        verbalCue: 'Relax your trapezius. Do not shrug your shoulder toward your ear.',
        severity: 'critical',
      },
      {
        id: 'lateral_trunk_lean',
        conditionDescription: 'Lateral spine tilt exceeds 10 degrees during unilateral lift.',
        verbalCue: 'Stand tall with core engaged. Do not lean your body away from the arm.',
        severity: 'moderate',
      },
      {
        id: 'excessive_hold',
        conditionDescription: 'Hold exceeds 4.5 seconds causing muscle tremor.',
        verbalCue: 'Lower your arm smoothly with control.',
        severity: 'minor',
      },
    ],
    cameraPositioningGuidance: {
      distanceMeters: 2.5,
      recommendedAngle: 'Direct frontal view facing camera',
      cameraHeight: 'Mid-torso / sternum height',
      instructions: [
        'Stand 2 to 2.5 meters away so both arms can spread fully without leaving frame.',
        'Ensure background has sufficient contrast against your clothing.',
        'Keep both hips and shoulders in view for posture balance assessment.',
      ],
    },
  },

  {
    id: 'sit-to-stand',
    name: 'Sit-to-Stand',
    description:
      'Fundamental closed-kinetic chain functional mobility transfer building quadriceps power, hip extension, and sit-to-stand safety.',
    bodyPart: 'lower_extremity',
    difficulty: 'intermediate',
    cameraView: 'oblique_45',
    isPrototype: true,
    prototypeDisclaimer: CLINICAL_PROTOTYPE_DISCLAIMER,
    safetyNotes:
      'Perform only using a sturdy, non-wheeled chair placed against a secure wall. If unstable, ensure caregiver supervision or support rails.',
    requiredLandmarks: [
      'LEFT_SHOULDER',
      'RIGHT_SHOULDER',
      'LEFT_HIP',
      'RIGHT_HIP',
      'LEFT_KNEE',
      'RIGHT_KNEE',
      'LEFT_ANKLE',
      'RIGHT_ANKLE',
      'LEFT_HEEL',
      'RIGHT_HEEL',
    ],
    startingCondition: {
      postureDescription: 'Seated evenly on a standard chair with knees bent at approximately 90 degrees and feet planted flat.',
      startAngleDegrees: 90.0,
      maxAngleDeviation: 15.0,
      settleTimeMs: 1500,
    },
    movementPhases: [
      'SEATED_CALIBRATION',
      'FORWARD_MOMENTUM_TRANSFER',
      'EXTENSION_DRIVE',
      'UPRIGHT_LOCKOUT_HOLD',
      'CONTROLLED_ECCENTRIC_DESCENT',
      'REP_COMPLETED',
    ],
    repetitionLogic: {
      targetJointName: 'knee_and_hip_extension_angle',
      startAngle: 90.0,
      peakFlexionMinAngle: 170.0,
      peakFlexionMaxAngle: 180.0,
      returnExtensionThreshold: 95.0,
      minimumHoldSeconds: 1.0,
      cadenceSecondsPerRep: 4.5,
    },
    targetMeasurement: {
      metricName: 'knee_extension_angle',
      unit: 'degrees',
      defaultMinAngle: 90.0,
      defaultMaxAngle: 175.0,
      description: 'Combined knee angle (hip-knee-ankle) measuring transition from seated 90° to erect 175°.',
    },
    feedbackRules: [
      {
        id: 'knee_valgus_collapse',
        conditionDescription: 'Inward knee tracking deviation exceeds safe medial envelope (>15mm).',
        verbalCue: 'Drive knees outward over toes. Do not let knees cave inward.',
        severity: 'critical',
      },
      {
        id: 'excessive_trunk_flexion',
        conditionDescription: 'Forward trunk pitch exceeds 45 degrees before knee extension initiates.',
        verbalCue: 'Elevate your chest. Power upwards through your legs rather than pitching forward.',
        severity: 'moderate',
      },
      {
        id: 'uncontrolled_plop',
        conditionDescription: 'Descent acceleration exceeds freefall threshold (>0.4g).',
        verbalCue: 'Lower yourself softly with control. Do not drop heavily into the chair.',
        severity: 'critical',
      },
    ],
    cameraPositioningGuidance: {
      distanceMeters: 3.0,
      recommendedAngle: '45-degree oblique front-side angle',
      cameraHeight: 'Mid-thigh / hip height',
      instructions: [
        'Place camera 3 meters away at a 45-degree angle to capture both front width and side depth.',
        'Ensure the chair base, knees, hips, and entire torso are visible in both seated and standing positions.',
        'Keep lighting bright enough to identify knee and ankle keypoints.',
      ],
    },
  },
];

export function getSeededExercise(id: string): ExerciseDefinition | null {
  return SEEDED_EXERCISE_DEFINITIONS.find((e) => e.id === id) || null;
}
