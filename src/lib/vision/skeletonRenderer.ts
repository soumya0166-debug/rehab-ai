// REHAB-AI: Clinical HUD Canvas Skeleton & Biomechanical Angle Overlay
import { Landmark3D, POSE_LANDMARKS, RepState, JointAngleName } from '@/types/rehab';

export const POSE_CONNECTIONS: [number, number][] = [
  // Head
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_EYE],
  [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.LEFT_EAR],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_EYE],
  [POSE_LANDMARKS.RIGHT_EYE, POSE_LANDMARKS.RIGHT_EAR],
  // Shoulders & Chest
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  // Left Arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  // Right Arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  // Torso / Spine
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  // Left Leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_FOOT_INDEX],
  // Right Leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_FOOT_INDEX],
];

export interface RenderOptions {
  currentAngle: number;
  targetAngleMin: number;
  targetAngleMax: number;
  targetJoint: JointAngleName;
  repState: RepState;
  hasCompensationAlert: boolean;
  holdProgressRatio: number;
}

export function drawClinicalSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  width: number,
  height: number,
  options: RenderOptions
) {
  ctx.clearRect(0, 0, width, height);

  if (!landmarks || landmarks.length < 33) return;

  const toPx = (lm: Landmark3D) => ({
    x: lm.x * width,
    y: lm.y * height,
    vis: lm.visibility ?? 1.0,
  });

  // Determine state-based theme colors
  let primaryColor = '#06b6d4'; // Cyan tracking
  let glowColor = 'rgba(6, 182, 212, 0.4)';

  if (options.hasCompensationAlert) {
    primaryColor = '#f43f5e'; // Rose / red warning
    glowColor = 'rgba(244, 63, 94, 0.6)';
  } else if (options.repState === 'HOLDING_PEAK') {
    primaryColor = '#10b981'; // Emerald peak success
    glowColor = 'rgba(16, 185, 129, 0.7)';
  } else if (options.repState === 'IN_MOTION') {
    primaryColor = '#38bdf8'; // Sky blue active
    glowColor = 'rgba(56, 189, 248, 0.5)';
  }

  // 1. Draw Connectors (Bones)
  ctx.save();
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = primaryColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 8;

  for (const [idxA, idxB] of POSE_CONNECTIONS) {
    const ptA = toPx(landmarks[idxA]);
    const ptB = toPx(landmarks[idxB]);

    if (ptA.vis > 0.4 && ptB.vis > 0.4) {
      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB.x, ptB.y);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Draw Keypoint Nodes
  for (let i = 0; i < landmarks.length; i++) {
    const pt = toPx(landmarks[i]);
    if (pt.vis <= 0.4) continue;

    ctx.save();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 6;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = primaryColor;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Highlight Target Joint & Render Angle Arc Gauge
  drawTargetJointOverlay(ctx, landmarks, toPx, options);
}

function drawTargetJointOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark3D[],
  toPx: (lm: Landmark3D) => { x: number; y: number; vis: number },
  options: RenderOptions
) {
  let vertexIdx: number = POSE_LANDMARKS.LEFT_KNEE;
  let p1Idx: number = POSE_LANDMARKS.LEFT_HIP;
  let p2Idx: number = POSE_LANDMARKS.LEFT_ANKLE;

  if (options.targetJoint === 'right_knee') {
    vertexIdx = POSE_LANDMARKS.RIGHT_KNEE;
    p1Idx = POSE_LANDMARKS.RIGHT_HIP;
    p2Idx = POSE_LANDMARKS.RIGHT_ANKLE;
  } else if (options.targetJoint === 'left_shoulder') {
    vertexIdx = POSE_LANDMARKS.LEFT_SHOULDER;
    p1Idx = POSE_LANDMARKS.LEFT_HIP;
    p2Idx = POSE_LANDMARKS.LEFT_ELBOW;
  } else if (options.targetJoint === 'right_shoulder') {
    vertexIdx = POSE_LANDMARKS.RIGHT_SHOULDER;
    p1Idx = POSE_LANDMARKS.RIGHT_HIP;
    p2Idx = POSE_LANDMARKS.RIGHT_ELBOW;
  }

  const v = toPx(landmarks[vertexIdx]);
  const p1 = toPx(landmarks[p1Idx]);
  const p2 = toPx(landmarks[p2Idx]);

  if (v.vis <= 0.4) return;

  const inTargetZone = options.repState === 'HOLDING_PEAK';

  // Glowing Outer Target Ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(v.x, v.y, inTargetZone ? 18 : 12, 0, 2 * Math.PI);
  ctx.strokeStyle = inTargetZone ? '#10b981' : (options.hasCompensationAlert ? '#f43f5e' : '#38bdf8');
  ctx.lineWidth = 3;
  ctx.shadowColor = inTargetZone ? '#10b981' : '#38bdf8';
  ctx.shadowBlur = 14;
  ctx.stroke();

  // Angle Arc
  const angle1 = Math.atan2(p1.y - v.y, p1.x - v.x);
  const angle2 = Math.atan2(p2.y - v.y, p2.x - v.x);

  ctx.beginPath();
  ctx.arc(v.x, v.y, 32, Math.min(angle1, angle2), Math.max(angle1, angle2));
  ctx.strokeStyle = inTargetZone ? 'rgba(16, 185, 129, 0.85)' : 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Angle Degree Pill Badge
  const badgeX = v.x + 36;
  const badgeY = v.y - 12;
  const angleText = `${Math.round(options.currentAngle)}°`;

  ctx.font = 'bold 15px system-ui, sans-serif';
  const textWidth = ctx.measureText(angleText).width;

  // Background pill
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = inTargetZone ? '#10b981' : '#0ea5e9';
  ctx.lineWidth = 1.5;

  const padX = 8;
  const padY = 4;
  const boxW = textWidth + padX * 2;
  const boxH = 24;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY - 16, boxW, boxH, 6);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = inTargetZone ? '#34d399' : '#ffffff';
  ctx.fillText(angleText, badgeX + padX, badgeY);

  ctx.restore();
}
