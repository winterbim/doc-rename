import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'primary' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variantClasses = {
  default: 'bg-surface border border-border shadow-sm',
  elevated: 'bg-surface border border-border shadow-lg shadow-slate-900/5',
  outlined: 'bg-transparent border border-border-2',
  primary: 'bg-primary text-paper border border-primary',
  dark: 'bg-slate-900 text-slate-50 border border-slate-800',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
