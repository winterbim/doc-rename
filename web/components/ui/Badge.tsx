import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'accent' | 'outline' | 'soft';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-surface-2 text-text-2 border border-border',
  primary: 'bg-primary-2 text-primary border border-primary/20',
  success: 'bg-success-2 text-success border border-success/20',
  accent: 'bg-accent-2 text-amber-700 border border-amber-200',
  outline: 'bg-transparent text-text-2 border border-border-2',
  soft: 'bg-slate-100 text-slate-700 border border-transparent',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  className = '',
  variant = 'default',
  size = 'md',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}
