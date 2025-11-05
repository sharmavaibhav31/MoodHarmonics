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

      {/* Feature cards section below the hero */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon="🎵" title="AI Music Generation" desc="Create unique songs tailored to your mood and preferences" />
          <FeatureCard icon="📝" title="Smart Lyrics" desc="Generate meaningful lyrics that match your musical vision" />
          <FeatureCard icon="📚" title="Personal Library" desc="Save and organize your creations in your music library" />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.35 }}
      className="card p-6 text-center"
    >
      <div className="text-3xl">{icon}</div>
      <div className="mt-3 text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm opacity-80">{desc}</p>
    </motion.div>
  );
}


