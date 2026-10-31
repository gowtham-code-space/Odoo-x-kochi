import { register, login, getCurrentUser, requestPasswordReset, resetPassword, changePassword } from './auth.service.js';
import { COOKIE_NAME, COOKIE_OPTIONS, CLEAR_COOKIE_OPTIONS } from '../../config/security.js';

export async function handleRegister(req, res) {
  const { user, token } = await register(req.body);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json({ success: true, data: { user } });
}

export async function handleLogin(req, res) {
  const { user, token } = await login(req.body);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ success: true, data: { user } });
}

export async function handleLogout(_req, res) {
  res.clearCookie(COOKIE_NAME, CLEAR_COOKIE_OPTIONS);
  res.json({ success: true, data: { message: 'Signed out successfully' } });
}

export async function handleMe(req, res) {
  const user = await getCurrentUser(req.user.id);
  res.json({ success: true, data: { user } });
}

export async function handleForgotPassword(req, res) {
  await requestPasswordReset(req.body.email);
  res.json({ success: true, data: { message: 'If the email is registered, a reset link will be sent.' } });
}

export async function handleResetPassword(req, res) {
  await resetPassword(req.body.token, req.body.password);
  res.json({ success: true, data: { message: 'Password reset successfully' } });
}

export async function handleChangePassword(req, res) {
  await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, data: { message: 'Password changed successfully' } });
}

