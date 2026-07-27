## User Story

As a support agent, I want to open a single ticket and read its full details, so that I can understand the request without asking the customer to repeat themselves.

## Acceptance Criteria

1. GET /api/tickets/:id returns exactly one ticket as JSON.
2. Amatching id return 200 with the ticket object (all fields).
3. A non-matching id returns 404 with body {"error":"Ticket <id> not found"}.
4. Clicking a ticket in the list opens a detail view (subject, status, priority, requester, description).
5. The detail view has a way back to the list, state only, no router, no reload.

## Out of Scope (Today)

- Editing, closing or deleting a ticket (read-only).
- A per-ticket URL route to any router library
- Pagination, filtering, search. Any database. Auth.

## API contract

GET/api.tickets/:id

- 200: the ticket object, every field named
- 404: {"error": " Ticket <id> not found} as JSON, never and HTML page, never a 200 with emoty body.
