import api from './api.js';

const endpoint = (organizationId) => `/organizations/${organizationId}/portal`;

export async function getPortalData(organizationId) {
  const res = await api.get(endpoint(organizationId));
  return res.data.data;
}

export async function updateBillingProfile(organizationId, data) {
  const res = await api.patch(`${endpoint(organizationId)}/billing-profile`, data);
  return res.data.data.customer;
}

export async function requestSubscriptionCancellation(organizationId, subscriptionId, reason) {
  const res = await api.post(`${endpoint(organizationId)}/subscriptions/${subscriptionId}/cancellation-requests`, { reason });
  return res.data.data.notification;
}
