type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
type Size = 'sm' | 'md';

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger:  'bg-danger/10 text-danger border-danger/30',
  info:    'bg-info/10 text-info border-info/30',
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

export default function Badge({ variant = 'neutral', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center rounded-full border font-medium',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ')}>
      {children}
    </span>
  );
}
