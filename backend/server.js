// backend/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import connectDB from "./utils/db.js";
import User from "./models/userModel.js";
import Property from "./models/propertyModel.js";
import Lease from "./models/leaseModel.js";
import mockPaymentRoutes from "./mock-payment.js";
import leaseRoutes from "./routes/lease.js";
import EnergyReading from "./models/energyDataModel.js";
import "./iot-energy-sim.js";


dotenv.config();
connectDB();


const app = express();
app.use(cors({
  origin: ["http://44.192.80.14:3000", "http://98.92.100.155:3000", "http://localhost:3000"],
  credentials: true,
 }));

// app.use(cors());

app.use(express.json());
app.use(mockPaymentRoutes);
app.use("/api/lease", leaseRoutes);


/* ---------- BASIC ROUTES ---------- */

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ msg: "User registered", user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Save Card (Tenant)
app.post("/api/cards/save", async (req, res) => {
  try {
    const { userId, cardNumber, brand, expiryMonth, expiryYear, cvv } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const last4 = cardNumber.slice(-4);
    const cvvHash = Buffer.from(cvv || "").toString("base64");
    const cardId = uuidv4();

    user.cards.push({ cardId, last4, brand, expiryMonth, expiryYear, cvvHash });
    await user.save();

    res.json({ msg: "Card saved", card: { cardId, last4, brand, expiryMonth, expiryYear } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// List Properties with pagination (unchanged)
app.get("/api/properties", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6; // show 6 per page
  const skip = (page - 1) * limit;

  const total = await Property.countDocuments();
  const properties = await Property.find().skip(skip).limit(limit);

  res.json({ properties, total });
});

// Add Property (Manager)
app.post("/api/properties", async (req, res) => {
  const { name, location, rent, initialPrice } = req.body;
  const prop = new Property({ name, location, rent, initialPrice });
  await prop.save();
  res.json({ msg: "Property added", prop });
});

// Tenant Requests Property
app.post("/api/tenant/request", async (req, res) => {
  try {
    const { tenantId, propertyId } = req.body;
    const prop = await Property.findById(propertyId);
    if (!prop) return res.status(404).json({ msg: "Property not found" });
    if (prop.status !== "available") return res.status(400).json({ msg: "Property not available" });

    prop.status = "requested";
    prop.tenantId = tenantId;
    await prop.save();

    res.json({ msg: "Request sent to manager", prop });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password }); // Simple demo auth
    if (!user) return res.status(404).json({ msg: "Invalid credentials" });

    res.json({ msg: "Login successful", user: { ...user.toObject(), cards: user.cards } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Fetch Saved Card Info Fresh
app.get("/api/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET Tenant Requests (Manager)
app.get("/api/manager/requests", async (req, res) => {
  try {
    const requests = await Property.find({ status: "requested" }).populate("tenantId", "name email");
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Manager Approves Property -> create Lease with payments array
app.post("/api/manager/approve", async (req, res) => {
  try {
    const { propertyId } = req.body;
    const prop = await Property.findById(propertyId);
    if (!prop) return res.status(404).json({ msg: "Property not found" });

    prop.status = "occupied";
    await prop.save();

    // Build 12-month payments array; first month uses initialPrice
    const start = new Date();
    const payments = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
      return {
        month: monthDate.toLocaleString("default", { month: "long", year: "numeric" }),
        amount: i === 0 ? prop.initialPrice : prop.rent,
        status: "Pending",
      };
    });

    const lease = new Lease({
      propertyId,
      tenantId: prop.tenantId,
      startDate: start,
      endDate: new Date(start.getFullYear() + 1, start.getMonth(), start.getDate()),
      totalAmount: prop.initialPrice + prop.rent * 11,
      monthlyRent: prop.rent,
      payments,
    });
    await lease.save();

    res.json({ msg: "Lease generated and property approved", lease });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Fetch lease for a tenant (by tenantId)
app.get("/api/tenant/lease/:tenantId", async (req, res) => {
  try {
    const lease = await Lease.findOne({ tenantId: req.params.tenantId }).populate("propertyId");
    if (!lease) return res.status(404).json({ msg: "Lease not found" });
    res.json({ lease });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get live energy data (last N readings for each property)
app.get("/api/energy/live", async (req, res) => {
  try {
    const readings = await EnergyReading.find()
      .sort({ timestamp: -1 })
      .limit(100); // last 100 readings overall
    res.json(readings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get summary data (for Lambda)
app.get("/api/energy/summary", async (req, res) => {
  try {
    const summary = await EnergyReading.aggregate([
      {
        $group: {
          _id: "$propertyId",
          avg_kWh: { $avg: "$power_kWh" },
          avg_temp: { $avg: "$temp_C" },
          avg_humidity: { $avg: "$humidity" },
          readings: { $sum: 1 },
        },
      },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.get("/", (req, res) => res.send("SPMS PMS backend running ✅"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
