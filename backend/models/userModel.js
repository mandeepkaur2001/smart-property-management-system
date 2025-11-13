// backend/models/userModel.js

import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  cardId: String,
  last4: String,
  brand: String,
  expiryMonth: Number,
  expiryYear: Number,
  cvvHash: String, // simple hash placeholder
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["manager", "tenant"], default: "tenant" },
  cards: [cardSchema],
});

export default mongoose.model("User", userSchema);

