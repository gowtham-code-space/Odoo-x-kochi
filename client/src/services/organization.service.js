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

export async function updateOrganization(id, data) {
  const res = await api.patch(API_ENDPOINTS.ORGANIZATION(id), data);
  return res.data.data.organization;
}

export async function getMembers(id) {
  const res = await api.get(`${API_ENDPOINTS.ORGANIZATION(id)}/members`);
  return res.data.data.memberships;
}

export async function addMember(id, data) {
  const res = await api.post(`${API_ENDPOINTS.ORGANIZATION(id)}/members`, data);
  return res.data.data.membership;
}

export async function getOrganizationSettings(id) {
  const res = await api.get(`${API_ENDPOINTS.ORGANIZATION(id)}/settings`);
  return res.data.data.settings;
}

export async function updateOrganizationSettings(id, data) {
  const res = await api.patch(`${API_ENDPOINTS.ORGANIZATION(id)}/settings`, data);
  return res.data.data.settings;
}

