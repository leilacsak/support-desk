import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../constants/index.js";

export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  // With uuid primary keys, hitting e.g. /api/tickets/not-a-uuid or an old integer id like /api/tickets/1 makes Postgres raise 22P02 (invalid text representation), which would otherwise surface as an uncaught 500.
  if (err.code === "22P02") {
    return res.status(400).json({ error: { code: ERROR_CODES.VALIDATION, message: "Invalid id format" } });
  }

  console.error(err);
  res.status(500).json({ error: { code: ERROR_CODES.INTERNAL, message: "Something went wrong." } });
}
