// backend/models/leaseModel.js

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  month: String,
  amount: Number,
  status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
});

const leaseSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  totalAmount: Number,
  monthlyRent: Number,
  status: { type: String, enum: ["active", "expired"], default: "active" },
  leaseDocUrl: String, // placeholder for PDF link
  payments: [paymentSchema], // month-wise payment tracking
});

export default mongoose.model("Lease", leaseSchema);
