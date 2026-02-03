import mongoose from "mongoose";
import event from "./models/event.js";

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await event.updateMany(
      { imageUrl: null },
      { $set: { imageUrl: "https://via.placeholder.com/400x200?text=Event" } }
    );

    console.log(`Updated ${result.modifiedCount} events`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateImages();
