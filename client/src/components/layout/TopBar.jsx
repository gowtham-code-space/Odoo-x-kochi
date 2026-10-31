import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../hooks/useAuth.js';

export function TopBar({ onMenu }) {
  const { user } = useAuth();
  const [timeIST, setTimeIST] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeIST(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
      {/* Left: Status indicator */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground lg:hidden" aria-label="Open navigation">
          <Icon icon="lucide:menu" className="h-5 w-5" />
        </button>
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-raised border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          Workspace interface
        </span>
      </div>

      {/* Right: time + user */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-muted-foreground tabular-nums px-2.5 py-1 rounded-md bg-surface-raised border border-border">
          <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-primary" />
          <span>{timeIST}</span>
        </div>

        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon="lucide:user" className="w-4 h-4" />
            <span className="hidden md:inline font-medium text-foreground">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
