import express from "express";
import event from "../models/event.js";
import requireAdmin from "../middlewares/requireAdmin.js";

const router = express.Router();

/* =========================
   PUBLIC EVENTS (LIVE SITE)
========================= */
/* =========================
   PUBLIC EVENTS (LIVE SITE)
========================= */
router.get("/", async (req, res) => {
  try {
    const events = await event.find(
      { status: { $in: ["imported", "updated"] } },
      {
        title: 1,
        venue: 1,
        dateTime: 1,
        imageUrl: 1,
        source: 1,
        eventUrl: 1
      }
    ).sort({ dateTime: 1 });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});


/* =========================
   ADMIN EVENTS (ADMINS ONLY)
========================= */
router.get("/admin", requireAdmin, async (req, res) => {
  const events = await event
    .find({
      status: { $in: ["new", "imported", "inactive", "updated"] }
    })
    .sort({ lastScrapedAt: -1 });

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
