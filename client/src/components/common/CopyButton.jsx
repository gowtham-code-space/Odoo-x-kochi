import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 bg-surface-raised hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono rounded-sm px-2 py-0.5 transition-colors border border-border select-none ${className}`}
      title="Copy to clipboard"
    >
      <Icon
        icon={copied ? 'lucide:check' : 'lucide:copy'}
        className={`w-3 h-3 ${copied ? 'text-success' : ''}`}
      />
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

