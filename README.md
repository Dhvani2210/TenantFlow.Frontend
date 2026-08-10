# TenantFlow — Frontend

**React + TypeScript frontend for TenantFlow, a multi-tenant SaaS project management platform.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-build-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![SignalR](https://img.shields.io/badge/SignalR-real--time-informational)
![License](https://img.shields.io/badge/License-MIT-green)

<!-- Add a screenshot or short GIF here, e.g.: -->
<!-- ![TenantFlow Kanban board, dark mode](docs/screenshot-dark.png) -->

**[Live demo](https://tenantflow-dhvani.netlify.app)** · **[Backend repo](https://github.com/Dhvani2210/TenantFlow)**

> **Note on the live demo:** the backend API runs on Render's free tier, which spins down after 15 minutes of inactivity. The **first** request after idle time can take 30–60 seconds to wake back up — this is a hosting-tier limitation, not an application bug. Subsequent requests are fast.

## Overview

This is the frontend for [TenantFlow](https://github.com/Dhvani2210/TenantFlow) — a multi-tenant project management app with real-time task updates via SignalR. It connects to the ASP.NET Core backend API and is deployed on Netlify, with automatic redeploys on every push to `main`.

## Features

- **Kanban board** — tasks organised by status (Todo / In Progress / Done) with inline status changes
- **Real-time updates** — SignalR pushes task create/update/delete events to all connected users in the same tenant, no refresh needed
- **Search, filter, sort** — debounced text search, status filter, and due-date sort on the Kanban board; all filter state is URL-persisted via `useSearchParams` so filters survive refresh and URLs are shareable
- **Pagination** — Projects and Members pages paginate server-side; current page is URL-persisted
- **Multi-tenant auth** — JWT decoded on login; `TenantId` and `Role` extracted from claims and used throughout the app without extra API calls
- **Secure token storage** — access token kept in memory only; refresh token in an HttpOnly cookie, never exposed to JavaScript
- **Role-based UI** — Admin-only controls (invite member, delete member, create project) are conditionally rendered based on the decoded JWT role claim
- **Dark mode** — full dark mode via Tailwind CSS v4's class strategy, persisted to `localStorage`
- **Toast notifications** — non-blocking success/error feedback on create, update, and delete operations

## Tech Stack

- **React 19** with TypeScript
- **Vite** — build tooling
- **Tailwind CSS v4** — utility-first styling with dark mode support
- **React Router v7** — client-side routing, `useSearchParams` for URL-persisted filter state
- **Axios** — HTTP client with JWT interceptor
- **@microsoft/signalr** — real-time task updates via WebSocket connection to the backend hub

## Deployment

This app is deployed on **Netlify**, connected directly to this GitHub repo — every push to `main` triggers an automatic rebuild and redeploy.

**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`

**Environment variables** (set in the Netlify dashboard, not committed to the repo):
- `VITE_API_URL` — the live backend API URL ([https://tenantflow-8xgc.onrender.com](https://tenantflow-8xgc.onrender.com))

> Vite bakes environment variables into the build at **build time**, not runtime. Changing `VITE_API_URL` in the Netlify dashboard has no effect until a new deploy is triggered afterward.

## Running locally

The frontend dev server expects the backend API running at `http://localhost:5253`.

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Running with Docker

The frontend is also part of the full Docker Compose stack, for local development against a fully containerized backend. From the backend repo root:

```bash
docker compose up
```

The React app is built at container build time and served via Nginx at `http://localhost:3000`.

## Project structure

<details>
<summary>Expand file tree</summary>

```
frontend/
├── .github/
│   └── workflows/
│       └── ci.yml        # Type-check + Vite build + Docker image build
├── public/               # Static assets (favicon)
├── src/
│   ├── api/              # Axios API clients (tasks, projects, users, auth)
│   ├── assets/           # SVG assets
│   ├── components/       # Reusable UI components (KanbanBoard, modals, Toast, Navbar, etc.)
│   ├── context/          # AuthContext — JWT decode, login/logout, isLoading guard
│   ├── hooks/            # useDebounce, useDarkMode, useTaskHub
│   ├── pages/            # Page-level components (Dashboard, ProjectBoard, Members, Login, Register)
│   ├── types/            # TypeScript interfaces (Task, Project, User, PagedResult, auth)
│   ├── App.tsx           # Route definitions
│   ├── App.css           # Global styles
│   ├── main.tsx          # React root — wraps app in AuthProvider
│   └── index.css         # Tailwind CSS v4 entry point
├── .dockerignore
├── .gitattributes
├── .gitignore
├── Dockerfile            # Multi-stage: Node build → Nginx serve
├── eslint.config.js
├── index.html            # Vite HTML entry point
├── nginx.conf            # SPA routing — try_files → index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

</details>

## Architecture notes

**JWT is decoded client-side on login** using `jwt-decode`. The decoded payload (`TenantId`, `Role`, `FullName`, `email`) is stored in React context via `useReducer` — no separate `/me` API call needed.

**Access token lives in memory, not localStorage** — a plain JS variable, cleared on every page reload. On app load, the app doesn't check for a stored token; it always calls `/api/auth/refresh`, which succeeds silently if the HttpOnly refresh cookie is still valid, or fails gracefully to the login page if not. An axios response interceptor catches `401`s from an expired access token, refreshes it transparently, and retries the original request — the user never sees a broken call mid-session.

**Auth redirect race condition** — `ProtectedRoute` checks `user === null` to decide whether to redirect to `/login`. On hard refresh, the `useEffect` that reads `localStorage` and rehydrates the token runs *after* the first render, so `user` is null on that render even for a logged-in user. Fixed by adding an `isLoading` state to `AuthContext` (initially `true`, flipped to `false` inside the effect) — `ProtectedRoute` waits for `isLoading: false` before checking `user`.

**SignalR stale closure bug** — `useTaskHub` registered event callbacks once on mount. When `tasks` state updated, the handlers in `ProjectBoardPage` closed over the new state, but SignalR kept calling the original captured callbacks with stale state — silently overwriting correct updates back to old data. Fixed using the "stable event handler ref" pattern: a `useRef` holds the latest options object and is updated on every render, while SignalR callbacks always call through the ref rather than closing over the original values directly. Verified working end-to-end on the deployed version across two separate browser tabs.

**URL as state** — filter/sort/pagination values live in the URL query string via `useSearchParams` rather than `useState`. This gives three things for free: filters survive page refresh, filtered URLs are shareable, and browser back/forward works correctly across filter changes.

**`assignedToUserName` not updating after task edit** — this one traced back to the backend, not the frontend. Full writeup is in the [backend README](https://github.com/Dhvani2210/TenantFlow#problems-solved); short version: EF Core wasn't refreshing a navigation property after a foreign key change, fixed with an explicit `LoadAsync()` reload after save. Confirmed via curl before touching any frontend code.

## Testing

No automated test suite yet — components and hooks were manually verified during development, and the full app has been verified end-to-end against the live deployed backend (registration, login, multi-tenant isolation, real-time updates). Adding React Testing Library coverage for `useTaskHub` and `AuthContext` (the two trickiest pieces of state logic) is next on the roadmap.

## License

Distributed under the MIT License. See `LICENSE` for details.