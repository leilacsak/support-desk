# support-desk

Support-desk is a small ticketing app for Week 1 of the sparta-course project. A Node/Express API serves ticket data over HTTP, and a React (Vite) frontend fetches and displays the ticket list. The current focus is getting the client-server flow working end to end before adding persistence or auth.

## Stack

- **web/** — React + Vite frontend
- **server/** — Node + Express API
- In-memory data only (`server/src/data/tickets.js`) — no database in Week 1

## Commands

**server/**
```
npm run dev       # node --watch src/index.js
npm start         # node src/index.js
```

**web/**
```
npm run dev       # vite
npm run build     # vite build
npm run lint      # oxlint
npm run preview   # vite preview
```

**Smoke tests** (server running on http://localhost:4000)
```
curl -s http://localhost:4000/api/health
curl -s http://localhost:4000/api/tickets
```

## Code conventions

- Every API route returns JSON.
- Errors return `{"error": ""}` with the correct HTTP status code.
- The client calls relative `/api/...` paths (proxied by Vite), never absolute URLs.
- The client's fetch helper throws on a non-ok response instead of returning it.

## Directory norms

- Routes live in `server/src/routes/`.
- Data lives in `server/src/data/`.
- Client code lives in `web/src/`, with API calls centralized in `web/src/api.js`.

## Do not

- No database.
- No auth.
- No unmasked dependencies.
- No committing `node_modules`.
- No committing secrets.
