# Support Desk

Support Desk is a full-stack ticketing application created during the Sparta Education Claude Engineering course.

The application consists of a React frontend, a Node.js/Express backend, and a PostgreSQL database. Users can register, log in, and securely access the support tickets they are permitted to view.

The project was developed incrementally, starting with a simple in-memory API before introducing database persistence, migrations, authentication, authorization, service and repository layers, and automated smoke testing.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Available Commands](#available-commands)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database](#database)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [AI Usage](#ai-usage)
- [Future Improvements](#future-improvements)
- [Credits](#credits)

## Features

### Authentication

Users can:

- Register an account
- Log in with email and password
- Stay authenticated using a JWT access token
- Retrieve their current user information
- Log out from the frontend

Passwords are hashed using bcrypt and are never returned by the API.

### Ticket List

Authenticated users can view the support tickets they are permitted to access.

Ticket data is retrieved from PostgreSQL through the backend API rather than being stored in memory.

### Ticket Count

The API provides a count of open tickets visible to the authenticated user.

### Ticket Details

Users can select a ticket and view its details.

The detail view includes:

- Ticket subject
- Ticket status
- Loading feedback
- Error handling
- Retry functionality
- A way to return to the ticket list

React state is used to switch between list and detail views without reloading the page.

### User-Scoped Ticket Access

Ticket access is based on the authenticated user.

Users cannot retrieve unrelated tickets simply by changing a ticket ID or supplying another user ID in the request.

Tickets that do not exist and tickets that the user is not permitted to view return the same type of `404` response. This helps prevent users from discovering whether inaccessible ticket IDs exist.

## Technologies Used

### Languages

- JavaScript
- HTML5
- CSS3
- SQL

### Frontend

- React
- Vite
- Fetch API
- React Context
- Local Storage

### Backend

- Node.js
- Express
- CORS
- dotenv

### Database

- PostgreSQL
- `pg`
- `node-pg-migrate`

### Authentication

- JSON Web Tokens (`jsonwebtoken`)
- bcrypt (`bcryptjs`)

### Development Tools

- Git
- GitHub
- Visual Studio Code
- Claude Code
- curl
- DBeaver

## Project Structure

```text
support-desk/
├── server/
│   ├── migrations/          # PostgreSQL database migrations
│   └── src/
│       ├── auth/            # Authentication helpers and middleware
│       ├── config/          # Environment configuration
│       ├── repositories/    # Database queries
│       ├── routes/          # Express API routes
│       ├── scripts/         # Seed and smoke-test scripts
│       ├── services/        # Application/business logic
│       ├── app.js           # Express application
│       ├── db.js            # PostgreSQL connection
│       └── index.js         # Server entry point

├── web/
│   └── src/
│       ├── auth/            # Authentication context
│       ├── lib/             # API client
│       ├── App.jsx
│       └── main.jsx

├── specs/                   # Feature specifications
├── package.json             # Root scripts
├── CLAUDE.md                # Project guidance for Claude
└── README.md
```

## Requirements

- Node.js
- npm
- PostgreSQL

## Setup

Clone the repository:

```bash
git clone <repository-url>
cd support-desk
```

Install dependencies for both applications:

```bash
npm run install:all
```

Alternatively, install them separately:

```bash
cd server
npm install

cd ../web
npm install
```

### Environment Variables

The backend uses environment variables for configuration.

Typical server configuration includes:

```env
PORT=4000
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<your-secret-key>
ACCESS_TOKEN_TTL=<token-lifetime>
BCRYPT_ROUNDS=<bcrypt-rounds>
CORS_ORIGIN=<frontend-origin>
```

Secrets such as `JWT_SECRET` and database credentials should never be committed to Git.

The frontend can use:

```env
VITE_API_BASE=
VITE_API_PROXY_TARGET=http://localhost:4000
```

`VITE_API_BASE` overrides the frontend API base URL. When it is left empty, Vite proxies `/api` requests to the backend during development.

## Database Setup

The project uses PostgreSQL for persistent storage.

Database schema changes are managed through migrations using `node-pg-migrate`.

From the `server` directory:

```bash
npm run migrate:up
```

To roll back a migration:

```bash
npm run migrate:down
```

Seed development data with:

```bash
npm run seed
```

The seed script creates sample users and support tickets for development and testing.

## Running the App

From the repository root:

```bash
npm run dev
```

This starts both the Express API and React frontend using `concurrently`.

The output is labelled:

```text
[server]
[web]
```

You can also run each application separately:

```bash
npm run dev:server
npm run dev:web
```

Or from within each directory:

```bash
cd server
npm run dev
```

```bash
cd web
npm run dev
```

## Available Commands

### Root

```bash
npm run install:all   # install server and frontend dependencies
npm run dev           # run server and frontend together
npm run dev:server    # run API server only
npm run dev:web       # run frontend only
npm run build         # build frontend
npm start             # start API server
```

### `server/`

```bash
npm run dev           # start server with Node watch mode
npm start             # start server
npm run migrate:up    # apply database migrations
npm run migrate:down  # roll back a migration
npm run seed          # seed development data
npm run smoke         # run authentication/API smoke tests
```

### `web/`

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## API Endpoints

All API responses use JSON.

### Health

```http
GET /api/health
GET /api/ready
```

These endpoints are public and can be used to check whether the application and its dependencies are available.

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

`/api/auth/me` requires authentication.

### Tickets

```http
GET /api/tickets
GET /api/tickets/count
GET /api/tickets/:id
```

Ticket endpoints require authentication.

The backend determines ticket visibility from the authenticated user's JWT rather than accepting a user ID supplied by the client.

## Authentication

Authentication uses JWT bearer tokens.

After a successful registration or login, the API returns a token that the frontend sends with protected requests:

```http
Authorization: Bearer <token>
```

Passwords are hashed using bcrypt before being stored in PostgreSQL.

The API intentionally returns the same authentication error for an unknown email and an incorrect password so that login responses do not reveal whether an account exists.

## Database

Application data is stored in PostgreSQL.

Database access is separated from application logic using a repository and service structure.

For example:

```text
Route
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

Repositories are responsible for database queries, while services contain application logic such as ticket visibility and error handling.

Database migrations are used to keep the database schema consistent and reproducible across development environments.

## Testing

The backend includes an authentication smoke test:

```bash
cd server
npm run smoke
```

The smoke test starts the real Express application on an available temporary port and checks important behaviour including:

- Health and readiness endpoints
- User registration
- Password validation
- Duplicate email handling
- Successful login
- Invalid login attempts
- JWT authentication
- Protected routes
- Current-user retrieval
- User-scoped ticket lists
- Ticket counts
- Ticket detail access
- Unauthorized ticket access
- Invalid token handling
- User ID spoofing protection

The script prints `PASS` or `FAIL` for each assertion and exits with a non-zero status when a test fails.

## Error Handling

The backend uses centralized error handling and appropriate HTTP status codes.

Examples include:

- `400` — invalid input
- `401` — authentication failure
- `404` — resource not found or not visible to the user
- `409` — duplicate email address
- `500` — unexpected server error

API errors follow a structured JSON format such as:

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Password must be at least 8 characters"
  }
}
```

The frontend API layer converts unsuccessful responses into `ApiError` objects and displays suitable feedback to the user.

## AI Usage

Claude Code was used throughout development to support the engineering workflow, including:

- Planning changes before implementation
- Breaking requirements into smaller tasks
- Reviewing existing project structure
- Implementing features from acceptance criteria
- Debugging frontend, backend, database, and authentication issues
- Writing and reviewing database migrations
- Creating automated smoke tests
- Refactoring code into repository and service layers
- Reviewing security considerations
- Supporting Git workflows
- Improving documentation

AI-generated changes were reviewed, tested, and adjusted before being accepted into the project.

## Future Improvements

Possible future improvements include:

- Creating tickets from the frontend
- Editing existing tickets
- Updating ticket statuses
- Deleting tickets
- Assigning and reassigning tickets to agents
- More complete frontend styling
- Automated unit and integration tests
- Role-based permissions
- Refresh-token authentication
- Production deployment
- CI/CD integration

## Credits

This project was created as part of the **Sparta Education Claude Engineering course**.
