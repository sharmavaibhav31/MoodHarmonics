import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Compose AI Music Effortlessly
        </motion.h1>
        <motion.p
          className="mt-6 text-lg opacity-90 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Generate tracks from text prompts, manage your library, and share your creations.
        </motion.p>
        <motion.div
          className="mt-10 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/compose" className="btn-primary h-12 px-6 text-base">Generate Music</Link>
          <Link to="/library" className="glass h-12 px-6 rounded-card flex items-center focus-ring">Explore Library</Link>
        </motion.div>
      </div>
    </section>
  );
}


