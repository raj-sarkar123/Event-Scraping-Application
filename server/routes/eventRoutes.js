import express from "express";
import event from "../models/event.js";
import requireAdmin from "../middlewares/requireAdmin.js";

const router = express.Router();

/* =========================
   PUBLIC EVENTS (approved)
========================= */
router.get("/", async (req, res) => {
  const events = await event.find({ status: "imported" });
  res.json(events);
});

/* =========================
   ADMIN EVENTS (ADMINS ONLY)
========================= */
router.get("/admin", requireAdmin, async (req, res) => {
  const events = await event.find({
    status: { $in: ["new", "imported", "inactive", "updated"] }
  }).sort({ lastScrapedAt: -1 });

  res.json(events);
});

/* =========================
   IMPORT EVENT (ADMINS ONLY)
========================= */
router.post("/import/:id", requireAdmin, async (req, res) => {
  const ev = await event.findById(req.params.id);

  if (!ev) {
    return res.status(404).json({ message: "Event not found" });
  }

  ev.status = "imported";
  ev.importedAt = new Date();
  ev.importedBy = req.user.email;

  await ev.save();

  res.json({ message: "Imported" });
});

export default router;
