import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  // Clear logs for clarity in demos
  console.log('[API]', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API ERROR]', err?.response?.status, err?.message);
    return Promise.reject(err);
  }
);

export async function generateMusic(prompt) {
  const { data } = await api.post('/generate', { prompt });
  return data;
}

// For UI 'lyrics only' button, we reuse /generate and just consume the lyrics.
// Backend always saves an audio and playlist entry; the UI can choose not to enqueue.
export async function generateLyrics(prompt) {
  const { data } = await api.post('/generate', { prompt });
  return data;
}

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchPlaylist() {
  const { data } = await api.get('/api/playlist');
  return data;
}

export function audioUrlFor(filename) {
  // Works for both proxied dev and absolute API base
  if (!filename) return '';
  const path = `/static/music/${filename}`;
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path}`;
}


