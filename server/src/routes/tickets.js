import { Router } from "express";
import { listTickets, getTicketById, countOpenTickets } from "../services/ticketService.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(listTickets());
});

router.get("/count", (req, res) => {
  const count = countOpenTickets();
  console.log(count, 200);
  res.status(200).json({ count });
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
