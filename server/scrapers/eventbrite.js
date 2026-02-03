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

    $("a[href*='/e/']").each((_, el) => {
      const title = $(el).find("h3").text().trim();
      let eventUrl = $(el).attr("href");

      if (!title || !eventUrl) return;

      if (!eventUrl.startsWith("http")) {
        eventUrl = `https://www.eventbrite.com${eventUrl}`;
      }

      const image =
        $(el).find("img").attr("src") ||
        $(el).find("img").attr("data-src") ||
        null;

      events.push({
        title,
        venue: "Sydney",
        date: null,
        image,
        eventUrl,
        source: "eventbrite"
      });
    });

    console.log("Eventbrite scraped:", events.length);
    return events;
  } catch (err) {
    console.error("Eventbrite failed:", err.message);
    return []; // 🔑 IMPORTANT
  }
}
