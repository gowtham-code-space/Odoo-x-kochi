import React from 'react';

export function Avatar({ name = '', size = 'md', className = '' }) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  return (
    <div
      className={`rounded-md bg-surface-raised border border-border flex items-center justify-center font-mono font-medium text-foreground select-none shrink-0 ${sizes[size] || sizes.md} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

