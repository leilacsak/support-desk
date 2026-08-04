import { Router } from "express";
import {
  listTickets,
  getTicketById,
  countOpenTickets,
} from "../services/ticketService.js";

const router = Router();
// callback function - a function that is passed as an argument
//  to another function.
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
    next(err);
  }
});

export default router;
