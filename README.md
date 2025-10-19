# CipherStudio

A browser-based React IDE that lets you create, edit, preview, and persist React projects — similar to CodeSandbox — with a Node/Express + MongoDB backend.

## Features
- **File Management:** Create, delete, rename files and folders in-memory (Sandpack-compatible paths).
- **Code Editor + Live Preview:** Sandpack (React template) renders changes instantly.
- **Auto Render:** Auto-generates an `App` that imports and renders your components. Toggle to use your own `/App.js`.
- **Save & Load Projects:** Save to backend (MongoDB) and localStorage. Load by `projectId`.
- **Auth (Backend):** Register/Login with JWT and bcrypt. `GET /api/auth/me` to verify session.
- **UI/UX:** Light/Dark theme, responsive layout, toasts for feedback, inline validation.

## Tech Stack
- **Frontend:** React, @codesandbox/sandpack-react
- **Backend:** Node.js, Express, MongoDB (Mongoose)

## Repository layout
```
./frontend/
  src/App.js
  src/components/FileManager.js
  src/styles.css
./backend/
  server.js
  models/Project.js
  models/User.js
  .env (not committed)
```

## Prerequisites
- Node.js 18+ (tested on Node 22)
- A MongoDB Atlas cluster (or self-hosted MongoDB)

## Backend setup
1. Go to `backend/` and install dependencies:
   ```bash
   npm install
   npm install bcryptjs jsonwebtoken
   ```
2. Create `.env` in `backend/`:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/cipherstudio?retryWrites=true&w=majority
   JWT_SECRET=<a_long_random_secret>
   PORT=5000
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   You should see: `✅ MongoDB connected` and `🚀 Server running on port 5000`.

### Backend API
- `POST /api/projects` Create project (optional; PUT also upserts)
- `GET /api/projects/:projectId` Load project
- `PUT /api/projects/:projectId` Upsert project
- `POST /api/auth/register` Body: `{ username, email, password }`
- `POST /api/auth/login` Body: `{ username|email, password }`
- `GET /api/auth/me` Header: `Authorization: Bearer <token>`

## Frontend setup
1. Go to `frontend/` and install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server (if using CRA/Vite) or open the host app as configured:
   ```bash
   npm start
   ```
3. Ensure backend is available at `http://localhost:5000`. The frontend calls absolute URLs. If deploying, update the API base as needed.

## Using CipherStudio
- **Files panel:**
  - Add a new file (e.g., `Header.js`). Components are generated in PascalCase with default export.
  - Rename files or folders using inline tools.
  - Toggle **Auto Render** to auto-generate `/App.js` that imports and renders components.
- **Project controls:**
  - Set a `projectId` and click **Load** to fetch from localStorage/backend.
  - Click **Save** to upsert to backend and cache to localStorage.
  - **Autosave** saves to localStorage on changes.
- **Auth:**
  - Open `Login`/`Register` from topbar.
  - Register requires `username`, `email`, `password`.
  - Login accepts `username or email` + `password`.
  - Success shows a toast and the topbar will greet you.

## Deployment
- **Backend:** Render/Railway/Heroku. Set `MONGO_URI` and `JWT_SECRET`. Expose port 5000.
- **Frontend:** Netlify/Vercel. If your API is hosted elsewhere, update the frontend to use that base URL.

## Notes
- LocalStorage project copy takes precedence during load for speed. Use a new `projectId` or clear the local copy to force a backend fetch.
- Case-sensitive paths in Sandpack: use consistent casing in imports and filenames.

## Roadmap / Ideas
- Resizable sidebar, drag-and-drop reordering
- In-editor code formatting, linting, and TypeScript support
- Shareable project links and GitHub OAuth
- One-click Deploy of the current project to Netlify/Vercel

## License
MIT
