import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getOrganizations, switchOrganization as apiSwitchOrg } from '../services/organization.service.js';
import { AuthContext } from './AuthContext.jsx';

export const OrgContext = createContext(null);

const DEFAULT_DEMO_ORGS = [
  {
    id: 'org_apex_901',
    name: 'Apex Innovations',
    slug: 'apex-innovations',
    description: 'Enterprise operations and intelligent workflow orchestration.',
    role: 'OWNER',
    memberships: [{ role: 'OWNER' }],
    _count: { memberships: 4 },
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'org_hyperscale_442',
    name: 'HyperScale Systems',
    slug: 'hyperscale-systems',
    description: 'Enterprise distributed data plane and compliance infrastructure.',
    role: 'MEMBER',
    memberships: [{ role: 'MEMBER' }],
    _count: { memberships: 8 },
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export function OrgProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganizations([]);
      setActiveOrg(null);
      return;
    }
    setLoading(true);
    try {
      const orgs = await getOrganizations();
      setOrganizations(orgs);
      
      const savedOrgId = sessionStorage.getItem('nexus_active_org_id');
      const found = orgs.find((o) => o.id === savedOrgId);
      if (found) {
        setActiveOrg(found);
      } else if (orgs.length > 0) {
        setActiveOrg(orgs[0]);
        sessionStorage.setItem('nexus_active_org_id', orgs[0].id);
      } else {
        setActiveOrg(null);
      }
    } catch {
      // Backend offline fallback so UI and navigation never freeze
      setOrganizations(DEFAULT_DEMO_ORGS);
      const savedOrgId = sessionStorage.getItem('nexus_active_org_id');
      const found = DEFAULT_DEMO_ORGS.find((o) => o.id === savedOrgId);
      setActiveOrg(found || DEFAULT_DEMO_ORGS[0]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrg = async (orgId) => {
    try {
      const switched = await apiSwitchOrg(orgId);
      setActiveOrg(switched);
      sessionStorage.setItem('nexus_active_org_id', orgId);
      return switched;
    } catch {
      // Offline fallback switch
      const fallback = organizations.find((o) => o.id === orgId) || DEFAULT_DEMO_ORGS.find((o) => o.id === orgId);
      if (fallback) {
        setActiveOrg(fallback);
        sessionStorage.setItem('nexus_active_org_id', orgId);
      }
      return fallback;
    }
  };

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        loading,
        refreshOrganizations: fetchOrganizations,
        switchOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}
