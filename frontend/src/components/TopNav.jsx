import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { logout, isAuthed } from '../lib/auth.js';
import { useMemo } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

export default function TopNav({ theme, setTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const authed = useMemo(() => isAuthed(), [location.key]);

  return (
    <header className="sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-semibold tracking-tight">🎵 AI-Based Music Composer</Link>
          <nav className="hidden md:flex items-center gap-4 ml-6 text-sm">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/compose">Compose</NavItem>
            <NavItem to="/library">Library</NavItem>
            <NavItem to="/playlist">Playlist</NavItem>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            className="glass rounded-card p-2 focus-ring"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          {!authed ? (
            <Link to="/login" className="btn-primary h-10 px-3 text-sm">Login / Signup</Link>
          ) : (
            <button
              className="glass rounded-card h-10 px-4 text-sm focus-ring"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }) {
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
      <Link to={to} className="px-3 py-2 rounded-card hover:bg-white/10 dark:hover:bg-white/5 focus-ring">
        {children}
      </Link>
    </motion.div>
  );
}


