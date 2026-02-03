import mongoose from "mongoose";
import event from "./models/event.js";

async function importAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await event.updateMany(
      { status: { $ne: "imported" } },
      { $set: { status: "imported" } }
    );

    console.log(`Imported ${result.modifiedCount} events`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importAll();
