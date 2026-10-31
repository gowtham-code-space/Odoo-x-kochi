import api from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';

export async function getProducts(organizationId, params = {}) {
  const res = await api.get(API_ENDPOINTS.PRODUCTS(organizationId), { params });
  return res.data.data;
}

export async function createProduct(organizationId, product) {
  const res = await api.post(API_ENDPOINTS.PRODUCTS(organizationId), product);
  return res.data.data.product;
}

export async function createProductVariant(organizationId, productId, variant) {
  const res = await api.post(API_ENDPOINTS.PRODUCT_VARIANTS(organizationId, productId), variant);
  return res.data.data.variant;
}
