const COVERS = [
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop', // headphones
  'https://images.unsplash.com/photo-1513351105270-0f8f7c2b6d51?q=80&w=800&auto=format&fit=crop', // vinyl
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345e?q=80&w=800&auto=format&fit=crop', // guitar
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop', // piano
  'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=800&auto=format&fit=crop', // synth
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop', // speaker
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


