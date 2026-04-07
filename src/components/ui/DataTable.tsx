import { useState, type ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  highlightRow?: (row: T) => boolean;
}

export default function DataTable<T>({ columns, data, emptyText = 'Ei dataa', rowKey, onRowClick, highlightRow }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        const dir = sortDir === 'asc' ? 1 : -1;
        return av > bv ? dir : av < bv ? -dir : 0;
      })
    : data;

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-500">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="sticky top-0 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={[
                  'py-2.5 px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  col.sortable ? 'cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 select-none' : '',
                ].join(' ')}
                onClick={() => col.sortable && toggleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortKey === col.key
                      ? sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      : <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const highlighted = highlightRow?.(row);
            return (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={[
                  'border-b border-neutral-100 dark:border-neutral-800 transition-colors',
                  i % 2 === 1 ? 'bg-neutral-50 dark:bg-neutral-800/50' : '',
                  onRowClick ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30',
                  highlighted ? 'bg-primary-50 dark:bg-primary-900/20 font-medium' : '',
                ].join(' ')}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={[
                      'py-2 px-3 text-neutral-700 dark:text-neutral-300',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    ].join(' ')}
                  >
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
