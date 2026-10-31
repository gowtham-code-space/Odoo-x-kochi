import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useRole, isAdmin } from '../../hooks/useRole.js';
import { Avatar } from '../common/Avatar.jsx';

export function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth(); const role = useRole(); const navigate = useNavigate();
  const navSections = role === 'CUSTOMER' ? [
    { title: 'My account', items: [{ label: 'Overview', to: ROUTES.DASHBOARD, icon: 'lucide:layout-dashboard' }, { label: 'My subscriptions', to: ROUTES.PORTAL, icon: 'lucide:repeat-2' }, { label: 'My invoices', to: ROUTES.INVOICES, icon: 'lucide:receipt' }, { label: 'Payments', to: ROUTES.PAYMENTS, icon: 'lucide:credit-card' }] },
    { title: 'Preferences', items: [{ label: 'Settings', to: ROUTES.SETTINGS, icon: 'lucide:settings' }] },
  ] : [
    { title: 'Overview', items: [{ label: 'Dashboard', to: ROUTES.DASHBOARD, icon: 'lucide:layout-dashboard' }, { label: 'Reports', to: ROUTES.REPORTS, icon: 'lucide:chart-no-axes-combined' }] },
    { title: 'Sales', items: [{ label: 'Customers', to: ROUTES.CUSTOMERS, icon: 'lucide:users' }, { label: 'Quotations', to: ROUTES.QUOTATIONS, icon: 'lucide:file-text' }, { label: 'Subscriptions', to: ROUTES.SUBSCRIPTIONS, icon: 'lucide:repeat-2' }] },
    { title: 'Catalogue', items: [{ label: 'Products', to: ROUTES.PRODUCTS, icon: 'lucide:package' }, { label: 'Plans', to: ROUTES.PLANS, icon: 'lucide:layers' }, ...(isAdmin(role) ? [{ label: 'Discounts', to: ROUTES.DISCOUNTS, icon: 'lucide:tag' }] : [])] },
    { title: 'Finance', items: [{ label: 'Invoices', to: ROUTES.INVOICES, icon: 'lucide:receipt' }, { label: 'Payments', to: ROUTES.PAYMENTS, icon: 'lucide:credit-card' }] },
    { title: 'Configuration', items: [{ label: 'Settings', to: ROUTES.SETTINGS, icon: 'lucide:settings' }] },
  ];
  const signOut = async () => { await logout(); onClose?.(); navigate(ROUTES.LOGIN, { replace: true }); };
  const nav = <aside className="flex h-full w-64 flex-col border-r border-border bg-surface"><div className="flex h-14 items-center gap-3 border-b border-border px-5"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">S</div><div className="min-w-0"><p className="font-headings text-sm font-bold">SubsManager</p><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Billing workspace</p></div><button type="button" onClick={onClose} className="ml-auto lg:hidden" aria-label="Close navigation"><Icon icon="lucide:x" className="h-5 w-5" /></button></div><div className="flex-1 space-y-5 overflow-y-auto px-3 py-5">{navSections.map((section) => <section key={section.title}><p className="mb-2 px-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">{section.title}</p><div className="space-y-0.5">{section.items.map((item) => <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-surface-raised hover:text-foreground'}`}><Icon icon={item.icon} className="h-4 w-4" />{item.label}</NavLink>)}</div></section>)}</div><div className="border-t border-border p-3"><div className="flex items-center gap-2 px-2 py-2"><Avatar name={user?.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.name}</p><p className="truncate font-mono text-[10px] text-muted-foreground">{role}</p></div><button type="button" onClick={signOut} aria-label="Sign out" className="rounded-md p-2 text-muted-foreground hover:bg-error/10 hover:text-error"><Icon icon="lucide:log-out" className="h-4 w-4" /></button></div></div></aside>;
  return <><div className="hidden h-screen shrink-0 lg:block">{nav}</div>{mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close navigation" onClick={onClose} className="absolute inset-0 h-full w-full bg-foreground/20" />{nav}</div>}</>;
}
