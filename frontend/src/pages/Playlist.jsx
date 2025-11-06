import { useEffect, useMemo, useState } from 'react';
import { fetchPlaylist, audioUrlFor } from '../lib/api.js';
import TileCard from '../components/TileCard.jsx';
import DarkVeil from '../components/DarkVeil.jsx';

export default function Playlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPlaylist();
        const list = Array.isArray(data) ? data : data?.playlist || [];
        const normalized = list.map((it) => ({
          ...it,
          audio_url: it.audio_url || audioUrlFor(it.filename),
          title: it.title || it.prompt,
        }));
        setItems(normalized);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onPlay(item) {
    window.dispatchEvent(new CustomEvent('mh:add-to-queue', { detail: item }));
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 0 }}>
        <DarkVeil />
        <div
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(90,0,150,0.4), rgba(10,10,20,1))',
    zIndex: -1,
  }}
/>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Playlist</h2>
      {loading ? (
        <div className="opacity-80">Loading…</div>
      ) : (
        <GenreSections items={items} onPlay={onPlay} />)
      }
    </div>
  );
}

function GenreSections({ items, onPlay }) {
  const byGenre = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const g = (it.genre || 'Uncategorized').trim();
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(it);
    }
    return Array.from(map.entries()).sort(([a],[b]) => a.localeCompare(b));
  }, [items]);

  return (
    <div className="space-y-8">
      {byGenre.map(([genre, list]) => (
        <section key={genre}>
          <h3 className="text-lg font-semibold mb-3 opacity-90">{genre}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((item, idx) => (
              <TileCard
                key={(item.filename || item.title || genre) + idx}
                item={item}
                onPlay={onPlay}
                onLyrics={(it)=>alert(it.lyrics || 'No lyrics.')}
                onAddToPlaylist={()=>alert('Already in playlist (mock)')}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}


