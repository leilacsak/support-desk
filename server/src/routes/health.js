import { Router } from "express";
import { countTickets } from "../services/ticketService.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/ready", (req, res) => {
  res.status(200).json({ status: "ready", tickets: countTickets() });
});

export default router;
