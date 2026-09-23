// REHAB-AI: Production Site Configuration & Medical Boundaries
export const siteConfig = {
  name: 'REHAB-AI',
  description: 'AI-assisted home rehabilitation platform with browser-based computer vision for exercise tracking and structured clinical review.',
  url: 'https://rehab-ai.health',
  company: 'REHAB-AI Healthcare Technologies',
  links: {
    docs: '/docs',
    support: '/support',
    privacy: '/privacy',
    terms: '/terms',
  },
  medicalDisclaimer: {
    short: 'REHAB-AI is an assistive rehabilitation monitoring system. It is NOT a diagnostic tool, medical emergency predictor, or replacement for a licensed physiotherapist.',
    full: 'REHAB-AI provides assistive tracking and biofeedback for prescribed physical therapy exercises. It does not provide medical diagnosis, predict medical emergencies, or prescribe treatments. Always consult your qualified healthcare provider with any medical questions. If you experience acute pain, shortness of breath, dizziness, or suspect a medical emergency, stop immediately and call your local emergency services.',
  },
  navigation: {
    marketing: [
      { name: 'Features', href: '/#features' },
      { name: 'How it Works', href: '/#how-it-works' },
      { name: 'Clinical Evidence', href: '/#clinical' },
      { name: 'Safety & Privacy', href: '/#safety' },
    ],
    patient: [
      { name: 'Dashboard', href: '/patient/dashboard' },
      { name: 'My Exercises', href: '/patient/exercises' },
      { name: 'Progress & Trends', href: '/patient/progress' },
      { name: 'Settings', href: '/settings' },
    ],
    clinician: [
      { name: 'Caseload Overview', href: '/clinician/dashboard' },
      { name: 'Patients Directory', href: '/clinician/patients' },
      { name: 'Settings', href: '/settings' },
    ],
  },
};
