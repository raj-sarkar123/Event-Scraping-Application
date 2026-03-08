import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeEventbrite() {
  try {
    const url =
      "https://www.eventbrite.com/d/australia--sydney/events/";

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const $ = cheerio.load(data);
    const events = [];

    const eventMap = new Map();

    $("a[href*='/e/']").each((_, el) => {
      let eventUrl = $(el).attr("href");
      if (!eventUrl) return;

      if (!eventUrl.startsWith("http")) {
        eventUrl = `https://www.eventbrite.com${eventUrl}`;
      }

      // Strip query parameters for correct grouping
      eventUrl = eventUrl.split("?")[0];

      const title = $(el).find("h3").text().trim();
      const image =
        $(el).find("img").attr("src") ||
        $(el).find("img").attr("data-src") ||
        null;

      if (!eventMap.has(eventUrl)) {
        eventMap.set(eventUrl, { title: null, image: null, eventUrl });
      }

      const existing = eventMap.get(eventUrl);
      if (title) existing.title = title;
      if (image) existing.image = image;
    });

    for (const data of eventMap.values()) {
      if (data.title) {
        events.push({
          title: data.title,
          venue: "Sydney",
          date: null,
          image: data.image,
          eventUrl: data.eventUrl,
          source: "eventbrite"
        });
      }
    }

    console.log("Eventbrite scraped:", events.length);
    return events;
  } catch (err) {
    console.error("Eventbrite failed:", err.message);
    return []; // 🔑 IMPORTANT
  }
}
