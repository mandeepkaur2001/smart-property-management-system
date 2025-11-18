// backend/iot-energy-sim.js
import mongoose from "mongoose";
import EnergyReading from "./models/energyDataModel.js";
import Property from "./models/propertyModel.js";

// ---------- SNS ADDED (minimal addition) ----------
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: "us-east-1" });
const topicArn = "arn:aws:sns:us-east-1:518832444797:energy-spike-topic";

async function notifySpike(spikeData) {
  try {
    await sns.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(spikeData),
      })
    );
    console.log("🔔 Spike published to SNS:", spikeData);
  } catch (err) {
    console.error("❌ SNS publish error:", err);
  }
}
// ---------------------------------------------------

mongoose.connect("mongodb://localhost:27017/spms", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getOccupiedProperties() {
  return await Property.find({ status: "occupied" });
}

// Latest reading for smoothing
async function getLastReading(propertyId) {
  return await EnergyReading.findOne({ propertyId }).sort({ timestamp: -1 });
}

// Prevent negative values
function nonNegative(num) {
  return num < 0 ? 0 : num;
}

// Randomize around last reading
function randomAround(value, variance) {
  return +(value + (Math.random() - 0.5) * 2 * variance).toFixed(2);
}

let startupSpikeDone = false;

async function generateEnergyData() {
  const properties = await getOccupiedProperties();

  if (!startupSpikeDone) {
    console.log(`⚡ Startup spike injected for ${properties.length} occupied properties...`);
  }

  for (const property of properties) {
    const last = await getLastReading(property._id);

    let power_kWh, voltage_V, current_A, temp_C, humidity;

    // ---------------------------------------------------
    // 1️⃣ ONE-TIME STARTUP SPIKE
    // ---------------------------------------------------
    if (!startupSpikeDone) {
      power_kWh = 12;   // big spike
      voltage_V = 240;
      current_A = 22;
      temp_C = 30;
      humidity = 50;

      // 👉 SEND SNS SPIKE EVENT (minimal addition)
      await notifySpike({
        propertyId: property._id,
        avg_kWh: power_kWh,
        avg_temp: temp_C,
        avg_humidity: humidity,
        timestamp: new Date()
      });
    }

    // ---------------------------------------------------
    // 2️⃣ NORMAL READINGS
    // ---------------------------------------------------
    else {
      power_kWh = last
        ? nonNegative(randomAround(last.power_kWh, 1))
        : +(Math.random() * 5 + 2).toFixed(2);

      voltage_V = last
        ? nonNegative(randomAround(last.voltage_V, 5))
        : +(220 + Math.random() * 10).toFixed(1);

      current_A = last
        ? nonNegative(randomAround(last.current_A, 2))
        : +(10 + Math.random() * 5).toFixed(2);

      temp_C = last
        ? nonNegative(randomAround(last.temp_C, 1.5))
        : +(22 + Math.random() * 6).toFixed(1);

      humidity = last
        ? nonNegative(randomAround(last.humidity, 5))
        : +(40 + Math.random() * 20).toFixed(1);
    }

    const reading = new EnergyReading({
      propertyId: property._id,
      power_kWh,
      voltage_V,
      current_A,
      temp_C,
      humidity,
      timestamp: new Date(),
    });

    await reading.save();
  }

  if (!startupSpikeDone) {
    startupSpikeDone = true;
  }

  console.log(`🔋 IoT readings updated at ${new Date().toLocaleTimeString()}`);
}

// Loop every 3 seconds
setInterval(generateEnergyData, 3000);
console.log("📡 IoT energy simulation running every 3 seconds for occupied properties...");
