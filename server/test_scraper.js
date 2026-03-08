import fs from "fs";
import * as cheerio from "cheerio";

const html = fs.readFileSync("eventbrite_page.html", "utf-8");
const $ = cheerio.load(html);

// Find all event cards, maybe they have a unique class
// A common class in Eventbrite is "DiscoverTicketCard" or section wrapper
$("div.DiscoverTicketCard, li.search-main-content__item, section").each((_, el) => {
    const containerHTML = $(el).html();
    if (!containerHTML) return;

    const title = $(el).find("h3").text().trim();
    const link = $(el).find("a[href*='/e/']").first();
    const img = $(el).find("img").first();

    if (title) {
        console.log("Found Title:", title);
        if (img.length) {
            console.log("Has Img src:", img.attr("src"));
        } else {
            console.log("No Img found in this container");
        }
        console.log("-------");
    }
});

// Since eventbrite changed their layout, the title and image might be separated.
// Let's look at what the <a> tag contains
console.log("\n\nChecking what A tags contain:\n");
$("a[href*='/e/']").each((_, el) => {
    const hasH3 = $(el).find("h3").length > 0;
    const hasImg = $(el).find("img").length > 0;

    if (hasH3 && hasImg) {
        console.log("Found A tag with BOTH title and image!", $(el).find("h3").text().trim());
    } else if (hasH3) {
        console.log("Found A tag with ONLY title:", $(el).find("h3").text().trim());
    } else if (hasImg) {
        console.log("Found A tag with ONLY image src:", $(el).find("img").attr("src"));
    }
});
