import api from './api.js';

export async function updateProfile(data) {
  const res = await api.patch('/users/me', data);
  return res.data.data.user;
}

export async function changePassword(data) {
  const res = await api.post('/auth/change-password', data);
  return res.data.data;
}
