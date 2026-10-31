import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getOrganizations, switchOrganization as apiSwitchOrg } from '../services/organization.service.js';
import { AuthContext } from './AuthContext.jsx';

export const OrgContext = createContext(null);

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
      // Never substitute another tenant's mock data when the API is unavailable.
      setOrganizations([]);
      setActiveOrg(null);
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
    } catch (error) {
      throw error;
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
