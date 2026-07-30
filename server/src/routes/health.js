import { Router } from "express";
import { countTickets } from "../services/ticketService.js";

const router = Router();

// Liveness only — deliberately never touches the database, so a DB blip doesn't make an orchestrator kill a process that's otherwise fine.
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/ready", async (req, res) => {
  try {
    const tickets = await countTickets();
    res.status(200).json({ status: "ready", tickets });
  } catch (err) {
    res.status(503).json({ status: "unavailable", error: "database unreachable" });
  }
});

export default router;
