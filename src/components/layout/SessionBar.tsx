import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { PresenceUser } from '../../hooks/usePresence';

function UserAvatar({ user }: { user: PresenceUser }) {
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      title={`${user.name} – ${user.activeTab}`}
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-white dark:ring-neutral-900"
      style={{ backgroundColor: user.color }}
    >
      {initials}
    </div>
  );
}

interface SessionBarProps {
  compact?: boolean;
}

export default function SessionBar({ compact = false }: SessionBarProps) {
  const { sessionId, userName, setUserName, onlineUsers } = useStore();
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const shareUrl = sessionId
    ? `${window.location.origin}${window.location.pathname}?session=${sessionId}`
    : null;

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      localStorage.setItem('fieldlab-username', nameInput.trim());
    }
    setEditingName(false);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {onlineUsers.slice(0, 4).map((u) => (
              <UserAvatar key={u.name} user={u} />
            ))}
            {onlineUsers.length > 4 && (
              <span className="text-xs text-neutral-500">+{onlineUsers.length - 4}</span>
            )}
          </div>
        )}
        {sessionId && (
          <button
            onClick={copyLink}
            className={`w-full text-left text-xs font-mono px-2 py-1 rounded-lg border transition-colors ${
              copied
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {copied ? '✓ Kopioitu!' : `📋 ${sessionId.slice(0, 8)}…`}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Online users */}
      {onlineUsers.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1.5">
            {onlineUsers.slice(0, 5).map((u) => (
              <UserAvatar key={u.name} user={u} />
            ))}
            {onlineUsers.length > 5 && (
              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs text-neutral-600 dark:text-neutral-300 ring-2 ring-white dark:ring-neutral-900">
                +{onlineUsers.length - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-neutral-400 hidden md:block ml-0.5">
            {onlineUsers.length} online
          </span>
        </div>
      )}

      {/* My name */}
      {editingName ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            className="bg-neutral-100 dark:bg-neutral-800 border border-primary-500 rounded-lg px-2 py-1 text-xs text-neutral-900 dark:text-neutral-100 w-28 focus:outline-none"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
          />
          <button onClick={saveName} className="text-primary-500 text-xs hover:text-primary-400">✓</button>
        </div>
      ) : (
        <button
          onClick={() => { setNameInput(userName); setEditingName(true); }}
          className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hidden sm:block"
          title="Muuta nimesi"
        >
          👤 {userName}
        </button>
      )}

      {/* Session code + copy */}
      {sessionId && (
        <button
          onClick={copyLink}
          title="Kopioi jaettava linkki"
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono border transition-colors ${
            copied
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500'
          }`}
        >
          {copied ? '✓ Kopioitu!' : `📋 ${sessionId.slice(0, 8)}`}
        </button>
      )}
    </div>
  );
}
