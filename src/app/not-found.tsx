import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <span className="text-5xl font-extrabold font-mono text-cyan-400">404</span>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-lg font-bold text-white">Clinical Route Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested rehabilitation protocol or clinical route does not exist or has been relocated.
        </p>
      </div>

      <div className="pt-2">
        <Link href="/">
          <Button variant="primary" size="sm">
            <Home className="h-3.5 w-3.5 mr-1.5" />
            <span>Return to Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
