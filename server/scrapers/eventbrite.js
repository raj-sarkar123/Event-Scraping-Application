import axios from "axios";
import * as cheerio from "cheerio";
import event from "../models/event.js";

export const scrapeEventbrite = async () => {
  console.log("🔍 Scraper started...");

  const url = "https://www.eventbrite.com/d/australia--sydney/events/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const scrapedUrls = [];

  const eventPromises = [];

  $('a[data-event-id]').each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).find("h3").text().trim();

    if (!href || !title) return;

    const eventUrl = href.startsWith("http")
      ? href
      : `https://www.eventbrite.com${href}`;

    scrapedUrls.push(eventUrl);

    console.log("Found event:", title);

    eventPromises.push(
      event.updateOne(
        { eventUrl },
        {
          $setOnInsert: {
            title,
            city: "Sydney",
            source: "Eventbrite",
            eventUrl,
            status: "new",
            lastScrapedAt: new Date()
          }
        },
        { upsert: true }
      )
    );
  });

  await Promise.all(eventPromises);

  // mark inactive
  if (scrapedUrls.length > 0) {
    await event.updateMany(
      { eventUrl: { $nin: scrapedUrls } },
      { status: "inactive" }
    );
  }

  console.log("✅ Eventbrite scraping done");
};
