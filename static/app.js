// static/app.js
document.addEventListener("DOMContentLoaded", () => {
  // Tabs
  const tabs = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".tab-section");
  const underline = document.querySelector('.tab-active-underline');
  tabs.forEach(t => t.addEventListener("click", () => {
    const target = t.dataset.target;
    tabs.forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    sections.forEach(s => s.classList.toggle("active", s.id === target));
    // focus prompt when switching to generate
    if (target === "generate") {
      document.getElementById("genPrompt")?.focus();
    }
    // move animated underline
    if (underline) {
      const rect = t.getBoundingClientRect();
      const parentRect = t.parentElement.getBoundingClientRect();
      underline.style.width = rect.width + 'px';
      underline.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }
  }));
  // default first tab
  tabs[0].classList.add("active");
  // initialize underline position
  setTimeout(()=>{
    const active = document.querySelector('.tab-btn.active');
    if (active && underline) {
      const rect = active.getBoundingClientRect();
      const parentRect = active.parentElement.getBoundingClientRect();
      underline.style.width = rect.width + 'px';
      underline.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }
  }, 0);

  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    const root = document.documentElement;
    const cur = document.body.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("mh_theme", next);
  });
  const savedTheme = localStorage.getItem("mh_theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);

  // Random prompts
  const randBtn = document.getElementById("randBtn");
  const prompts = [
    "a cheerful synthwave tune for workout",
    "a romantic acoustic guitar melody",
    "lofi chill beats for studying",
    "epic orchestral soundtrack for space adventure",
    "melancholic piano tune with strings"
  ];
  randBtn?.addEventListener("click", () => {
    const p = prompts[Math.floor(Math.random() * prompts.length)];
    document.getElementById("genPrompt").value = p;
  });

  // Generation
  document.getElementById("genBtn")?.addEventListener("click", async () => {
    const btn = document.getElementById("genBtn");
    const status = document.getElementById("genStatus");
    const prompt = document.getElementById("genPrompt").value.trim();
    if (!prompt) { alert("Enter a prompt"); return; }
    btn.disabled = true; btn.innerText = "Generating...";
    status.innerText = "This may take 30-60s (first run longer)...";
    const genResult = document.getElementById('genResult');
    genResult?.classList.remove('hidden');
    genResult.innerHTML = '<div class="shimmer" style="height:120px; border-radius:10px"></div>';

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({prompt})
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // show tile in genResult and refresh playlist
      appendTileToGrid(data.entry || data.entry, "genResult"); // data.entry for new app.py
      await loadPlaylist(); // refresh playlist
    } catch (err) {
      alert("Error: " + (err.message || err));
    } finally {
      btn.disabled = false; btn.innerText = "Generate";
      status.innerText = "";
    }
  });

  // Upload handling
  document.getElementById("uploadForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("uploadFile");
    const title = document.getElementById("uploadTitle").value;
    const lyrics = document.getElementById("uploadLyrics").value;
    if (!fileInput.files.length) { alert("Choose an audio file"); return; }
    const form = new FormData();
    form.append("file", fileInput.files[0]);
    if (title) form.append("title", title);
    if (lyrics) form.append("lyrics", lyrics);
    const status = document.getElementById("uploadStatus");
    status.innerText = "Uploading & classifying...";
    try {
      const res = await fetch("/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await loadPlaylist();
      status.innerText = "Uploaded.";
      fileInput.value = ""; document.getElementById("uploadTitle").value = ""; document.getElementById("uploadLyrics").value="";
    } catch (err) {
      status.innerText = "Error: " + err.message;
    }
    setTimeout(()=> status.innerText = "", 3000);
  });

  // Playlist load & rendering
  async function loadPlaylist() {
    const res = await fetch("/api/playlist");
    const data = await res.json();
    const list = data.playlist || [];
    const grid = document.getElementById("playlistGrid");
    if (grid) {
      grid.innerHTML = "";
    }
    list.forEach(item => {
      grid?.appendChild(createTile(item));
    });
    // also populate library grouped by genre
    renderLibrary(list);
    renderPlaylistFilters(list);
    window.__mhPlaylist = list;
  }

  function renderLibrary(list) {
    const genres = {};
    list.forEach(s => {
      const g = s.genre || "uncategorized";
      if (!genres[g]) genres[g] = [];
      genres[g].push(s);
    });
    const lib = document.getElementById("libraryGrid");
    lib.innerHTML = "";
    Object.keys(genres).forEach(genre => {
      const section = document.createElement("div");
      section.innerHTML = `<h3 style="margin-top:18px">${genre} (${genres[genre].length})</h3>`;
      const row = document.createElement("div");
      row.className = "grid";
      genres[genre].forEach(s => row.appendChild(createTile(s)));
      section.appendChild(row);
      lib.appendChild(section);
    });
  }

  function renderPlaylistFilters(list) {
    const filters = document.getElementById('playlistFilters');
    if (!filters) return;
    const genres = Array.from(new Set(list.map(s => s.genre || 'uncategorized')));
    filters.innerHTML = '';
    const make = (label, value) => {
      const b = document.createElement('button'); b.className = 'filter-pill'; b.textContent = label;
      b.addEventListener('click', () => {
        [...filters.children].forEach(c=>c.classList.remove('active')); b.classList.add('active');
        const grid = document.getElementById('playlistGrid');
        if (!grid) return;
        grid.innerHTML = '';
        (window.__mhPlaylist||[]).filter(x => !value || (x.genre||'uncategorized') === value).forEach(item => {
          grid.appendChild(createTile(item));
        });
      });
      return b;
    };
    const allBtn = make('All', null); allBtn.classList.add('active'); filters.appendChild(allBtn);
    genres.forEach(g => filters.appendChild(make(g, g)));
  }

  function createTile(item) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.style.setProperty('--tile-grad', genreToGradient(item.genre || 'vibe'));
    const cover = document.createElement("div"); cover.className = "cover";
    cover.textContent = (item.title || item.prompt || "Song").slice(0,2).toUpperCase();
    const info = document.createElement("div"); info.className = "info";
    const title = document.createElement("div"); title.className = "title"; title.textContent = item.title || item.prompt || "Untitled";
    const sub = document.createElement("div"); sub.className = "subtitle"; sub.textContent = item.created_at + " • " + (item.genre || "unknown");
    const controls = document.createElement("div"); controls.className = "controls";
    const play = document.createElement("button"); play.className = "btn"; play.textContent = "▶ Play";
    play.addEventListener("click", () => startNowPlaying(item, tile));
    const lyricsBtn = document.createElement("button"); lyricsBtn.className="btn"; lyricsBtn.textContent="Lyrics";
    lyricsBtn.addEventListener("click", () => {
      document.getElementById("modalTitle").innerText = item.title || item.prompt || "Lyrics";
      document.getElementById("modalLyrics").innerText = item.lyrics || "No lyrics available.";
      document.getElementById("lyricsModal").classList.remove("hidden");
    });
    const download = document.createElement("a"); download.className="btn"; download.textContent="Download";
    download.href = "/static/music/" + item.filename; download.setAttribute("download", "");
    const badge = document.createElement("span"); badge.className="badge"; badge.textContent = item.genre || "unknown";
    controls.appendChild(play); controls.appendChild(lyricsBtn); controls.appendChild(download); controls.appendChild(badge);

    // small waveform next to title
    const wave = document.createElement('span'); wave.className = 'wave';
    for (let i=0;i<5;i++){ const b=document.createElement('span'); b.className='wave-bar'; wave.appendChild(b); }
    title.appendChild(wave);

    info.appendChild(title); info.appendChild(sub); info.appendChild(controls);
    tile.appendChild(cover); tile.appendChild(info);
    return tile;
  }

  // helper to append when generate API returns entry (older code compatibility)
  function appendTileToGrid(entry, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const tile = createTile(entry);
    grid.classList.remove("hidden");
    grid.insertBefore(tile, grid.firstChild);
  }

  // lyrics modal close
  document.getElementById("closeLyrics")?.addEventListener("click", () => {
    document.getElementById("lyricsModal").classList.add("hidden");
  });

  // Now Playing mini-player
  const np = {
    bar: document.getElementById('nowPlaying'),
    audio: document.getElementById('npAudio'),
    title: document.querySelector('.np-title'),
    subtitle: document.querySelector('.np-subtitle'),
    cover: document.querySelector('.np-cover'),
    fill: document.querySelector('.np-fill'),
    toggle: document.getElementById('npToggle'),
    next: document.getElementById('npNext'),
    prev: document.getElementById('npPrev'),
    queue: [],
    index: -1,
    currentTile: null
  };

  function startNowPlaying(item, tileEl) {
    if (!np.bar) return;
    // update meta
    np.title.textContent = item.title || item.prompt || 'Untitled';
    np.subtitle.textContent = item.created_at + ' • ' + (item.genre || 'unknown');
    np.cover.textContent = (item.title || item.prompt || 'S').slice(0,2).toUpperCase();
    // audio
    const src = item.filename ? ('/static/music/' + item.filename) : item.audio_file;
    np.audio.src = src;
    np.audio.play();
    np.bar.classList.remove('hidden');
    // queue management
    np.queue = (window.__mhPlaylist || []);
    np.index = np.queue.findIndex(s => s.filename === item.filename);
    // waveform state per tile
    if (np.currentTile) np.currentTile.classList.remove('playing');
    if (tileEl) { np.currentTile = tileEl; tileEl.classList.add('playing'); }
  }

  np?.audio?.addEventListener('timeupdate', () => {
    if (!np.audio.duration) return;
    const pct = (np.audio.currentTime / np.audio.duration) * 100;
    np.fill.style.width = pct + '%';
  });
  np?.audio?.addEventListener('pause', () => { if (np.currentTile) np.currentTile.classList.remove('playing'); });
  np?.audio?.addEventListener('play', () => { if (np.currentTile) np.currentTile.classList.add('playing'); });
  np?.toggle?.addEventListener('click', () => {
    if (np.audio.paused) np.audio.play(); else np.audio.pause();
  });
  np?.next?.addEventListener('click', () => {
    if (np.queue.length < 1) return;
    np.index = (np.index + 1) % np.queue.length;
    // find corresponding tile to animate
    const nextItem = np.queue[np.index];
    const tile = [...document.querySelectorAll('.tile')].find(t => (t.querySelector('.title')?.textContent || '').trim().startsWith((nextItem.title || nextItem.prompt || 'Untitled').slice(0,10)));
    startNowPlaying(nextItem, tile);
  });
  np?.prev?.addEventListener('click', () => {
    if (np.queue.length < 1) return;
    np.index = (np.index - 1 + np.queue.length) % np.queue.length;
    const prevItem = np.queue[np.index];
    const tile = [...document.querySelectorAll('.tile')].find(t => (t.querySelector('.title')?.textContent || '').trim().startsWith((prevItem.title || prevItem.prompt || 'Untitled').slice(0,10)));
    startNowPlaying(prevItem, tile);
  });

  function genreToGradient(genre){
    const g = (genre||'vibe').toLowerCase();
    // simple hash -> hue
    let h=0; for(let i=0;i<g.length;i++){ h = (h*31 + g.charCodeAt(i)) % 360; }
    const h2 = (h+40)%360; const a1 = 0.22, a2 = 0.16;
    return `radial-gradient(500px 200px at 20% 0%, hsla(${h},80%,55%,${a1}), transparent 60%), radial-gradient(500px 200px at 80% 100%, hsla(${h2},80%,60%,${a2}), transparent 60%)`;
  }

  // load playlist initially
  loadPlaylist();
});
