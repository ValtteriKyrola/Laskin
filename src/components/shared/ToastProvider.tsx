import { useEffect } from 'react';
import { useStore } from '../../store/useStore';

const typeStyles = {
  info:    'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100',
  success: 'bg-success/10 border-success/30 text-success',
  error:   'bg-danger/10 border-danger/30 text-danger',
};

const typeIcon = { info: '💬', success: '✅', error: '❌' };

export default function ToastProvider() {
  const { toasts, removeToast } = useStore();

  useEffect(() => {
    toasts.forEach((t) => {
      const timer = setTimeout(() => removeToast(t.id), 4000);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-dropdown text-sm animate-slide-in ${typeStyles[t.type]}`}
        >
          <span className="text-base leading-none mt-0.5">{typeIcon[t.type]}</span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-neutral-400 hover:text-neutral-600 text-xs ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}
