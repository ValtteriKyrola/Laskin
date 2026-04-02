import { useEffect } from 'react';
import { useStore } from '../../store/useStore';

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
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm animate-slide-in
            ${t.type === 'info' ? 'bg-gray-900 border-gray-700 text-gray-200' : ''}
            ${t.type === 'success' ? 'bg-green-900/80 border-green-700 text-green-100' : ''}
            ${t.type === 'error' ? 'bg-red-900/80 border-red-700 text-red-100' : ''}
          `}
        >
          <span className="text-base leading-none mt-0.5">
            {t.type === 'info' ? '💬' : t.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="text-gray-500 hover:text-gray-300 text-xs leading-none ml-1 mt-0.5"
          >✕</button>
        </div>
      ))}
    </div>
  );
}
