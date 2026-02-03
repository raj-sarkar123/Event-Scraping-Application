import cron from "node-cron";
import { scrapeEventbrite } from "../scrapers/eventbrite.js";

cron.schedule("0 */6 * * *", () => {
  console.log("⏰ Running Eventbrite scraper...");
  scrapeEventbrite();
});
