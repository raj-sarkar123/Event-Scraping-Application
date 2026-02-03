import { scrapeEventbrite } from "../scrapers/eventbrite.js";
import { scrapeMeetup } from "../scrapers/meetup.js";
import { scrapeTimeout } from "../scrapers/timeout.js";

export async function scrapeAllEvents() {
  const results = await Promise.allSettled([
    scrapeEventbrite(),
    // scrapeMeetup(),
    // scrapeTimeout()
  ]);

  const events = [];

  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      events.push(...r.value);
    }
  }

  return events;
}
