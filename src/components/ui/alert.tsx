import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Info, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'destructive' | 'success';
  title?: string;
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const baseStyles = 'rounded-xl border p-4 text-xs flex items-start gap-3';

  const variantStyles = {
    info: 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200',
    warning: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
    destructive: 'bg-rose-950/40 border-rose-800/60 text-rose-200',
    success: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
  };

  const icons = {
    info: <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
    destructive: <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />,
    success: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />,
  };

  return (
    <div role="alert" className={twMerge(clsx(baseStyles, variantStyles[variant], className))} {...props}>
      {icons[variant]}
      <div className="space-y-0.5 leading-relaxed">
        {title && <h5 className="font-semibold text-white text-xs">{title}</h5>}
        <div className="text-[11px] opacity-90">{children}</div>
      </div>
    </div>
  );
}
