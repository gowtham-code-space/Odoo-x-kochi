import api from './api.js';

const base = (organizationId, resource) => `/organizations/${organizationId}/${resource}`;

async function list(organizationId, resource, params) {
  const res = await api.get(base(organizationId, resource), { params });
  return res.data.data;
}

async function create(organizationId, resource, data) {
  const res = await api.post(base(organizationId, resource), data);
  const key = resource === 'customers' ? 'customer' : resource.slice(0, -1);
  return res.data.data[key];
}

async function action(organizationId, resource, id, actionName, data = {}) {
  const res = await api.post(`${base(organizationId, resource)}/${id}/${actionName}`, data);
  return res.data.data;
}

export const getPlans = (organizationId, params) => list(organizationId, 'plans', params);
export const createPlan = (organizationId, data) => create(organizationId, 'plans', data);
export const archivePlan = (organizationId, id) => action(organizationId, 'plans', id, 'archive');

export const getCustomers = (organizationId, params) => list(organizationId, 'customers', params);
export const createCustomer = (organizationId, data) => create(organizationId, 'customers', data);

export const getDiscounts = (organizationId, params) => list(organizationId, 'discounts', params);
export const createDiscount = (organizationId, data) => create(organizationId, 'discounts', data);

export const getQuotations = (organizationId, params) => list(organizationId, 'quotations', params);
export const createQuotation = (organizationId, data) => create(organizationId, 'quotations', data);
export const sendQuotation = (organizationId, id) => action(organizationId, 'quotations', id, 'send');
export const acceptQuotation = (organizationId, id) => action(organizationId, 'quotations', id, 'accept');

export const getSubscriptions = (organizationId, params) => list(organizationId, 'subscriptions', params);
export const createSubscription = (organizationId, data) => create(organizationId, 'subscriptions', data);
export const activateSubscription = (organizationId, id) => action(organizationId, 'subscriptions', id, 'activate');
export const pauseSubscription = (organizationId, id) => action(organizationId, 'subscriptions', id, 'pause');
export const resumeSubscription = (organizationId, id) => action(organizationId, 'subscriptions', id, 'resume');
export const closeSubscription = (organizationId, id) => action(organizationId, 'subscriptions', id, 'close');

export const getInvoices = (organizationId, params) => list(organizationId, 'invoices', params);
export const createInvoice = (organizationId, data) => create(organizationId, 'invoices', data);
export const confirmInvoice = (organizationId, id) => action(organizationId, 'invoices', id, 'confirm');

export const getPayments = (organizationId, params) => list(organizationId, 'payments', params);
export const recordPayment = async (organizationId, data) => {
  const res = await api.post(`${base(organizationId, 'payments')}/record`, data);
  return res.data.data.payment;
};
