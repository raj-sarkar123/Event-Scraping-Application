import event from "../models/event.js";
import { scrapeAllEvents } from "../services/scrapeAllEvents.js";

export async function scrapeAndSaveEvents(req, res) {
  try {
    const scrapedEvents = await scrapeAllEvents();

    let created = 0;
    let updated = 0;

    for (const ev of scrapedEvents) {
      console.log("SCRAPED EVENT:", ev);

      const existingEvent = await event.findOne({
        eventUrl: ev.eventUrl
      });

      if (existingEvent) {
        existingEvent.title = ev.title;
        existingEvent.venue = ev.venue;
        existingEvent.dateTime = ev.date
          ? new Date(ev.date)
          : existingEvent.dateTime;
        existingEvent.imageUrl = ev.image || "https://via.placeholder.com/400x200?text=Event";
        existingEvent.source = ev.source;
        existingEvent.lastScrapedAt = new Date();

        if (existingEvent.status === "imported") {
          existingEvent.status = "updated";
        }

        await existingEvent.save();
        updated++;
      } else {
        await event.create({
          title: ev.title,
          venue: ev.venue,
          dateTime: ev.date ? new Date(ev.date) : null,
          imageUrl: ev.image || "https://via.placeholder.com/400x200?text=Event",
          source: ev.source,
          eventUrl: ev.eventUrl,
          status: "new",
          lastScrapedAt: new Date()
        });
        created++;
      }
    }

    res.json({
      message: "Scraping completed",
      totalScraped: scrapedEvents.length,
      created,
      updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Scraping failed" });
  }
}
