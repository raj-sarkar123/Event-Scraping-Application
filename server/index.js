import scrapeRoutes from "./routes/scrapeRoutes.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import "./config/passport.js"; // 👈 now env is available
import "./cron/scrapeJob.js";

import eventRoutes from "./routes/eventRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import authRoutes from "./routes/authRoutes.js";



const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/events", eventRoutes);
app.use("/lead", leadRoutes);
app.use("/auth", authRoutes);
app.use("/scrape", scrapeRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch(console.error);
