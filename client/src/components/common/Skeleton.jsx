import React from 'react';

export function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`skeleton-shimmer rounded-sm ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

