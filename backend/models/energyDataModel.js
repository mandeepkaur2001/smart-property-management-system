// backend/models/energyDataModel.js

import mongoose from "mongoose";

const energyReadingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  power_kWh: Number,
  voltage_V: Number,
  current_A: Number,
  temp_C: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("EnergyReading", energyReadingSchema);
