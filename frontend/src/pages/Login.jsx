import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { login } from '../lib/auth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/compose';

  function handleLogin(e) {
    e.preventDefault();
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk || password.length < 6) {
      setMessage('Please enter a valid email and a password of at least 6 characters.');
      return;
    }
    const res = login(email, password);
    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      setMessage(res.error || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 card p-6">
      <h2 className="text-2xl font-semibold">Login</h2>
      <p className="mt-1 text-sm opacity-80">Use test@test.com / test123</p>
      <form className="mt-6 space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="text-sm">Email</label>
          <input
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            type="email"
            className="w-full mt-1 p-3 rounded-card glass focus-ring"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            type="password"
            className="w-full mt-1 p-3 rounded-card glass focus-ring"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
        {message && <div className="text-sm text-red-400">{message}</div>}
        <button type="submit" className="btn-primary w-full h-11">Login</button>
      </form>
      <div className="mt-6 text-sm">
        No account? <Link to="#" onClick={()=>setMessage('Account created — please login')} className="underline">Signup</Link>
      </div>
    </div>
  );
}


