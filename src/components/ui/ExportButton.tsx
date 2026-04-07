import { useState, useRef, useEffect, type ReactElement } from 'react';
import { Download, FileText, Image, Code, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  onExportSVG?: () => void;
  onExportPNG?: () => void;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  label?: string;
}

export default function ExportButton({ onExportSVG, onExportPNG, onExportJSON, onExportCSV, label = 'Vie' }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  type Option = { label: string; icon: ReactElement; action: () => void };
  const options = [
    onExportSVG  && { label: 'SVG-vektori',  icon: <Image size={14} />,    action: onExportSVG  },
    onExportPNG  && { label: 'PNG-kuva',      icon: <Image size={14} />,    action: onExportPNG  },
    onExportJSON && { label: 'JSON-data',     icon: <Code size={14} />,     action: onExportJSON },
    onExportCSV  && { label: 'CSV-taulukko',  icon: <FileText size={14} />, action: onExportCSV  },
  ].filter(Boolean) as Option[];

  if (options.length === 0) return null;
  if (options.length === 1) {
    return (
      <button onClick={options[0].action}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
        <Download size={13} /> {label}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
      >
        <Download size={13} /> {label} <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-dropdown z-50 overflow-hidden py-1">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { opt.action(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
