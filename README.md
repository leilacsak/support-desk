# Support Desk

Support Desk is a small full-stack ticketing application created during the Sparta Education Claude Engineering course.

The application consists of a React frontend and a Node.js/Express backend. The frontend communicates with the API to retrieve and display support ticket information.

The current version uses in-memory data and focuses on understanding the flow between the frontend and backend before adding a database or authentication.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Available Commands](#available-commands)
- [API Endpoints](#api-endpoints)
- [Notes](#notes)
- [Future Features](#future-features)
- [AI Usage](#ai-usage)
- [Credits](#credits)

## Features

### Ticket List

Users can view a list of support tickets retrieved from the backend API.

### Ticket Details

Users can select a ticket and view its details.

The detail view includes:

- Ticket subject
- Ticket status
- Loading feedback
- Error handling
- A Retry button
- A way to return to the ticket list

The application uses React state to switch between the list and detail views without reloading the page.

### Error Handling

The backend returns JSON error responses with the appropriate HTTP status code.

Example:

```json
{
  "error": "Ticket 99 not found"
}
```

The frontend handles unsuccessful requests and displays suitable feedback to the user.

## Technologies Used

### Languages

- JavaScript
- HTML5
- CSS3

### Frontend

- React
- Vite
- Fetch API

### Backend

- Node.js
- Express
- CORS
- dotenv

### Development Tools

- Git
- GitHub
- Visual Studio Code
- Claude Code

### Data

Ticket data is currently stored in an in-memory JavaScript array:

```text
server/src/data/tickets.js
```

### API Client

Frontend API calls are centralized in `web/src/lib/api.js`. It reads its base URL from `web/src/config.js`, which exposes `API_BASE` from the `VITE_API_BASE` environment variable (defaulting to an empty string, meaning requests go through the Vite dev proxy).

## Project Structure

```text
support-desk/
├── server/       # Node.js and Express backend
├── web/          # React and Vite frontend
├── specs/        # Feature specifications
├── package.json  # Root scripts for installing, running, and building both apps
├── CLAUDE.md     # Project instructions for Claude
└── README.md
```

## Requirements

- Node.js
- npm

## Setup

Clone the repository:

```bash
git clone <repository-url>
cd support-desk
```

Install dependencies for both apps from the repo root:

```bash
npm run install:all
```

This installs `server/` and `web/` dependencies in turn. Alternatively, install each app separately:

```bash
cd server
npm install

cd ../web
npm install
```

## Running the App

From the repo root, `npm run dev` starts both the API server and the frontend together (using `concurrently`), with output labelled `[server]` and `[web]`:

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to the backend. The proxy target is read from `VITE_API_PROXY_TARGET` (set in `web/.env`), defaulting to `http://localhost:4000` if unset.

You can also run each app on its own from the root:

```bash
npm run dev:server   # API server only
npm run dev:web      # frontend only
```

Or start each app directly from its own directory:

```bash
cd server && npm run dev
cd web && npm run dev
```

## Available Commands

### Root

```bash
npm run install:all   # install server and web dependencies
npm run dev           # run server and web together (concurrently)
npm run dev:server    # run the API server only
npm run dev:web       # run the frontend only
npm run build         # build the frontend (vite build)
npm start             # start the API server (node src/index.js)
```

### `server/`

```bash
npm run dev   # node --watch src/index.js
npm start     # node src/index.js
```

### `web/`

```bash
npm run dev     # vite
npm run build   # vite build
npm run lint    # oxlint
npm run preview # vite preview
```

## API Endpoints

All responses are JSON.

### Health

```http
GET /api/health
GET /api/ready
```

Example response:

```json
{ "status": "ok" }
```

### Tickets

```http
GET /api/tickets
GET /api/tickets/:id
```

The ticket list is in-memory and currently includes a few sample tickets.

## Notes

- There is no database yet.
- There is no authentication yet.
- The frontend uses relative `/api/...` requests.
- Errors follow the JSON shape `{ "error": "..." }`.

## Future Features

Possible future improvements include:

- PostgreSQL database integration
- User authentication
- Creating new tickets
- Editing existing tickets
- Updating ticket statuses
- Deleting tickets
- Assigning tickets to support agents
- Automated frontend and backend testing
- Production deployment

## AI Usage

Claude was used during development to support:

- Planning changes before implementation
- Explaining React and Express concepts
- Reviewing project structure
- Debugging errors
- Improving code organisation
- Creating and refining documentation

All suggested changes were reviewed before being added to the project.

## Credits

This project was created as part of the Sparta Education Claude Engineering course.
