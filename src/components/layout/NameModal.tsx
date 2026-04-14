import { useState } from 'react';
import { useStore } from '../../store/useStore';

interface Props {
  onDone: () => void;
}

export default function NameModal({ onDone }: Props) {
  const { setUserName } = useStore();
  const [name, setName] = useState('');

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem('fieldlab-username', trimmed);
    setUserName(trimmed);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-sm">FL</span>
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          Tervetuloa FieldLab-työkaluun
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Anna nimesi niin muut näkevät kuka on paikalla.
        </p>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
          Nimesi
        </label>
        <input
          autoFocus
          type="text"
          placeholder="Etunimi Sukunimi"
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          maxLength={40}
        />
        <button
          onClick={save}
          disabled={!name.trim()}
          className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Jatka →
        </button>
      </div>
    </div>
  );
}
