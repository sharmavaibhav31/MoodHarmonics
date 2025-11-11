import { login as apiLogin, register as apiRegister } from './api.js';

export async function login(email, password) {
  try {
    const res = await apiLogin(email, password);
    if (res?.user_id) {
      localStorage.setItem('mh_user_id', res.user_id);
      return { ok: true };
    }
    return { ok: false, error: res?.message || 'Login failed' };
  } catch (err) {
    return { ok: false, error: err?.response?.data?.message || err.message };
  }
}

export async function register(email, password) {
  try {
    const res = await apiRegister(email, password);
    return { ok: res?.success, error: res?.message };
  } catch (err) {
    return { ok: false, error: err?.response?.data?.message || err.message };
  }
}

export function logout() {
  localStorage.removeItem('mh_user_id');
}

export function isAuthed() {
  return !!localStorage.getItem('mh_user_id');
}


