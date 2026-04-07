import { useState } from 'react';

interface SliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

export default function Slider({ label, min, max, step = 1, value, onChange, unit }: SliderProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</label>
          <span className="text-xs font-semibold text-primary-500">
            {value}{unit ? ` ${unit}` : ''}
          </span>
        </div>
      )}
      <div className="relative pt-1"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showTooltip && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 bg-primary-500 text-white text-xs px-2 py-0.5 rounded pointer-events-none whitespace-nowrap"
            style={{ left: `${pct}%` }}
          >
            {value}{unit}
          </div>
        )}
        <div className="relative h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className="absolute h-2 rounded-full bg-primary-500 transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-400 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
