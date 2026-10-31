import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useOrganization } from '../../hooks/useOrganization.js';
import { ROUTES } from '../../constants/routes.js';

export function OrgSwitcher() {
  const { organizations, activeOrg, switchOrg } = useOrganization();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (orgId) => {
    setOpen(false);
    if (activeOrg?.id !== orgId) {
      await switchOrg(orgId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-border bg-input hover:bg-surface-raised transition-colors text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary select-none cursor-pointer"
      >
        <div className="w-5 h-5 rounded-sm bg-primary/20 text-primary flex items-center justify-center font-mono text-xs font-bold border border-primary/30">
          {activeOrg?.name ? activeOrg.name.charAt(0).toUpperCase() : 'O'}
        </div>
        <span className="font-medium truncate max-w-[140px]">
          {activeOrg ? activeOrg.name : 'Select Tenant'}
        </span>
        <Icon icon="lucide:chevrons-up-down" className="w-4 h-4 text-muted-foreground ml-auto" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 rounded-md border border-border bg-surface-raised p-2 shadow-xl z-50">
          <div className="px-2 py-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground border-b border-border/50 mb-1">
            Authorized Workspaces
          </div>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {organizations.map((org) => {
              const isSelected = org.id === activeOrg?.id;
              const userRole = org.memberships?.[0]?.role || 'CUSTOMER';
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelect(org.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-sm text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border border-primary/30 bg-primary/10 text-primary'
                      : 'border border-transparent text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-medium text-xs truncate">{org.name}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {org.slug}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground shrink-0 border border-border">
                    {userRole}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border/50 mt-1.5 pt-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(ROUTES.ORGANIZATIONS_NEW);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded-sm transition-colors cursor-pointer"
            >
              <Icon icon="lucide:plus" className="w-3.5 h-3.5 text-primary" />
              <span>Create organization</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(ROUTES.ORGANIZATIONS);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors cursor-pointer"
            >
              <Icon icon="lucide:settings-2" className="w-3.5 h-3.5" />
              <span>Manage organizations</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

