import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiX } from 'react-icons/fi';
import { getPlaceholderCover } from '../lib/placeholders.js';

export default function MiniPlayer({ activeGeneration }) {
  const [queue, setQueue] = useState(() => {
    const stored = localStorage.getItem('mh_queue');
    return stored ? JSON.parse(stored) : [];
  });
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef(null);

  const current = queue[index];
  const duration = audioRef.current?.duration || 0;

  useEffect(() => {
    localStorage.setItem('mh_queue', JSON.stringify(queue));
  }, [queue]);

  // Allow other components to push tracks via a custom event
  useEffect(() => {
    function onAddToQueue(e) {
      const entry = e.detail;
      if (!entry) return;
      setQueue((q) => {
        const next = [...q, entry];
        if (q.length === 0) setIndex(0);
        return next;
      });
      setIsPlaying(true);
      setDismissed(false);
    }
    function onPlayNow(e) {
      const entry = e.detail;
      if (!entry) return;
      setQueue([entry]);
      setIndex(0);
      setIsPlaying(true);
      setDismissed(false);
    }
    window.addEventListener('mh:add-to-queue', onAddToQueue);
    window.addEventListener('mh:play-now', onPlayNow);
    return () => {
      window.removeEventListener('mh:add-to-queue', onAddToQueue);
      window.removeEventListener('mh:play-now', onPlayNow);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, current?.audio_url]);

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
    setIsPlaying(true);
  }
  function next() {
    setIndex((i) => Math.min(queue.length - 1, i + 1));
    setIsPlaying(true);
  }

  const handleDismiss = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setDismissed(true);
  };

  if (activeGeneration) {
    return <GenerationInProgressCard generation={activeGeneration} />;
  }

  if (!current || dismissed) return null;

  return (
    <div className="sticky bottom-0 z-40">
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="card p-4 flex items-center gap-4 relative">
          <button
            aria-label="Hide mini player"
            className="absolute top-2 right-2 glass rounded-full p-1.5 focus-ring"
            onClick={handleDismiss}
          >
            <FiX />
          </button>
          <img src={current.cover || getPlaceholderCover(current.filename || current.title || 'mh')} alt="cover" className="w-12 h-12 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{current.title || current.prompt || 'Untitled'}</div>
            <div className="text-xs opacity-70 truncate">{current.genre || 'Unknown'} • {current.date || ''}</div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 via-blue-500 to-fuchsia-500" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton label="Previous" onClick={prev}><FiSkipBack /></IconButton>
            <IconButton label={isPlaying ? 'Pause' : 'Play'} onClick={() => setIsPlaying((p) => !p)}>
              {isPlaying ? <FiPause /> : <FiPlay />}
            </IconButton>
            <IconButton label="Next" onClick={next}><FiSkipForward /></IconButton>
          </div>
          <audio
            ref={audioRef}
            src={current.audio_url}
            onTimeUpdate={(e) => {
              const t = e.currentTarget;
              if (t.duration) setProgress(t.currentTime / t.duration);
            }}
            onEnded={next}
          />
        </div>
      </div>
    </div>
  );
}

function GenerationInProgressCard({ generation }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId;
    const tick = () => {
      const elapsed = (Date.now() - generation.startedAt) / 1000;
      const target = Math.min(0.9, 1 - Math.exp(-elapsed / 4));
      setProgress(target);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [generation.startedAt]);

  return (
    <div className="sticky bottom-0 z-40">
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="card p-4 flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-md bg-gray-700 animate-pulse" />
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">Generation in progress...</div>
            <div className="text-xs opacity-70 truncate">{generation.prompt}</div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-blue-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function IconButton({ children, onClick, label }) {
  return (
    <button
      aria-label={label}
      className="glass rounded-full p-2 focus-ring"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
