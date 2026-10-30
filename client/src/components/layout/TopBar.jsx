import React, { useState, useEffect } from 'react';
import { OrgSwitcher } from '../navigation/OrgSwitcher.jsx';
import { Badge } from '../common/Badge.jsx';
import { Icon } from '@iconify/react';

export function TopBar() {
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
    <header className="h-16 border-b border-[#222c3f] bg-[#111622] px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-5">
        <OrgSwitcher />
        <div className="hidden sm:flex items-center gap-2.5">
          <Badge variant="compliance">
            <Icon icon="lucide:shield-check" className="w-3.5 h-3.5 text-gold" />
            <span>DPDP Aligned</span>
          </Badge>
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 px-2 py-1 rounded bg-[#182030] border border-[#222c3f]">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            ap-south-1
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground tabular-nums px-2.5 py-1 rounded bg-[#131926] border border-[#222c3f]">
          <Icon icon="lucide:clock" className="w-3.5 h-3.5 text-primary" />
          <span>{timeIST}</span>
        </div>
      </div>
    </header>
  );
}
