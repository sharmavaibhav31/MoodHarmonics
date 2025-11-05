import { useEffect, useState } from 'react';
import { generateMusic, fetchPlaylist, audioUrlFor } from '../lib/api.js';

const RANDOM_PROMPTS = [
  'Lo-fi chill beat with soft piano and rain ambience',
  'Energetic EDM track with punchy bass and bright synths',
  'Moody cinematic strings with slow build and percussion',
  'Indie pop vibe with guitar riffs and catchy hooks',
];

export default function Compose() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState(null);
  const [lyrics, setLyrics] = useState('');

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setEntry(null);
    setLyrics('');
    try {
      const res = await generateMusic(prompt.trim());
      const item = res?.entry || res; // backend returns entry
      if (item) {
        const audioUrl = item.filename ? audioUrlFor(item.filename) : item.audio_url;
        const normalized = { ...item, audio_url: audioUrl, title: item.title || item.prompt };
        setEntry(normalized);
        setLyrics(item.lyrics || '');
        window.dispatchEvent(new CustomEvent('mh:add-to-queue', { detail: normalized }));
        await fetchPlaylist().catch(()=>{});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function randomize() {
    setPrompt(RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Compose</h2>
        <p className="opacity-80 text-sm mt-1">Describe the music you want to generate.</p>
        <div className="mt-4">
          <textarea
            className="w-full h-32 p-4 rounded-card glass focus-ring"
            value={prompt}
            onChange={(e)=>setPrompt(e.target.value)}
            placeholder="A dreamy ambient pad with evolving textures..."
          />
        </div>
        <div className="mt-3 flex gap-3">
          <button onClick={handleGenerate} className="btn-primary h-11 px-6" disabled={loading}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button onClick={randomize} className="glass h-11 px-4 rounded-card focus-ring">Random prompt</button>
        </div>
      </div>

      {entry && (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="card p-5">
            <div className="text-lg font-semibold">Lyrics</div>
            <pre className="mt-3 whitespace-pre-wrap text-sm opacity-90">{lyrics || 'No lyrics returned.'}</pre>
          </div>
          <div className="card p-5">
            <div className="text-lg font-semibold">Preview</div>
            <audio className="w-full mt-3" controls src={entry.audio_url} />
            <div className="mt-2 text-sm opacity-80 truncate">{entry.title}</div>
            <div className="mt-4">
              <a className="btn-primary px-4 h-10" href={entry.audio_url} download>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


