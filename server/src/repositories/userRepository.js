import { query } from "../db.js";

// safe columns to return from API (NON password_hash)
const SAFE_COLUMNS = "id, email, name, created_at, updated_at, last_login_at";

// findByEmail
export async function findByEmail(email) {
  const { rows } = await query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE email = $1`,
    [email],
  );
  return rows[0] || null;
}

// findById
export async function findById(id) {
  const { rows } = await query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}
