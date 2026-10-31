import api from './api.js';

const endpoint = (organizationId) => '/organizations/' + organizationId + '/taxes';

export async function getTaxes(organizationId, includeInactive = false) {
  const res = await api.get(endpoint(organizationId), { params: { includeInactive } });
  return res.data.data.taxes;
}

export async function createTax(organizationId, data) {
  const res = await api.post(endpoint(organizationId), data);
  return res.data.data.tax;
}

export async function deactivateTax(organizationId, id) {
  const res = await api.delete(endpoint(organizationId) + '/' + id);
  return res.data.data.tax;
}
