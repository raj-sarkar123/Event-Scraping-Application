import express from "express";
import lead from "../models/lead.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, consent, eventId } = req.body;

  if (!email || !consent || !eventId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  await lead.create({
    email,
    consent,
    eventId
  });

  res.json({ message: "Lead saved" });
});

export default router;
