import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Avatar } from '../common/Avatar.jsx';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard',      to: ROUTES.DASHBOARD,     icon: 'lucide:layout-dashboard' },
      ],
    },
    {
      title: 'Subscriptions',
      items: [
        { label: 'Subscriptions',  to: ROUTES.SUBSCRIPTIONS,  icon: 'lucide:repeat' },
        { label: 'Quotations',     to: ROUTES.QUOTATIONS,     icon: 'lucide:file-text' },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { label: 'Products',       to: ROUTES.PRODUCTS,       icon: 'lucide:package' },
        { label: 'Plans',          to: ROUTES.PLANS,          icon: 'lucide:layers' },
        { label: 'Discounts',      to: ROUTES.DISCOUNTS,      icon: 'lucide:tag' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Invoices',       to: ROUTES.INVOICES,       icon: 'lucide:receipt' },
        { label: 'Payments',       to: ROUTES.PAYMENTS,       icon: 'lucide:credit-card' },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { label: 'Settings',       to: ROUTES.SETTINGS,       icon: 'lucide:settings' },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="w-60 border-r border-border bg-surface flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-border flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          S
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-headings font-semibold text-sm tracking-tight text-foreground leading-tight">
            SubsManager
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-medium">
            Billing Platform
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
        {navSections.map((sec, i) => (
          <div key={i}>
            <div className="px-2 mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface-raised'
                    }`
                  }
                >
                  <Icon icon={item.icon} className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-md text-muted-foreground hover:text-error hover:bg-error/10 transition-colors shrink-0 cursor-pointer"
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
