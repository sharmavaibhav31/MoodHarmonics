export function login(email, password) {
  if (email === 'test@test.com' && password === 'test123') {
    localStorage.setItem('mh_auth', '1');
    return { ok: true };
  }
  return { ok: false, error: 'Invalid credentials — try test@test.com / test123' };
}

export function logout() {
  localStorage.removeItem('mh_auth');
}

export function isAuthed() {
  return localStorage.getItem('mh_auth') === '1';
}


