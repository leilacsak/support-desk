import { Router } from "express";
import { listTickets, getTicketById, countOpenTickets } from "../services/ticketService.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await listTickets(req.user.id));
  } catch (err) {
    next(err);
  }
});

// Must stay declared before /:id — otherwise Express matches "count" as the :id param and this route never fires.
router.get("/count", async (req, res, next) => {
  try {
    const count = await countOpenTickets(req.user.id);
    console.log(count, 200);
    res.status(200).json({ count });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const ticket = await getTicketById(req.params.id, req.user.id);
    res.json(ticket);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
