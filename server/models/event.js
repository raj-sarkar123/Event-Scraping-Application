import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  dateTime: Date,
  venue: String,
  city: String,
  description: String,
  imageUrl: String,
  source: String,
  eventUrl: { type: String, unique: true },

  status: {
    type: String,
    enum: ["new", "updated", "inactive", "imported"],
    default: "new"
  },

  lastScrapedAt: Date,
  importedAt: Date,
  importedBy: String
});

export default mongoose.model("event", eventSchema);
