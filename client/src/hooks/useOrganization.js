import { useContext } from 'react';
import { OrgContext } from '../context/OrgContext.jsx';

export function useOrganization() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrgProvider');
  }
  return context;
}

