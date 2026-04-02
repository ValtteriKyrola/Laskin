import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { PresenceUser } from '../../hooks/usePresence';

function UserAvatar({ user }: { user: PresenceUser }) {
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      title={`${user.name} – ${user.activeTab}`}
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gray-950 shrink-0 ring-2 ring-gray-950"
      style={{ backgroundColor: user.color }}
    >
      {initials}
    </div>
  );
}

export default function SessionBar() {
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
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300 ring-2 ring-gray-950">
                +{onlineUsers.length - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 hidden md:block ml-1">
            {onlineUsers.length} online
          </span>
        </div>
      )}

      {/* My name */}
      {editingName ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            className="bg-gray-800 border border-yellow-500 rounded px-2 py-0.5 text-xs text-white w-32 focus:outline-none"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
          />
          <button onClick={saveName} className="text-yellow-400 text-xs hover:text-yellow-300">✓</button>
        </div>
      ) : (
        <button
          onClick={() => { setNameInput(userName); setEditingName(true); }}
          className="text-xs text-gray-400 hover:text-gray-200 hidden sm:block"
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
              ? 'bg-green-900/50 border-green-700 text-green-400'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
          }`}
        >
          {copied ? '✓ Kopioitu!' : `📋 ${sessionId.slice(0, 8)}`}
        </button>
      )}
    </div>
  );
}
