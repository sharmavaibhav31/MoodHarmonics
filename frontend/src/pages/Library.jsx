import { useEffect, useState } from 'react';
import { fetchPlaylist, audioUrlFor, uploadAudio } from '../lib/api.js';
import TileCard from '../components/TileCard.jsx';
import DarkVeil from '../components/DarkVeil.jsx';

export default function Library() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPlaylist();
      const list = Array.isArray(data) ? data : data?.playlist || [];
      const normalized = list.map((it) => ({
        ...it,
        audio_url: it.audio_url || audioUrlFor(it.filename),
        title: it.title || it.prompt,
        date: it.date || it.created_at || '',
      }));
      setItems(normalized);
    } catch (e) {
      console.error(e);
      setError('Failed to load library');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onPlay(item) {
    window.dispatchEvent(new CustomEvent('mh:add-to-queue', { detail: item }));
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAudio(file);
      await load();
    } catch (e) {
      console.error(e);
      setError('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      <div style={{ width: '100%', height: '600px', position: 'fixed', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 0 }}>
        <DarkVeil />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Your Library</h2>
        <label className="btn-primary h-10 px-4 cursor-pointer">
          {uploading ? 'Uploading…' : 'Upload Audio'}
          <input type="file" accept="audio/*" onChange={onUpload} className="hidden" />
        </label>
      </div>
      {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
      {loading ? (
        <div className="opacity-80">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <TileCard
              key={(item.filename || item.title || 'i') + idx}
              item={item}
              onPlay={onPlay}
              onLyrics={(it)=>alert(it.lyrics || 'No lyrics.')}
              onAddToPlaylist={()=>alert('Added to playlist (mock)')}
            />
          ))}
        </div>
      )}
    </div>
  );
}


