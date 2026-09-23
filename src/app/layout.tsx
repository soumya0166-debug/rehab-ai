import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navigation/Navbar';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Footer } from '@/components/navigation/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-headline',
});

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
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col selection:bg-[#00685f] selection:text-white`}>
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
