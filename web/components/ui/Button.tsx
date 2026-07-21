'use client';

import type { ButtonHTMLAttributes, ReactNode, ReactElement } from 'react';
import { cloneElement, isValidElement } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-paper hover:bg-indigo-700 focus-visible:ring-primary disabled:opacity-50 shadow-sm shadow-indigo-900/10',
  secondary:
    'bg-surface text-ink border border-border hover:bg-surface-2 focus-visible:ring-primary disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:opacity-50',
  ghost:
    'bg-transparent text-ink border border-transparent hover:bg-surface-2 focus-visible:ring-primary disabled:opacity-40',
  accent:
    'bg-accent text-slate-900 hover:bg-amber-600 focus-visible:ring-amber-500 disabled:opacity-50 shadow-sm shadow-amber-900/10',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  asChild = false,
  ...rest
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold font-sans',
    'transition-all duration-200 active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  const content = (
    <>
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (asChild && isValidElement(children)) {
    const childProps = children.props as { className?: string };
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: [classes, childProps.className].filter(Boolean).join(' '),
      ...(rest as Record<string, unknown>),
    });
  }

  return (
    <button disabled={disabled || loading} className={classes} {...rest}>
      {content}
    </button>
  );
}
