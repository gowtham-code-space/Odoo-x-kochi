export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

export function validateRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

