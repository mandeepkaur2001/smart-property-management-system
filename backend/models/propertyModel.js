// backend/models/propertyModel.js

import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  name: String,
  location: String,
  initialPrice: Number, // initial deposit or price
  rent: Number,         // monthly rent
  status: { type: String, enum: ["available", "requested", "occupied"], default: "available" },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Property", propertySchema);

