import React from 'react';

export function InnerTile({ children, className = '' }) {
  return (
    <div className={`rounded-md border border-border bg-input p-4 ${className}`}>
      {children}
    </div>
  );
}

