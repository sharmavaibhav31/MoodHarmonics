import { useEffect, useState } from 'react';
import DarkVeil from '../components/DarkVeil.jsx';
import { generateMusic, fetchPlaylist, audioUrlFor, generateLyrics, uploadAudio } from '../lib/api.js';

const RANDOM_PROMPTS = [
  'Lo-fi chill beat with soft piano and rain ambience',
  'Energetic EDM track with punchy bass and bright synths',
  'Moody cinematic strings with slow build and percussion',
  'Indie pop vibe with guitar riffs and catchy hooks',
  'A soulful jazz track with a modern twist',
  'A cinematic score with an epic, orchestral feel',
  'Upbeat electronic house music with tropical influences',
  'A melancholy yet hopeful tone with a calming rhythm',
  'Dark and moody with a touch of mystery',
  'Joyful, uplifting, and energetic—perfect for a summer party',
  'Generate a retro-inspired synthwave track with a driving 80s-style bassline, shimmering analog synths, and pulsating beats. Add a bright, uplifting melody with a steady tempo to evoke a nostalgic yet futuristic vibe'
];

export default function Compose() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadGenre, setUploadGenre] = useState('');

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setEntry(null);
    setLyrics('');
    setProgress(0);

    const generationState = {
      taskId: `task_${Date.now()}`,
      prompt: prompt.trim(),
      startedAt: Date.now(),
      progress: 0,
    };
    localStorage.setItem('mh_active_generation', JSON.stringify(generationState));
    window.dispatchEvent(new CustomEvent('mh:generation-started', { detail: generationState }));


    let rafId;
    // Indeterminate-ish progress while backend works
    const startTime = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Ease towards 80% and hover there until completion
      const target = Math.min(0.8, 1 - Math.exp(-elapsed / 2));
      setProgress((p) => (p < target ? target : p));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
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
      cancelAnimationFrame(rafId);
      // Smoothly fill to 100% then reset
      setProgress(1);
      setLoading(false);
      setTimeout(() => setProgress(0), 600);
      localStorage.removeItem('mh_active_generation');
      window.dispatchEvent(new CustomEvent('mh:generation-finished'));
    }
  }

  async function handleGenerateLyrics() {
    if (!prompt.trim()) return;
    setLyricsLoading(true);
    try {
      const res = await generateLyrics(prompt.trim());
      const item = res?.entry || res;
      setLyrics(item?.lyrics || '');
      // Do not enqueue or refresh library here.
    } catch (e) {
      console.error(e);
    } finally {
      setLyricsLoading(false);
    }
  }

  function randomize() {
    setPrompt(RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]);
  }

  return (
    <div className="max-w-5xl mx-auto relative">
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
      <div className="card">
        <h2 className="text-3xl md:text-4xl font-semibold">Compose</h2>
        <p className="opacity-80 text-base mt-2">Describe the music you want to generate.</p>
        {/* Progress bar */}
        <div className={`mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden transition-opacity ${loading || progress > 0 ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!loading}>
          <div className="h-full bg-gradient-to-r from-teal-400 via-blue-500 to-fuchsia-500 transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="mt-4">
          <textarea
            className="w-full h-32 p-4 rounded-card glass focus-ring"
            value={prompt}
            onChange={(e)=>setPrompt(e.target.value)}
            placeholder="A dreamy ambient pad with evolving textures..."
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={handleGenerate} className="btn-primary h-12 px-7 text-base" disabled={loading}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button onClick={handleGenerateLyrics} className="glass h-12 px-6 rounded-card focus-ring text-base" disabled={lyricsLoading}>
            {lyricsLoading ? 'Lyrics…' : 'Generate Lyrics'}
          </button>
          <button onClick={randomize} className="glass h-12 px-6 rounded-card focus-ring text-base">Random prompt</button>
        </div>
      </div>

      {entry && (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <div className="text-2xl font-semibold">Lyrics</div>
            <pre className="mt-4 whitespace-pre-wrap text-base opacity-90 leading-relaxed">{lyrics || 'No lyrics returned.'}</pre>
          </div>
          <div className="card">
            <div className="text-2xl font-semibold">Preview</div>
            <audio className="w-full mt-4" controls src={entry.audio_url} />
            <div className="mt-3 text-base opacity-80 truncate">{entry.title}</div>
            <div className="mt-5">
              <a className="btn-primary px-5 h-12 text-base" href={entry.audio_url} download>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Upload section for genre prediction */}
      <div className="card mt-6">
        <h3 className="text-2xl font-semibold">Upload audio for genre prediction</h3>
        <p className="opacity-80 text-base mt-2">Select a local audio file. It will appear in Library and Playlist under its predicted genre.</p>
        <div className="mt-4 flex items-center gap-3">
          <label className="glass rounded-card h-12 px-6 cursor-pointer flex items-center focus-ring text-base">
            {uploading ? 'Uploading…' : 'Choose file'}
            <input type="file" accept="audio/*" className="hidden" onChange={async (e)=>{
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setUploadMsg('');
              setUploadGenre('');
              try {
                const userId = localStorage.getItem('mh_user_id');
                const res = await uploadAudio(file, userId);
                const genre = res?.entry?.genre || '';
                setUploadMsg('Uploaded successfully');
                if (genre) setUploadGenre(genre);
                await fetchPlaylist().catch(()=>{});
              } catch (err) {
                console.error(err);
                setUploadMsg('Upload failed');
              } finally {
                setUploading(false);
                e.target.value='';
              }
            }} />
          </label>
          <div className="text-base opacity-90">
            {uploadMsg && <span>{uploadMsg}</span>}
            {uploadGenre && <span className="ml-3">Predicted genre: <span className="font-semibold capitalize">{uploadGenre}</span></span>}
          </div>
        </div>
      </div>
    </div>
  );
}


