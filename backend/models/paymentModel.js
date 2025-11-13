// backend/models/paymentModel.js

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  cardId: String,
  amount: Number,
  status: { type: String, enum: ["success", "failed"], default: "success" },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);
