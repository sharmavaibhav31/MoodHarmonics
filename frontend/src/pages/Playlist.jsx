import { useEffect, useState } from 'react';
import { fetchPlaylist, audioUrlFor } from '../lib/api.js';
import TileCard from '../components/TileCard.jsx';

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
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Playlist</h2>
      {loading ? (
        <div className="opacity-80">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <TileCard
              key={(item.filename || item.title || 'p') + idx}
              item={item}
              onPlay={onPlay}
              onLyrics={(it)=>alert(it.lyrics || 'No lyrics.')}
              onAddToPlaylist={()=>alert('Already in playlist (mock)')}
            />
          ))}
        </div>
      )}
    </div>
  );
}


