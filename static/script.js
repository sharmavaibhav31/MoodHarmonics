document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const cur = localStorage.getItem('theme') || 'dark';
  if (cur === 'light') { body.classList.remove('dark-theme'); body.classList.add('light-theme'); themeIcon && (themeIcon.textContent = '🌙'); }
  themeToggle?.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-theme');
    body.classList.toggle('dark-theme', !isDark);
    body.classList.toggle('light-theme', isDark);
    themeIcon && (themeIcon.textContent = isDark ? '🌙' : '☀️');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', (e)=>{
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
  }));
// // Route guard & landing CTA
// const isAuthed = () => localStorage.getItem('mh_auth') === '1';
// const protectedPaths = ['/dashboard', '/library', '/playlist'];
// if (protectedPaths.includes(location.pathname) && !isAuthed()) {
//   location.href = '/login';
// }
// document.getElementById('ctaStart')?.addEventListener('click', (e)=>{
//   e.preventDefault(); location.href = isAuthed()? '/dashboard' : '/login';
// });

// Login / Signup client-side validation (front-end only)
const loginForm = document.getElementById('loginForm');
const toggleSignup = document.getElementById('toggleSignup');
const signupExtra = document.getElementById('signupExtra');
const loginError = document.getElementById('loginError');
let isSignup = false;

toggleSignup?.addEventListener('click', (e)=>{
  e.preventDefault();
  isSignup = !isSignup;
  signupExtra?.classList.toggle('hidden', !isSignup);
  document.getElementById('loginSubmit').textContent = isSignup ? 'Create account' : 'Login';
});

loginForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  loginError.textContent = '';

  const email = document.getElementById('email').value.trim();
  const pwd = document.getElementById('password').value.trim();
  const conf = document.getElementById('confirm')?.value.trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    loginError.textContent = 'Enter a valid email address.';
    return;
  }
  if (!pwd || pwd.length < 6) {
    loginError.textContent = 'Password must be at least 6 characters.';
    return;
  }
  if (isSignup && pwd !== conf) {
    loginError.textContent = 'Passwords do not match.';
    return;
  }

  // ✅ Hardcoded login credentials for presentation
  if (!isSignup) {
    if (email === 'test@test.com' && pwd === 'test123') {
      localStorage.setItem('mh_auth', '1');
      window.location.href = '/dashboard';
    } else {
      loginError.textContent = 'Invalid credentials. Try test@test.com / test123';
    }
    return;
  }

  // Simulate signup success
  loginError.style.color = '#00d084';
  loginError.textContent = 'Account created! You can now log in.';
  signupExtra?.classList.add('hidden');
  isSignup = false;
  document.getElementById('loginSubmit').textContent = 'Login';
});

  // API helpers
  const getJSON = async (url) => (await fetch(url)).json();
  const postJSON = async (url, data) => (await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)})).json();

  // GENERATE (dashboard)
  const genBtn = document.getElementById('genBtn');
  genBtn?.addEventListener('click', async () => {
    const promptEl = document.getElementById('genPrompt');
    const statusEl = document.getElementById('genStatus');
    const box = document.getElementById('genResult');
    const lyricsBox = document.getElementById('lyricsBox');
    const audio = document.getElementById('audioPlayer');
    const prompt = promptEl.value.trim();
    if (!prompt) { alert('Please enter a prompt'); return; }
    genBtn.disabled = true; genBtn.textContent = 'Generating...'; statusEl.textContent = 'Working...';
    box.style.display = 'block';
    try{
      const data = await postJSON('/generate', { prompt });
      if (data.error) throw new Error(data.error);
      const entry = data.entry || data;
      if (entry.lyrics) lyricsBox.textContent = entry.lyrics;
      if (entry.filename) audio.src = `/static/music/${entry.filename}`;
      audio.load();
      // refresh lists
      await loadPlaylistAndLibrary();
    }catch(err){
      alert('Generate failed: ' + (err.message||err));
    } finally {
      genBtn.disabled = false; genBtn.textContent = 'Generate'; statusEl.textContent = '';
    }
  });
  document.getElementById('randBtn')?.addEventListener('click', ()=>{
    const samples=['cheerful synthwave for workout','romantic acoustic duet','lofi chill beats for study','epic orchestral space theme','melancholic piano with strings'];
    const p=samples[Math.floor(Math.random()*samples.length)];
    const promptEl=document.getElementById('genPrompt'); promptEl.value=p; promptEl.focus();
  });

  // UPLOAD (library)
  const uploadForm = document.getElementById('uploadFormLib');
  uploadForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const file = document.getElementById('uploadFileLib').files[0];
    const title = document.getElementById('uploadTitleLib').value;
    const lyrics = document.getElementById('uploadLyricsLib').value;
    const status = document.getElementById('uploadStatusLib');
    if (!file) { alert('Choose an audio file'); return; }
    const form = new FormData(); form.append('file', file); if (title) form.append('title', title); if (lyrics) form.append('lyrics', lyrics);
    status.textContent = 'Uploading...';
    try{
      const res = await fetch('/upload', { method:'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      status.textContent = 'Uploaded';
      await loadPlaylistAndLibrary();
      uploadForm.reset();
    }catch(err){ status.textContent = 'Error: ' + (err.message||err); }
    setTimeout(()=> status.textContent='', 3000);
  });

  // PLAYLIST + LIBRARY RENDER
  async function loadPlaylistAndLibrary(){
    try{
      showShimmers();
      const data = await getJSON('/api/playlist');
      const list = data.playlist || [];
      renderPlaylist(list);
      renderLibrary(list);
      window.__mhPlaylist = list;
    }catch(err){ console.error('playlist load failed', err); }
    finally{ hideShimmers(); }
  }

  function cardFromItem(item){
    const div = document.createElement('div'); div.className='tile';
    const cover = document.createElement('div'); cover.className='cover'; cover.textContent=(item.title||item.prompt||'S').slice(0,2).toUpperCase();
    const info = document.createElement('div'); info.className='info';
    const t = document.createElement('div'); t.className='title'; t.textContent=item.title||item.prompt||'Untitled';
    const s = document.createElement('div'); s.className='subtitle'; s.textContent=(item.created_at||'') + (item.genre? (' • '+item.genre):'');
    const ctr = document.createElement('div'); ctr.className='controls';
    const play = document.createElement('button'); play.className='btn'; play.textContent='▶ Play';
    play.addEventListener('click', ()=>{
      const audio = new Audio(item.filename ? `/static/music/${item.filename}` : item.audio_file);
      audio.play();
      const lyricsPanel = document.getElementById('playlistLyrics'); if (lyricsPanel) lyricsPanel.textContent = item.lyrics||'No lyrics.';
    });
    const lyricsBtn = document.createElement('button'); lyricsBtn.className='btn'; lyricsBtn.textContent='Lyrics'; lyricsBtn.addEventListener('click',()=>{
      const lyricsPanel = document.getElementById('playlistLyrics'); if (lyricsPanel) lyricsPanel.textContent = item.lyrics||'No lyrics.';
    });
    const dl = document.createElement('a'); dl.className='btn'; dl.textContent='Download'; if (item.filename) { dl.href=`/static/music/${item.filename}`; dl.setAttribute('download',''); } else { dl.href='#'; dl.addEventListener('click', e=>{ e.preventDefault(); alert('No downloadable file');}); }
    ctr.append(play, lyricsBtn, dl);
    info.append(t,s,ctr); div.append(cover, info); return div;
  }

  // Playlist filters
  let filterText = '';
  let sortMode = 'new';
  document.getElementById('playlistSearch')?.addEventListener('input', (e)=>{ filterText = e.target.value.toLowerCase(); renderPlaylist(window.__mhPlaylist||[]); });
  document.getElementById('playlistSort')?.addEventListener('change', (e)=>{ sortMode = e.target.value; renderPlaylist(window.__mhPlaylist||[]); });
  document.getElementById('shuffleBtn')?.addEventListener('click', ()=>{ const l=[...(window.__mhPlaylist||[])]; for(let i=l.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [l[i],l[j]]=[l[j],l[i]];} renderPlaylist(l); });

  function renderPlaylist(list){
    const grid = document.getElementById('playlistGrid'); if (!grid) return;
    let view = list.filter(i => !filterText || (i.title||i.prompt||'').toLowerCase().includes(filterText));
    if (sortMode==='title') view.sort((a,b)=> (a.title||a.prompt||'').localeCompare(b.title||b.prompt||''));
    if (sortMode==='genre') view.sort((a,b)=> (a.genre||'').localeCompare(b.genre||''));
    grid.innerHTML=''; view.forEach(item => grid.appendChild(cardFromItem(item)));
  }
  function renderLibrary(list){
    const container = document.getElementById('libraryGrid'); if (!container) return;
    const genres = {};
    list.forEach(i=>{ const g=i.genre||'uncategorized'; (genres[g]=genres[g]||[]).push(i); });
    container.innerHTML='';
    Object.keys(genres).sort().forEach(g=>{
      const sec=document.createElement('div'); sec.className='genre-group';
      const h=document.createElement('h2'); h.className='genre-title'; h.textContent=g;
      const grid=document.createElement('div'); grid.className='songs-grid';
      genres[g].forEach(i=> grid.appendChild(cardFromItem(i)) );
      sec.append(h,grid); container.appendChild(sec);
    });
  }

  // initial load where appropriate
  if (document.getElementById('playlistGrid') || document.getElementById('libraryGrid')) loadPlaylistAndLibrary();

  // Shimmer helpers
  function showShimmers(){
    const pg=document.getElementById('playlistGrid');
    const lg=document.getElementById('libraryGrid');
    if (pg){ pg.innerHTML=''; for(let i=0;i<3;i++){ const s=document.createElement('div'); s.className='skeleton'; s.style.height='120px'; pg.appendChild(s);} }
    if (lg){ lg.innerHTML=''; for(let i=0;i<3;i++){ const s=document.createElement('div'); s.className='skeleton'; s.style.height='120px'; lg.appendChild(s);} }
  }
  function hideShimmers(){
    // no-op; real contents overwrite skeletons
  }

  // Mini-player wiring
  const mp = {
    audio: document.getElementById('mpAudio'),
    title: document.getElementById('mpTitle'),
    sub: document.getElementById('mpSub'),
    art: document.getElementById('mpArt'),
    fill: document.getElementById('mpFill'),
    cur: document.getElementById('mpCur'),
    dur: document.getElementById('mpDur'),
    prev: document.getElementById('mpPrev'),
    next: document.getElementById('mpNext'),
    toggle: document.getElementById('mpToggle'),
    queue: [], index: -1
  };

  function startMini(item){
    if (!mp.audio) return;
    mp.title.textContent = item.title || item.prompt || 'Untitled';
    mp.sub.textContent = (item.created_at||'') + (item.genre? (' • '+item.genre):'');
    mp.art.style.background = genreGradient(item.genre);
    mp.audio.src = item.filename ? `/static/music/${item.filename}` : item.audio_file;
    mp.audio.play();
    setPlayIcon(false);
  }

  mp.audio?.addEventListener('timeupdate', ()=>{
    if (!mp.audio || !mp.audio.duration) return;
    mp.fill.style.width = (mp.audio.currentTime / mp.audio.duration * 100) + '%';
    mp.cur.textContent = formatTime(mp.audio.currentTime);
    mp.dur.textContent = formatTime(mp.audio.duration);
  });
  mp.toggle?.addEventListener('click', ()=>{ if (mp.audio.paused) { mp.audio.play(); setPlayIcon(false); } else { mp.audio.pause(); setPlayIcon(true); } });
  mp.next?.addEventListener('click', ()=>{ if (!mp.queue.length) return; mp.index=(mp.index+1)%mp.queue.length; startMini(mp.queue[mp.index]); });
  mp.prev?.addEventListener('click', ()=>{ if (!mp.queue.length) return; mp.index=(mp.index-1+mp.queue.length)%mp.queue.length; startMini(mp.queue[mp.index]); });
  document.getElementById('mpBar')?.addEventListener('click', (e)=>{
    if (!mp.audio || !mp.audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    mp.audio.currentTime = Math.max(0, Math.min(mp.audio.duration * pct, mp.audio.duration));
  });
  function setPlayIcon(showPlay){
    const el = document.getElementById('mpPlayIcon');
    if (!el) return;
    el.innerHTML = showPlay ? '<path d="M8 5v14l11-7-11-7z" fill="currentColor"/>' : '<rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="13" y="5" width="4" height="14" rx="1" fill="currentColor"/>';
  }

  function formatTime(s){ const m=Math.floor(s/60)||0; const ss=Math.floor(s%60)||0; return m+":"+(ss<10?"0":"")+ss }
  function genreGradient(g){
    const gg=(g||'vibe').toLowerCase();
    const map={ jazz:'linear-gradient(135deg,#9b5cff,#3b82f6)', classical:'linear-gradient(135deg,#f59e0b,#facc15)', pop:'linear-gradient(135deg,#ff4d9d,#ff8ad8)', country:'linear-gradient(135deg,#22d3ee,#14b8a6)', rock:'linear-gradient(135deg,#f43f5e,#a855f7)' };
    return map[gg]||'linear-gradient(135deg,#0f172a,#1e293b)';
  }

  // Make card Play button use mini-player & queue
  function cardFromItem(item){
    const div = document.createElement('div'); div.className='tile';
    div.dataset.file = item.filename || '';
    const cover = document.createElement('div'); cover.className='cover'; cover.style.background=genreGradient(item.genre);
    cover.textContent=(item.title||item.prompt||'S').slice(0,2).toUpperCase();
    const info = document.createElement('div'); info.className='info';
    const t = document.createElement('div'); t.className='title'; t.textContent=item.title||item.prompt||'Untitled';
    const s = document.createElement('div'); s.className='subtitle'; s.textContent=(item.created_at||'') + (item.genre? (' • '+item.genre):'');
    const ctr = document.createElement('div'); ctr.className='controls';
    const play = document.createElement('button'); play.className='btn'; play.textContent='▶ Play';
    play.addEventListener('click', ()=>{ mp.queue = window.__mhPlaylist||[]; mp.index = mp.queue.findIndex(x => x.filename===item.filename); startMini(item); highlightActiveTile(item); scrollActiveIntoView(); const p=document.getElementById('playlistLyrics'); if(p) p.textContent=item.lyrics||'No lyrics.'; });
    const lyricsBtn = document.createElement('button'); lyricsBtn.className='btn'; lyricsBtn.textContent='Lyrics'; lyricsBtn.addEventListener('click',()=>{ const p=document.getElementById('playlistLyrics'); if(p) p.textContent=item.lyrics||'No lyrics.'; });
    const dl = document.createElement('a'); dl.className='btn'; dl.textContent='Download'; if (item.filename) { dl.href=`/static/music/${item.filename}`; dl.setAttribute('download',''); }
    ctr.append(play, lyricsBtn, dl);
    info.append(t,s,ctr); div.append(cover, info); return div;
  }

  function highlightActiveTile(item){
    document.querySelectorAll('.tile').forEach(el => el.classList.remove('playing'));
    const active = document.querySelector(`.tile[data-file="${CSS.escape(item.filename||'')}"]`);
    if (active) active.classList.add('playing');
  }
  function scrollActiveIntoView(){
    const active = document.querySelector('.tile.playing');
    if (active) active.scrollIntoView({behavior:'smooth', block:'nearest'});
  }
});
