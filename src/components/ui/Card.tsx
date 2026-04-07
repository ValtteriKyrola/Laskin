import { type ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  accent?: boolean;
  hover?: boolean;
  className?: string;
  actions?: ReactNode;
}

export default function Card({ title, children, accent = false, hover = false, className = '', actions }: CardProps) {
  return (
    <div
      className={[
        'relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 shadow-card',
        accent ? 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-primary-500 before:rounded-t-xl' : '',
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
