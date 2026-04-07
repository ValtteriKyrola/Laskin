import { type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({ label, error, hint, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className={[
          'w-full bg-neutral-50 dark:bg-neutral-900 border rounded-lg px-3 py-2 text-sm',
          'text-neutral-900 dark:text-neutral-100',
          'transition-all duration-200 focus:outline-none',
          error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
            : 'border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          className,
        ].join(' ')}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
