// REHAB-AI: Central Clinical Data Store & Patient Telemetry State
import { PatientProfile, SessionRecord, Prescription } from '@/types/rehab';

export const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: 'pt-001',
    name: 'Sarah Connor',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    age: 29,
    condition: 'Anterior Cruciate Ligament (ACL) Reconstruction',
    affectedSide: 'left',
    surgeryDate: '2026-08-15',
    startDate: '2026-08-22',
    assignedClinician: 'Dr. Michael Chen, DPT',
    caregiver: {
      id: 'cg-001',
      name: 'John Connor',
      relationship: 'Spouse / Primary Caregiver',
      email: 'john.care@familynet.org',
      phone: '+1 (555) 234-8901',
      notifyOnPainAlert: true,
      notifyOnMissedSession: true,
      weeklyDigest: true,
    },
    complianceStreak: 6,
    weeklyAdherencePercent: 92,
    riskFlag: 'low',
    prescriptions: [
      {
        id: 'rx-101',
        exerciseId: 'knee-extension',
        exerciseName: 'Seated Knee Extension (TKE)',
        targetReps: 10,
        targetSets: 3,
        targetAngleMin: 172,
        targetAngleMax: 180,
        holdDurationSeconds: 2,
        frequencyDaysPerWeek: 5,
        notesForPatient: 'Focus on full terminal lockout without arching lower back.',
        prescribedAt: '2026-09-10',
        clinicianName: 'Dr. Michael Chen, DPT',
        active: true,
      },
      {
        id: 'rx-102',
        exerciseId: 'bodyweight-squat',
        exerciseName: 'Controlled Rehabilitation Squat',
        targetReps: 8,
        targetSets: 3,
        targetAngleMin: 90,
        targetAngleMax: 105,
        holdDurationSeconds: 1.5,
        frequencyDaysPerWeek: 4,
        notesForPatient: 'Push knees outward to prevent valgus strain.',
        prescribedAt: '2026-09-14',
        clinicianName: 'Dr. Michael Chen, DPT',
        active: true,
      },
    ],
    history: [
      {
        id: 'sess-001',
        patientId: 'pt-001',
        patientName: 'Sarah Connor',
        exerciseId: 'knee-extension',
        exerciseName: 'Seated Knee Extension (TKE)',
        date: '2026-09-18T10:30:00Z',
        targetReps: 10,
        completedReps: 10,
        cleanReps: 9,
        averageRom: 174,
        peakRom: 178,
        targetRom: 172,
        averageHoldTime: 2.1,
        overallScore: 94,
        compensationBreakdown: { 'Backward Trunk Lean': 1 },
        painScore: 2,
        effortRpe: 4,
        reps: [],
        clinicianNotes: 'Great VMO quadriceps firing. Terminal extension improving steadily.',
      },
      {
        id: 'sess-002',
        patientId: 'pt-001',
        patientName: 'Sarah Connor',
        exerciseId: 'knee-extension',
        exerciseName: 'Seated Knee Extension (TKE)',
        date: '2026-09-20T14:15:00Z',
        targetReps: 10,
        completedReps: 10,
        cleanReps: 10,
        averageRom: 176,
        peakRom: 180,
        targetRom: 172,
        averageHoldTime: 2.0,
        overallScore: 98,
        compensationBreakdown: {},
        painScore: 1,
        effortRpe: 3,
        reps: [],
        clinicianNotes: 'Full 180 lockout achieved. Zero compensation detected.',
      },
    ],
  },
  {
    id: 'pt-002',
    name: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    age: 44,
    condition: 'Rotator Cuff (Supraspinatus) Repair',
    affectedSide: 'right',
    surgeryDate: '2026-07-28',
    startDate: '2026-08-05',
    assignedClinician: 'Dr. Michael Chen, DPT',
    caregiver: {
      id: 'cg-002',
      name: 'Linda Vance',
      relationship: 'Daughter',
      email: 'linda.v@familynet.org',
      phone: '+1 (555) 345-6789',
      notifyOnPainAlert: true,
      notifyOnMissedSession: false,
      weeklyDigest: true,
    },
    complianceStreak: 3,
    weeklyAdherencePercent: 78,
    riskFlag: 'medium',
    riskReason: 'Occasional trapezius shoulder hiking above 80 degrees elevation.',
    prescriptions: [
      {
        id: 'rx-201',
        exerciseId: 'shoulder-scaption',
        exerciseName: 'Shoulder Scaption / Abduction',
        targetReps: 10,
        targetSets: 3,
        targetAngleMin: 90,
        targetAngleMax: 110,
        holdDurationSeconds: 2,
        frequencyDaysPerWeek: 4,
        notesForPatient: 'Depress shoulder blades before initiating lift.',
        prescribedAt: '2026-09-12',
        clinicianName: 'Dr. Michael Chen, DPT',
        active: true,
      },
    ],
    history: [
      {
        id: 'sess-003',
        patientId: 'pt-002',
        patientName: 'Marcus Vance',
        exerciseId: 'shoulder-scaption',
        exerciseName: 'Shoulder Scaption / Abduction',
        date: '2026-09-19T09:00:00Z',
        targetReps: 10,
        completedReps: 8,
        cleanReps: 5,
        averageRom: 88,
        peakRom: 94,
        targetRom: 90,
        averageHoldTime: 1.8,
        overallScore: 76,
        compensationBreakdown: { 'Upper Trapezius Shrug (Shoulder Hike)': 3 },
        painScore: 4,
        effortRpe: 6,
        reps: [],
        clinicianNotes: 'Trapezius compensation triggered on reps 6-8. Advised to stay below 90 deg until shoulder stabilizes.',
      },
    ],
  },
  {
    id: 'pt-003',
    name: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    age: 62,
    condition: 'Total Knee Arthroplasty (TKA)',
    affectedSide: 'left',
    surgeryDate: '2026-09-02',
    startDate: '2026-09-06',
    assignedClinician: 'Dr. Michael Chen, DPT',
    caregiver: {
      id: 'cg-003',
      name: 'Dmitri Rostov',
      relationship: 'Son / Guardian',
      email: 'dmitri.r@familynet.org',
      phone: '+1 (555) 456-7890',
      notifyOnPainAlert: true,
      notifyOnMissedSession: true,
      weeklyDigest: true,
    },
    complianceStreak: 8,
    weeklyAdherencePercent: 95,
    riskFlag: 'low',
    prescriptions: [
      {
        id: 'rx-301',
        exerciseId: 'knee-extension',
        exerciseName: 'Seated Knee Extension (TKE)',
        targetReps: 8,
        targetSets: 3,
        targetAngleMin: 165,
        targetAngleMax: 175,
        holdDurationSeconds: 2,
        frequencyDaysPerWeek: 5,
        notesForPatient: 'Steady slow repetitions. Do not rush the return phase.',
        prescribedAt: '2026-09-08',
        clinicianName: 'Dr. Michael Chen, DPT',
        active: true,
      },
      {
        id: 'rx-302',
        exerciseId: 'straight-leg-raise',
        exerciseName: 'Straight Leg Raise (Supine/Seated)',
        targetReps: 8,
        targetSets: 2,
        targetAngleMin: 40,
        targetAngleMax: 50,
        holdDurationSeconds: 3,
        frequencyDaysPerWeek: 5,
        notesForPatient: 'Keep the knee completely locked without bending.',
        prescribedAt: '2026-09-12',
        clinicianName: 'Dr. Michael Chen, DPT',
        active: true,
      },
    ],
    history: [
      {
        id: 'sess-004',
        patientId: 'pt-003',
        patientName: 'Elena Rostova',
        exerciseId: 'knee-extension',
        exerciseName: 'Seated Knee Extension (TKE)',
        date: '2026-09-21T11:00:00Z',
        targetReps: 8,
        completedReps: 8,
        cleanReps: 7,
        averageRom: 168,
        peakRom: 172,
        targetRom: 165,
        averageHoldTime: 2.0,
        overallScore: 91,
        compensationBreakdown: { 'Backward Trunk Lean': 1 },
        painScore: 3,
        effortRpe: 5,
        reps: [],
        clinicianNotes: 'Good compliance. Extension ROM reached 172 deg, ahead of post-op protocol.',
      },
    ],
  },
];

const STORAGE_KEY = 'rehab_ai_patients_state_v1';

export function getPatients(): PatientProfile[] {
  if (typeof window === 'undefined') return INITIAL_PATIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading patients from local storage:', err);
    return INITIAL_PATIENTS;
  }
}

export function savePatients(patients: PatientProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error('Error saving patients to local storage:', err);
  }
}

export function getPatientById(id: string): PatientProfile | undefined {
  const all = getPatients();
  return all.find((p) => p.id === id);
}

export function saveSessionRecord(session: SessionRecord) {
  const patients = getPatients();
  const patient = patients.find((p) => p.id === session.patientId);
  if (!patient) return;

  patient.history.unshift(session);
  patient.complianceStreak += 1;
  patient.weeklyAdherencePercent = Math.min(100, patient.weeklyAdherencePercent + 2);

  // Check if risk flag needs to be updated
  if (session.painScore >= 7) {
    patient.riskFlag = 'high';
    patient.riskReason = `Patient reported acute pain spike (${session.painScore}/10) during ${session.exerciseName}.`;
  } else if (session.overallScore < 70) {
    patient.riskFlag = 'medium';
    patient.riskReason = `Repeated compensation faults detected during ${session.exerciseName}.`;
  }

  savePatients(patients);
}

export function addPrescription(patientId: string, prescription: Prescription) {
  const patients = getPatients();
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return;

  patient.prescriptions.push(prescription);
  savePatients(patients);
}

export function resetDemoData() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
}
