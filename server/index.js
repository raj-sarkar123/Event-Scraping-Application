import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import "./config/passport.js";
import "./cron/scrapeJob.js";

import eventRoutes from "./routes/eventRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import scrapeRoutes from "./routes/scrapeRoutes.js";

const app = express();

/* ===================== TRUST PROXY (RENDER REQUIRED) ===================== */
app.set("trust proxy", 1);

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL, // ✅ frontend URL from env
    ],
    credentials: true,
  })
);

/* ===================== MIDDLEWARE ===================== */
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ===================== ROUTES ===================== */
app.use("/events", eventRoutes);
app.use("/lead", leadRoutes);
app.use("/auth", authRoutes);
app.use("/scrape", scrapeRoutes);

/* ===================== DB + SERVER ===================== */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
