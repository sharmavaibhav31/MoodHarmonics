import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base URL for backend; prefer env at runtime. During dev, use proxy to Flask.
const BACKEND = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy backend endpoints to Flask during local development
      '/generate': {
        target: BACKEND,
        changeOrigin: true,
      },
      '/upload': {
        target: BACKEND,
        changeOrigin: true,
      },
      '/api': {
        target: BACKEND,
        changeOrigin: true,
      },
      '/download': {
        target: BACKEND,
        changeOrigin: true,
      },
      '/static': {
        target: BACKEND,
        changeOrigin: true,
      },
    },
  },
});


