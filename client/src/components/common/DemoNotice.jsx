import React from 'react';
import { Icon } from '@iconify/react';

export function DemoNotice({ children = 'Sample workspace data is shown until this API is available.' }) {
  return (
    <div className="mb-5 flex items-start gap-2 rounded-md border border-teal/30 bg-teal/10 px-3 py-2.5 text-sm text-foreground">
      <Icon icon="lucide:flask-conical" className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
      <span><strong className="font-medium">Development preview.</strong> {children}</span>
    </div>
  );
}
