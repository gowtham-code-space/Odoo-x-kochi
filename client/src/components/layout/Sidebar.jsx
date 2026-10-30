import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ROUTES } from '../../constants/routes.js';
import { Badge } from '../common/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Avatar } from '../common/Avatar.jsx';

export function Sidebar() {
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: 'Platform',
      items: [
        {
          label: 'Dashboard',
          to: ROUTES.DASHBOARD,
          icon: 'lucide:layout-grid',
        },
        {
          label: 'Organizations',
          to: ROUTES.ORGANIZATIONS,
          icon: 'lucide:building-2',
        },
      ],
    },
    {
      title: 'Analytics & AI',
      items: [
        {
          label: 'Analytics Suite',
          to: ROUTES.ANALYTICS,
          icon: 'lucide:bar-chart-3',
        },
        {
          label: 'Natural Language Engine',
          to: ROUTES.ANALYTICS_NL,
          icon: 'lucide:sparkles',
          badge: <Badge variant="beta">BETA</Badge>,
        },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          label: 'Settings',
          to: ROUTES.SETTINGS,
          icon: 'lucide:settings',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-[#222c3f] bg-[#111622] flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#222c3f] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-headings font-bold text-base shadow-sm">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-headings font-bold text-base tracking-tight text-foreground leading-tight">
              Nexus
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-medium">
              Enterprise Core
            </span>
          </div>
        </div>
        <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#182030] text-muted-foreground border border-[#222c3f]">
          v1.0
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {navSections.map((sec, i) => (
          <div key={i}>
            <div className="px-2 mb-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {sec.title}
            </div>
            <div className="space-y-1">
              {sec.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-[#1c2436] text-white font-medium border border-[#263248]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-[#182030]/60 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon icon={item.icon} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-[#222c3f] bg-[#0c1018]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-lg text-muted-foreground hover:text-error hover:bg-[#182030] transition-colors shrink-0 cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <Icon icon="lucide:log-out" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
