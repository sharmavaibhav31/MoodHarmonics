const COVERS = [
  // music gear / abstract
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop', // headphones
  'https://images.unsplash.com/photo-1513351105270-0f8f7c2b6d51?q=80&w=1200&auto=format&fit=crop', // vinyl
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345e?q=80&w=1200&auto=format&fit=crop', // guitar
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop', // piano
  'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop', // synth
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop', // speaker
  'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=1200&auto=format&fit=crop', // concert crowd
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop', // stage lights
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop', // gear close
  // color/abstract textures
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', // purple gradient
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop', // neon abstract
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&auto=format&fit=crop', // wave pattern
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop', // bokeh lights
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop', // gradient grid
  // instruments/scenes
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop', // piano keys
  'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop', // synth rack
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop', // guitar amp
  'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop', // modular
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop', // phones again (varied crop ok)
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function getPlaceholderCover(key = '') {
  const idx = hashString(String(key)) % COVERS.length;
  return COVERS[idx];
}

export function getRandomCover() {
  const idx = Math.floor(Math.random() * COVERS.length);
  return COVERS[idx];
}

export function attachCover(entry, fallbackKey) {
  if (!entry) return entry;
  if (entry.cover) return entry;
  const key = fallbackKey || entry.filename || entry.title || entry.prompt || entry.id || Date.now();
  return { ...entry, cover: getPlaceholderCover(key) };
}


