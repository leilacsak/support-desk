---
description: "Summarize the Support Desk project structure and run steps"
argument-hint: "Use when you need a concise current-state overview of the app"
agent: "agent"
---

Create a concise current-state overview for the Support Desk project.

Include:
- The application structure: `web/` is the React + Vite frontend, and `server/` is the Node + Express API.
- The role of each app in the client-server flow.
- How to run the project locally:
  - install dependencies in both `server/` and `web/`
  - start the backend with `npm run dev` from `server/`
  - start the frontend with `npm run dev` from `web/`
  - note that the API runs on `http://localhost:4000` and the frontend uses the `/api` proxy
- Current project notes: ticket data is in memory, API responses are JSON, and there is no database or authentication yet.

Keep the output short, practical, and suitable for a README-style summary.
