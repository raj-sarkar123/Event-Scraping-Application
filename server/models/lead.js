import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  email: String,
  consent: Boolean,
  eventId: mongoose.Schema.Types.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("lead", leadSchema);
