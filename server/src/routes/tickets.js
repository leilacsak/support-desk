import { Router } from "express";
import { listTickets, getTicketById } from "../services/ticketService.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(listTickets());
});

router.get("/:id", (req, res) => {
  try {
    const ticket = getTicketById(req.params.id);
    res.json(ticket);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
