import React from 'react';
import { Icon } from '@iconify/react';

export function KpiCard({ label, value, detail, icon = 'lucide:chart-no-axes-combined', tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    teal: 'bg-teal/10 text-teal',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-headings text-3xl font-bold tabular-nums text-foreground">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone] || tones.primary}`}>
          <Icon icon={icon} className="h-5 w-5" />
        </span>
      </div>
      {detail && <p className="mt-3 text-xs text-muted-foreground">{detail}</p>}
    </section>
  );
}
