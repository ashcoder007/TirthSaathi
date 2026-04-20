// src/utils/auth.js
export const getToken = () => {
  return localStorage.getItem('ts_token') || null;
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem('ts_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('getUser parse error', err);
    // If corrupt data exists, cleanup and return null
    localStorage.removeItem('ts_user');
    return null;
  }
};

export const setAuth = ({ token, user }) => {
  if (token) localStorage.setItem('ts_token', token);
  if (user) localStorage.setItem('ts_user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('ts_token');
  localStorage.removeItem('ts_user');
};

export const logout = () => {
  clearAuth();
  // optional: redirect
  window.location.href = '/';
};
