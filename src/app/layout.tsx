import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navigation/Navbar';
import { AuthProvider } from '@/lib/auth/auth-context';

const inter = Inter({ subsets: ['latin'] });

import { Footer } from '@/components/navigation/Footer';

export const metadata: Metadata = {
  title: 'REHAB-AI | AI-Powered Home Rehabilitation & Recovery Assistant',
  description: 'Clinical-grade computer vision rehabilitation observing movement quality, measuring joint angles in real time, and tracking tele-recovery progress for physiotherapists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
