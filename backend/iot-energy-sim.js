// backend/iot-energy-sim.js
import mongoose from "mongoose";
import EnergyReading from "./models/energyDataModel.js";
import Property from "./models/propertyModel.js";

mongoose.connect("mongodb://localhost:27017/spms", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getOccupiedProperties() {
  return await Property.find({ status: "occupied" });
}

// Helper: Randomize around last reading for smoother changes
async function getLastReading(propertyId) {
  return await EnergyReading.findOne({ propertyId }).sort({ timestamp: -1 });
}

function randomAround(value, variance) {
  return +(value + (Math.random() - 0.5) * 2 * variance).toFixed(2);
}

async function generateEnergyData() {
  const properties = await getOccupiedProperties();

  for (const property of properties) {
    const last = await getLastReading(property._id);

    const power_kWh = last ? randomAround(last.power_kWh, 1) : +(Math.random() * 5 + 2).toFixed(2);
    const voltage_V = last ? randomAround(last.voltage_V, 5) : +(220 + Math.random() * 10).toFixed(1);
    const current_A = last ? randomAround(last.current_A, 2) : +(10 + Math.random() * 5).toFixed(2);
    const temp_C = last ? randomAround(last.temp_C, 1.5) : +(22 + Math.random() * 6).toFixed(1);
    const humidity = last ? randomAround(last.humidity, 5) : +(40 + Math.random() * 20).toFixed(1);

    const reading = new EnergyReading({
      propertyId: property._id,
      power_kWh: Math.max(0, power_kWh),
      voltage_V: Math.max(0, voltage_V),
      current_A: Math.max(0, current_A),
      temp_C: Math.max(0, temp_C),
      humidity: Math.min(100, Math.max(0, humidity)),
      timestamp: new Date(),
    });

    await reading.save();
  }

  console.log(`🔋 Generated IoT readings for ${properties.length} occupied properties at ${new Date().toLocaleTimeString()}`);
}

// Run every 3s
setInterval(generateEnergyData, 3000);
console.log("📡 IoT energy simulation running every 3 seconds for occupied properties...");
