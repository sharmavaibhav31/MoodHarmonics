import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopNav from './components/TopNav.jsx';
import MiniPlayer from './components/MiniPlayer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Compose from './pages/Compose.jsx';
import Library from './pages/Library.jsx';
import Playlist from './pages/Playlist.jsx';
import { isAuthed } from './lib/auth.js';

export default function App() {
  const location = useLocation();
  const onLanding = location.pathname === '/';
  const onLogin = location.pathname === '/login';
  const [theme, setTheme] = useState(() => localStorage.getItem('mh_theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('mh_theme', theme);
  }, [theme]);

  const pageVariants = useMemo(() => ({
    initial: { opacity: 0, y: 8 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -8 },
  }), []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global gradient + aurora background covering full viewport */}
      <div className="fixed inset-0 -z-10 gradient-hero aurora" aria-hidden />
      <TopNav theme={theme} setTheme={setTheme} />

      <main className={`flex-1 ${onLanding ? 'p-0' : 'p-6'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/compose"
                element={
                  <ProtectedRoute isAuthed={isAuthed()}>
                    <Compose />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <ProtectedRoute isAuthed={isAuthed()}>
                    <Library />
                  </ProtectedRoute>
                }
              />
              <Route path="/playlist" element={<Playlist />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {!onLanding && !onLogin && <MiniPlayer />}
    </div>
  );
}

// Track cursor to update aurora CSS variables
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const mx = e.clientX - cx;
    const my = e.clientY - cy;
    document.documentElement.style.setProperty('--mx', `${mx}`);
    document.documentElement.style.setProperty('--my', `${my}`);
  }, { passive: true });
}


