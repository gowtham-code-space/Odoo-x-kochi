import api from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';

export async function register({ name, email, password }) {
  const res = await api.post(API_ENDPOINTS.AUTH_REGISTER, { name, email, password });
  return res.data.data.user;
}

export async function login({ email, password }) {
  const res = await api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password });
  return res.data.data.user;
}

export async function logout() {
  await api.post(API_ENDPOINTS.AUTH_LOGOUT);
}

export async function getMe() {
  const res = await api.get(API_ENDPOINTS.AUTH_ME);
  return res.data.data.user;
}

