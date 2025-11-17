// backend/models/energyDataModel.js

import mongoose from "mongoose";

const energyReadingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    power_kWh: Number,
    voltage_V: Number,
    current_A: Number,
    temp_C: Number,
    humidity: Number,

    // IMPORTANT: timestamp must be indexed for TTL
    timestamp: {
      type: Date,
      default: Date.now,
      index: { expires: "5m" }, // Auto-delete documents after 5 minutes
    },
  },
  { timestamps: false }
);

export default mongoose.model("EnergyReading", energyReadingSchema);
