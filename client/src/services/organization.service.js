import api from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';

export async function getOrganizations() {
  const res = await api.get(API_ENDPOINTS.ORGANIZATIONS);
  return res.data.data.organizations;
}

export async function getOrganization(id) {
  const res = await api.get(API_ENDPOINTS.ORGANIZATION(id));
  return res.data.data.organization;
}

export async function createOrganization({ name, description }) {
  const res = await api.post(API_ENDPOINTS.ORGANIZATIONS, { name, description });
  return res.data.data.organization;
}

export async function switchOrganization(id) {
  const res = await api.post(API_ENDPOINTS.ORGANIZATION_SWITCH(id));
  return res.data.data.organization;
}

