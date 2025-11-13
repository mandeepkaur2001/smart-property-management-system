// backend/routes/lease.js

import express from "express";
import Lease from "../models/leaseModel.js";
import Property from "../models/propertyModel.js";

const router = express.Router();

/**
 * POST /api/lease/pay
 * Handles initial or monthly payments and updates payment status.
 */
router.post("/pay", async (req, res) => {
  try {
    const { leaseId, type } = req.body; // type = "initial" | "monthly"
    const lease = await Lease.findById(leaseId).populate("propertyId");

    if (!lease) return res.status(404).json({ message: "Lease not found" });

    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

    // Determine payment amount
    const amount = type === "initial"
      ? lease.propertyId.initialPrice
      : lease.monthlyRent;

    // Find the existing record for this month
    const paymentIndex = lease.payments.findIndex(p => p.month === monthName);

    if (paymentIndex === -1) {
      return res.status(400).json({ message: "No payment record found for this month." });
    }

    // Prevent double payment
    if (lease.payments[paymentIndex].status === "paid") {
      return res.status(400).json({ message: "This month is already paid." });
    }

    // Update the payment record
    lease.payments[paymentIndex].status = "paid";
    lease.payments[paymentIndex].paidAt = now;

    await lease.save();

    res.json({
      success: true,
      message: `Payment for ${monthName} recorded successfully.`,
      lease,
    });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
});

export default router;
