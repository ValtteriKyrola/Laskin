import { Plus, Minus } from 'lucide-react';

interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  error?: string;
  hint?: string;
}

export default function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
  hint,
}: NumberInputProps) {
  const decrement = () => {
    const next = value - step;
    if (min === undefined || next >= min) onChange(Math.round(next * 1000) / 1000);
  };

  const increment = () => {
    const next = value + step;
    if (max === undefined || next <= max) onChange(Math.round(next * 1000) / 1000);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={decrement}
          disabled={min !== undefined && value <= min}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus size={12} />
        </button>
        <div className="relative flex-1 flex items-center">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={[
              'w-full bg-neutral-50 dark:bg-neutral-900 border rounded-lg px-3 py-2 text-sm text-center',
              'text-neutral-900 dark:text-neutral-100 focus:outline-none transition-all duration-200',
              error
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                : 'border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              unit ? 'pr-10' : '',
            ].join(' ')}
          />
          {unit && (
            <span className="absolute right-3 text-xs text-neutral-400 dark:text-neutral-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={max !== undefined && value >= max}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={12} />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
