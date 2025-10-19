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
- `GET /` Health text
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
2. Configure API base (Render URL):
   - `frontend/src/App.js` uses `REACT_APP_API_BASE` falling back to `http://localhost:5000`.
   - For local dev against Render:
     ```bash
     # PowerShell
     $env:REACT_APP_API_BASE="https://cipherstudio.onrender.com"; npm start
     ```
3. Start locally:
   ```bash
   npm start
   ```

## Deployments
- **Backend (Render):** Create Web Service with root `backend/`, Build `npm install`, Start `node server.js`, set `MONGO_URI` and `JWT_SECRET` env vars.
- **Frontend (Vercel):** Root `frontend/`, Build `npm run build`, Output `build`, set env `REACT_APP_API_BASE=https://cipherstudio.onrender.com`.

## Using CipherStudio
- **Files panel:** Add, rename, delete files; optional folder rename.
- **Auto Render:** Toggle to auto-generate imports for components in a generated `/App.js`.
- **Projects:** Set a `projectId`, Load, Save. LocalStorage copy may take precedence.
- **Auth:** Register (username, email, password). Login (username/email + password). Success toasts appear.

## Notes
- Restrict CORS in production if desired.
- Clear localStorage key `cipher:project:<id>` to force backend fetch.

## License
MIT
