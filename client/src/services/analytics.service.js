import api from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';

export async function runQuery(question) {
  const res = await api.post(API_ENDPOINTS.ANALYTICS_QUERY, { question });
  return res.data.data;
}

export async function getQueryHistory(page = 1, pageSize = 20) {
  const res = await api.get(API_ENDPOINTS.ANALYTICS_HISTORY, { params: { page, pageSize } });
  return res.data.data;
}

export async function getAIStatus() {
  const res = await api.get(API_ENDPOINTS.AI_STATUS);
  return res.data.data;
}
