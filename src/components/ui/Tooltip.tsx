import { type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  delay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const sideClasses = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <span className={[
        'absolute z-50 px-2 py-1 text-xs rounded-lg whitespace-nowrap pointer-events-none',
        'bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300',
        sideClasses[side],
      ].join(' ')}>
        {content}
      </span>
    </div>
  );
}
