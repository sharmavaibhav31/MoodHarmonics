import { useState } from 'react';
import GridScan from '../components/GridScan.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, register } from '../lib/auth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/compose';

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk || password.length < 6) {
      setMessage('Please enter a valid email and a password of at least 6 characters.');
      return;
    }

    const handler = isSignup ? register : login;
    const res = await handler(email, password);

    if (res.ok) {
      if (isSignup) {
        setMessage('Account created! Redirecting to login...');
        setTimeout(() => {
          setIsSignup(false);
          setMessage('');
          // Redirect to login view by just changing state
        }, 1500);
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setMessage(res.error || 'An unknown error occurred.');
    }
  }

  return (
    <div className="relative">
      {/* Animated background */}
      <div style={{
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          useWindowCursor
        />
      </div>

      <div className="max-w-md mx-auto mt-12 card p-6 relative z-10">
        <h2 className="text-2xl font-semibold">{isSignup ? 'Sign Up' : 'Login'}</h2>
        {!isSignup && <p className="mt-1 text-sm opacity-80">Use test@test.com / test123</p>}
        <form id="loginForm" className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full mt-1 p-3 rounded-card glass focus-ring"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          {message && <div className="text-sm text-red-400">{message}</div>}
          <button type="submit" className="btn-primary w-full h-11">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-sm">
          {isSignup ? 'Already have an account?' : 'No account?'}
          <button onClick={() => setIsSignup(!isSignup)} className="underline ml-1">
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}


