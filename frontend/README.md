# Music Hub Frontend (React + Vite)

This is the React single-page app for the Music Hub project. It talks to the existing Flask backend and uses Tailwind + Framer Motion for a modern, animated UI.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Configuration

- API base URL (default): `http://127.0.0.1:5000`
- You can override by setting an env var when running:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000 npm run dev
```

The app also uses a Vite dev proxy so paths like `/generate`, `/upload`, `/api`, `/download`, `/static` are proxied to the Flask server during development.

## Routes

- `/` Landing page
- `/login` Login (mocked: test@test.com / test123)
- `/compose` Protected: generate music via POST /generate
- `/library` Protected: uploads + generated songs grid
- `/playlist` Public: renders playlist

## Auth (mocked)

- Login with test@test.com / test123 to set `localStorage.mh_auth = '1'`
- Logout clears the flag

## Dev Notes

- Flask continues to serve audio files at `/static/music/<filename>`; the frontend links to them directly.
- During local dev, the Vite proxy forwards API routes to Flask. In production, set `VITE_API_BASE_URL` to your backend URL.
- Mini-player is visible on all pages except the landing page.
- Dark/Light theme toggle persists in `localStorage.mh_theme`.

## Build

```bash
npm run build
npm run preview
```

Deploy the `dist/` output behind any static host. Ensure the backend is reachable at the URL configured by `VITE_API_BASE_URL`.


