import { type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export default function Input({ label, unit, error, hint, leftIcon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          {...props}
          className={[
            'w-full bg-neutral-50 dark:bg-neutral-900 border rounded-lg px-3 py-2 text-sm',
            'text-neutral-900 dark:text-neutral-100',
            'transition-all duration-200',
            error
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            'focus:outline-none',
            leftIcon ? 'pl-9' : '',
            unit ? 'pr-12' : '',
            className,
          ].join(' ')}
        />
        {unit && (
          <span className="absolute right-3 text-xs text-neutral-400 dark:text-neutral-500 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
