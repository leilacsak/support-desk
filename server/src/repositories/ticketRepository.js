import { query } from "../db.js";

const SELECT_TICKET = `
    SELECT
        t.id,
        t.subject,
        t.description,
        t.status,
        t.priority,
        t.created_at,
        t.updated_at,
        r.email AS requester,
        r.name AS requester_name,
        a.email AS assignee,
        a.name AS assignee_name
    FROM tickets t
    JOIN users r ON r.id = t.requester_id
    LEFT JOIN users a ON a.id = t.assignee_id
`;

// visibleTo - single source of truth for "can this user see this ticket"
function visibleTo(placeholder) {
  return `(t.requester_id = ${placeholder} OR t.assignee_id = ${placeholder})`;
}

// findAllVisible
export async function findAllVisible(userId) {
  const { rows } = await query(
    `${SELECT_TICKET}
         WHERE ${visibleTo("$1")}
         ORDER BY
            CASE t.priority
                WHEN 'high' THEN 0
                WHEN 'medium' THEN 1
                ELSE 2 END,
            t.created_at`,
    [userId],
  );
  return rows;
}

// findByIdVisibleTo
export async function findByIdVisibleTo(id, userId) {
  const { rows } = await query(
    `${SELECT_TICKET} WHERE t.id = $1 AND ${visibleTo("$2")}`,
    [id, userId],
  );
  return rows[0];
}

// countByStatusVisibleTo
export async function countByStatusVisibleTo(status, userId) {
  const { rows } = await query(
    `SELECT COUNT(*) AS count FROM tickets t WHERE t.status = $1 AND ${visibleTo("$2")}`,
    [status, userId],
  );
  return Number(rows[0].count);
}

// countAll
export async function countAll() {
  const { rows } = await query(`SELECT COUNT(*) AS count FROM tickets`);
  return Number(rows[0].count);
}
