# support-desk

Support-desk is a full-stack ticketing app built during the Sparta Education
Claude Engineering course. A Node/Express API persists ticket and user data
in PostgreSQL and enforces JWT-based authentication; a React (Vite) frontend
signs users in and displays only the tickets they're allowed to see.

## Stack

- **web/** — React + Vite frontend
- **server/** — Node + Express API
- **PostgreSQL** — persistent storage (`server/src/db.js`, via `pg`), schema
  managed with `node-pg-migrate` (`server/migrations/`)
- **Auth** — JWT bearer tokens (`jsonwebtoken`) + bcrypt password hashing
  (`bcryptjs`), see "Auth model" below

## Commands

**server/**
```
npm run dev         # node --watch src/index.js
npm start           # node src/index.js
npm run migrate:up  # apply DB migrations
npm run migrate:down
npm run seed        # seed demo users + tickets (server/src/scripts/seed.js)
npm run smoke       # self-contained auth/ticket smoke test suite (server/src/scripts/smoke-auth.js)
```

**web/**
```
npm run dev       # vite
npm run build     # vite build
npm run lint      # oxlint
npm run preview   # vite preview
```

**Smoke test** (starts the real Express app in-process on an ephemeral
port — no separately running server needed; requires the DB migrated and
seeded first):
```
cd server && npm run migrate:up && npm run seed && npm run smoke
```
For a quick manual check against a running server:
```
curl -s http://localhost:4000/api/health
```

## Auth model

- `POST /api/auth/register` and `POST /api/auth/login` return `{ user, token }`;
  `GET /api/auth/me` returns the current user for a valid token
  (`server/src/routes/auth.js`, `server/src/services/authService.js`).
- Tokens are signed/verified in `server/src/auth/tokens.js` (HS256, secret
  from the required `JWT_SECRET` env var — never hard-code or commit it).
- Passwords are hashed with bcrypt (`server/src/auth/passwords.js`).
- `requireAuth` middleware (`server/src/middleware/requireAuth.js`) reads
  `Authorization: Bearer <token>` and sets `req.user = { id }`; it's applied
  globally to `/api/tickets/*` in `server/src/routes/index.js` (health and
  auth routes stay public).
- The client stores the token in `localStorage` and exposes it via
  `AuthContext`/`useAuth()` (`web/src/auth/authContext.js`,
  `web/src/auth/AuthProvider.jsx`). Every protected API call takes the token
  as an explicit argument (`web/src/lib/api.js`) — never read from props or
  query strings, only from auth context.

## Error conventions

- Errors are a typed `AppError` (`server/src/errors/AppError.js`) with
  factories (`.notFound`, `.validation`, `.unauthenticated`, `.conflict`), a
  numeric HTTP status, and a machine-readable `code`.
- The global error handler (`server/src/middleware/errorHandler.js`) renders
  every `AppError` as `{"error": {"code": "...", "message": "..."}}` with the
  matching status; a malformed ticket id becomes 400 `VALIDATION`; anything
  uncaught becomes 500.
- A ticket that doesn't exist and one that exists but isn't yours (not the
  requester or assignee) both return the same 404 `NOT_FOUND` — never 403 —
  so the API never confirms whether an id is real (`server/src/services/ticketService.js`).
- The client's fetch helper (`web/src/lib/api.js`) throws a typed `ApiError`
  (status + message parsed from that same shape) on any non-ok response
  instead of returning it.

## Directory norms

- Routes: `server/src/routes/` (health, auth, tickets)
- Business logic: `server/src/services/`
- Data access (the only layer that talks to Postgres): `server/src/repositories/`
- Auth internals (JWT sign/verify, password hashing): `server/src/auth/`
- Errors: `server/src/errors/`
- Shared constants (status/priority values, error codes): `server/src/constants/`
- One-off scripts: `server/src/scripts/` (`seed.js`, `smoke-auth.js`)
- DB schema history: `server/migrations/` (`node-pg-migrate`)
- Client code: `web/src/`, with API calls centralized in `web/src/lib/api.js`
- Client auth: `web/src/auth/` (`authContext.js` for `AuthContext`/`useAuth`,
  `AuthProvider.jsx` for session state, `LoginForm.jsx`)

## Do not

- No unnecessary dependencies.
- No committing `node_modules`.
- No committing secrets — this now explicitly includes `JWT_SECRET` and any
  `.env` file; copy `server/.env.example` to `server/.env` locally instead.
- No storing or returning plaintext passwords or password hashes from any
  API response (see `server/src/repositories/userRepository.js`'s
  `SAFE_COLUMNS`).
- No 403 responses for tickets — existence must never be distinguishable
  from lack of access; use 404 for both.
