// REHAB-AI: Standard Clinical Exercise Library with Biomechanical Rule Sets
import { ExerciseDefinition, POSE_LANDMARKS, Landmark3D, BodySide } from '@/types/rehab';
import { 
  calculateJointAngle, 
  calculateTrunkLean, 
  calculateLateralLean,
  calculateKneeValgusDeviation 
} from './geometry';

export const CLINICAL_EXERCISE_LIBRARY: ExerciseDefinition[] = [
  {
    id: 'knee-extension',
    name: 'Seated Knee Extension (TKE)',
    category: 'lower_limb',
    targetJoint: 'left_knee',
    targetSide: 'left',
    description: 'Terminal knee extension to rebuild quadriceps control and restore full extension range of motion post-surgery or injury.',
    clinicalObjective: 'Vastus Medialis Oblique (VMO) activation and end-range knee extension without lumbar or hip compensation.',
    setupInstructions: [
      'Sit comfortably on a firm chair or bench with your feet flat on the floor.',
      'Keep your back straight and hands resting lightly on the sides of the seat.',
      'Ensure the camera captures your side profile clearly from hip to foot.'
    ],
    recommendedReps: 10,
    recommendedSets: 3,
    startAngle: 95,          // Sitting with 90-100 deg knee bend
    targetAngleMin: 168,     // Near-full extension
    targetAngleMax: 180,     // Full extension
    holdDurationSeconds: 2,  // Isometric hold at peak
    voiceCues: {
      start: 'Ready. Slowly extend your knee forward.',
      approaching: 'Almost there, squeeze your quadriceps.',
      holding: 'Hold full extension steady.',
      returnPrompt: 'Good hold! Lower slowly with control.',
      success: 'Rep completed! Smooth controlled descent.'
    },
    compensations: [
      {
        id: 'trunk-backward-lean',
        name: 'Backward Trunk Lean',
        description: 'Leaning the torso backward to cheat hip flexors instead of engaging the quadriceps.',
        feedbackWarning: 'Keep your chest upright! Do not lean backwards.',
        voiceCue: 'Sit tall, do not lean back.',
        threshold: 20, // > 20 degrees trunk lean backwards
        severity: 'moderate',
        evaluate: (landmarks: Landmark3D[]) => {
          const lShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
          const rShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
          const lHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
          const rHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

          const leanAngle = calculateTrunkLean(lShoulder, rShoulder, lHip, rHip);
          return {
            isTriggered: leanAngle > 18,
            value: leanAngle
          };
        }
      },
      {
        id: 'incomplete-extension',
        name: 'Incomplete Extension',
        description: 'Stopping short of full terminal extension.',
        feedbackWarning: 'Push for that final stretch to lock out the knee safely.',
        voiceCue: 'Straighten your leg a bit more.',
        threshold: 165,
        severity: 'minor',
        evaluate: (landmarks: Landmark3D[], side: BodySide) => {
          const hip = landmarks[side === 'right' ? POSE_LANDMARKS.RIGHT_HIP : POSE_LANDMARKS.LEFT_HIP];
          const knee = landmarks[side === 'right' ? POSE_LANDMARKS.RIGHT_KNEE : POSE_LANDMARKS.LEFT_KNEE];
          const ankle = landmarks[side === 'right' ? POSE_LANDMARKS.RIGHT_ANKLE : POSE_LANDMARKS.LEFT_ANKLE];
          const angle = calculateJointAngle(hip, knee, ankle);
          return {
            isTriggered: angle > 140 && angle < 165,
            value: angle
          };
        }
      }
    ]
  },
  {
    id: 'bodyweight-squat',
    name: 'Controlled Rehabilitation Squat',
    category: 'lower_limb',
    targetJoint: 'left_knee',
    targetSide: 'both',
    description: 'Functional closed-kinetic chain exercise to restore bilateral knee, hip, and ankle mobility and load tolerance.',
    clinicalObjective: 'Symmetrical knee flexion with stable pelvic posture and prevention of dynamic knee valgus collapse.',
    setupInstructions: [
      'Stand facing the camera or at a slight 45-degree angle.',
      'Position feet shoulder-width apart with toes pointing slightly outward.',
      'Keep chest elevated and weight distributed evenly across both feet.'
    ],
    recommendedReps: 8,
    recommendedSets: 3,
    startAngle: 172,         // Standing upright
    targetAngleMin: 85,      // Parallel / near-parallel squat depth
    targetAngleMax: 105,     // Safe functional depth
    holdDurationSeconds: 1.5,
    voiceCues: {
      start: 'Begin descending smoothly into a squat.',
      approaching: 'Approaching target depth.',
      holding: 'Hold depth and keep knees out.',
      returnPrompt: 'Drive through your heels to stand tall.',
      success: 'Excellent squat depth and control!'
    },
    compensations: [
      {
        id: 'knee-valgus',
        name: 'Dynamic Knee Valgus',
        description: 'Knees collapsing inward past the medial ankle line, placing shearing stress on ACL/MCL.',
        feedbackWarning: 'Push your knees outward! Do not let knees cave inwards.',
        voiceCue: 'Push your knees out.',
        threshold: 0.05,
        severity: 'severe',
        evaluate: (landmarks: Landmark3D[]) => {
          const lHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
          const lKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
          const lAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
          const rHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
          const rKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
          const rAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

          const leftValgus = calculateKneeValgusDeviation(lHip, lKnee, lAnkle, true);
          const rightValgus = calculateKneeValgusDeviation(rHip, rKnee, rAnkle, false);

          const maxDeviation = Math.max(leftValgus, rightValgus);
          return {
            isTriggered: maxDeviation > 0.04,
            value: Math.round(maxDeviation * 100)
          };
        }
      },
      {
        id: 'excessive-forward-lean',
        name: 'Excessive Forward Trunk Lean',
        description: 'Torso pitching forward due to limited ankle dorsiflexion or weak core/hip stabilizers.',
        feedbackWarning: 'Keep your chest proud and upright.',
        voiceCue: 'Chest up, do not pitch forward.',
        threshold: 38,
        severity: 'moderate',
        evaluate: (landmarks: Landmark3D[]) => {
          const lShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
          const rShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
          const lHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
          const rHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

          const lean = calculateTrunkLean(lShoulder, rShoulder, lHip, rHip);
          return {
            isTriggered: lean > 35,
            value: lean
          };
        }
      }
    ]
  },
  {
    id: 'shoulder-scaption',
    name: 'Shoulder Scaption / Abduction',
    category: 'upper_limb',
    targetJoint: 'right_shoulder',
    targetSide: 'right',
    description: 'Elevation in the plane of the scapula to restore subacromial clearance and strengthen the supraspinatus without pinching.',
    clinicalObjective: 'Restore 90-120 degree shoulder elevation without upper trapezius hiking or lateral trunk compensation.',
    setupInstructions: [
      'Stand or sit facing the camera with arms relaxed at your sides.',
      'Thumbs pointing slightly upward toward the ceiling (scapular plane ~30 deg anterior to frontal plane).',
      'Keep shoulders depressed and relaxed away from your ears.'
    ],
    recommendedReps: 10,
    recommendedSets: 3,
    startAngle: 25,          // Arm down by side
    targetAngleMin: 90,      // Horizontal / shoulder height
    targetAngleMax: 115,     // Functional range
    holdDurationSeconds: 2,
    voiceCues: {
      start: 'Lift your arm smoothly out to shoulder height.',
      approaching: 'Nearing horizontal plane.',
      holding: 'Hold at shoulder height without shrugging.',
      returnPrompt: 'Lower arm slowly with steady tempo.',
      success: 'Clean shoulder rep! Great scapular control.'
    },
    compensations: [
      {
        id: 'shoulder-hiking',
        name: 'Upper Trapezius Shrug (Shoulder Hike)',
        description: 'Hiking the shoulder blade upward to substitute for weak rotator cuff or deltoid.',
        feedbackWarning: 'Relax your neck! Lower your shoulder blade away from your ear.',
        voiceCue: 'Keep shoulder down, do not shrug.',
        threshold: 0.15,
        severity: 'moderate',
        evaluate: (landmarks: Landmark3D[], side: BodySide) => {
          const shoulderIdx = side === 'left' ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER;
          const earIdx = side === 'left' ? POSE_LANDMARKS.LEFT_EAR : POSE_LANDMARKS.RIGHT_EAR;
          
          const shoulder = landmarks[shoulderIdx];
          const ear = landmarks[earIdx];

          if (!shoulder || !ear) return { isTriggered: false, value: 0 };
          const dist = Math.hypot(shoulder.x - ear.x, shoulder.y - ear.y);
          // A dangerously close ear-to-shoulder vertical distance (< 0.12 of normalized view) indicates hiking
          return {
            isTriggered: dist < 0.11,
            value: Math.round(dist * 100)
          };
        }
      },
      {
        id: 'lateral-trunk-lean',
        name: 'Lateral Trunk Tilt',
        description: 'Leaning body to the opposite side to make the arm appear higher than it actually is.',
        feedbackWarning: 'Keep your spine vertical! Do not lean your body sideways.',
        voiceCue: 'Stay centered, do not lean sideways.',
        threshold: 15,
        severity: 'minor',
        evaluate: (landmarks: Landmark3D[]) => {
          const lShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
          const rShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
          const lateral = calculateLateralLean(lShoulder, rShoulder);
          return {
            isTriggered: lateral > 14,
            value: lateral
          };
        }
      }
    ]
  },
  {
    id: 'straight-leg-raise',
    name: 'Straight Leg Raise (Supine/Seated)',
    category: 'lower_limb',
    targetJoint: 'left_hip',
    targetSide: 'left',
    description: 'Dynamic hip flexion with an active quadriceps lock to retrain anterior chain coordination without knee flexion.',
    clinicalObjective: 'Achieve 45 degrees of hip flexion while maintaining full 180 degree knee lockout.',
    setupInstructions: [
      'Lie supine on a mat or recline comfortably with legs extended.',
      'Tighten your quadriceps so your knee is completely straight and locked.',
      'Slowly elevate the leg toward 45 degrees without bending your knee.'
    ],
    recommendedReps: 8,
    recommendedSets: 3,
    startAngle: 10,          // Leg flat
    targetAngleMin: 40,      // 45 deg elevation
    targetAngleMax: 60,
    holdDurationSeconds: 3,
    voiceCues: {
      start: 'Lock your knee straight and lift your leg.',
      approaching: 'Reaching target height.',
      holding: 'Hold leg high with knee locked tight.',
      returnPrompt: 'Slowly lower back down to the mat.',
      success: 'Solid leg raise with full quad lock.'
    },
    compensations: [
      {
        id: 'knee-lag',
        name: 'Quadriceps Extensor Lag (Knee Bend)',
        description: 'Knee flexing during the raise due to quadriceps weakness.',
        feedbackWarning: 'Lock your knee straight! Do not let the knee bend as you lift.',
        voiceCue: 'Lock that knee straight.',
        threshold: 165,
        severity: 'severe',
        evaluate: (landmarks: Landmark3D[], side: BodySide) => {
          const hip = landmarks[side === 'right' ? POSE_LANDMARKS.RIGHT_HIP : POSE_LANDMARKS.LEFT_HIP];
          const knee = landmarks[side === 'right' ? POSE_LANDMARKS.RIGHT_KNEE : POSE_LANDMARKS.LEFT_KNEE];
          const ankle = landmarks[side === 'right' ? POSE_LANDMARKS.RIGHT_ANKLE : POSE_LANDMARKS.LEFT_ANKLE];
          const kneeAngle = calculateJointAngle(hip, knee, ankle);
          return {
            isTriggered: kneeAngle < 165,
            value: kneeAngle
          };
        }
      }
    ]
  }
];

export function getExerciseById(id: string): ExerciseDefinition {
  const ex = CLINICAL_EXERCISE_LIBRARY.find(e => e.id === id);
  return ex || CLINICAL_EXERCISE_LIBRARY[0];
}
