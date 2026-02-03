import mongoose from "mongoose";
import dotenv from "dotenv";
import { scrapeEventbrite } from "./scrapers/eventbrite.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await scrapeEventbrite();
    console.log("Scraper finished");
    process.exit(0);
  })
  .catch(console.error);
