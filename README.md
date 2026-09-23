<div align="center">

<img src="./public/rehab-logo.svg" width="90" height="90" alt="REHAB-AI Kinetic Cross Logo" />

# REHAB-AI
### Clinical-Grade Computer Vision Rehabilitation & Tele-Recovery Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsoumya0166-debug%2Frehab-ai)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks%20Vision-008378?style=flat)](https://developers.google.com/mediapipe)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🚀 Live Preview on Vercel

Because **REHAB-AI** is a full-stack Next.js web application utilizing edge-ready server actions and local computer vision pipelines, it runs on **Vercel** rather than static GitHub Pages.

### How to Open the Live Preview:
1. Click the **[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsoumya0166-debug%2Frehab-ai)** button above.
2. Sign in with GitHub and select your repository: **`soumya0166-debug/rehab-ai`**.
3. Click **Deploy**. Vercel will build and assign you a free, permanent live domain:
   ```
   https://rehab-ai-*.vercel.app
   ```
4. Once deployed, every new git push automatically deploys a live preview!

---

## ✨ Design System (Stitch Project ID: `18305519069168927233`)

REHAB-AI implements the complete Google Stitch clinical rehabilitation design system:

* **Dr. Priya (Virtual Human AI Physiotherapist)**: Cinematic demonstration avatar guiding patients through controlled range-of-motion protocols.
* **Synchronized Mirror HUD**: Dual-stack layout pairing Priya's active demonstration with the patient's real-time skeleton overlay and dynamic angle chip.
* **Kinematic Telemetry Strip**: 3D joint angle dials, target corridor matching, 30 FPS confidence tracking, and pacing control.
* **Accessible Typography & Colors**: Refined surgical teal (`#00685f`), crisp clinical slate (`#f8f9ff`), and high-contrast ink navy (`#0b1c30`).
* **Offline-First Synchronization**: Zero-data-loss local queue with automatic background sync upon network recovery.

---

## 🏃 Running Locally

```bash
# 1. Clone repository
git clone https://github.com/soumya0166-debug/rehab-ai.git
cd rehab-ai

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the live app.

---

## 🧪 Automated Tests & Validation

All 8 test suites are 100% passing:

```bash
# Run unit, integration, and E2E test suites
npm test

# Run ESLint validation
npm run lint

# Run production build
npm run build
```

---

## ⚖️ Clinical Safety Disclaimer

> **REHAB-AI is an assistive rehabilitation technology prototype. It does not replace professional medical advice, diagnosis, or treatment.**  
> Always consult a licensed physiotherapist or healthcare professional before beginning or modifying any physical exercise routine.
