import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  label: string;
  value: string;
  trend?: number;
  icon?: ReactNode;
  color?: string;
  sub?: string;
  onClick?: () => void;
  delay?: number;
}

export default function KPICard({ label, value, trend, icon, color = 'text-primary-500', sub, onClick, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className={[
        'bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700',
        'p-4 shadow-card',
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-tight">{label}</span>
        {icon && <span className={`text-lg ${color}`}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${color}`}>{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-xs text-neutral-400 dark:text-neutral-500">{sub}</span>}
      </div>
    </motion.div>
  );
}
