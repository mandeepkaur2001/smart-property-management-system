// backend/mock-payment.js
import express from "express";
import User from "./models/userModel.js";
import Payment from "./models/paymentModel.js";
import Lease from "./models/leaseModel.js";

const router = express.Router();

router.post("/api/payments/mock", async (req, res) => {
  try {
    const { userId, cardId, amount, propertyId } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Validate card
    const card = user.cards?.find(
      (c) => c.cardId === cardId || c.last4 === cardId
    );
    if (!card) return res.status(400).json({ msg: "Invalid or missing card" });

    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Record payment
    const payment = new Payment({
      userId,
      propertyId,
      cardId,
      amount,
      status: "success",
      createdAt: new Date(),
    });
    await payment.save();

    // --- Lease Update Logic ---
    const lease = await Lease.findOne({ propertyId, tenantId: userId });

    if (lease) {
      // 🩹 Ensure payments array exists
      if (!Array.isArray(lease.payments)) {
        lease.payments = [];
      }

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      // If lease has no payment records yet, initialize 12 months
      if (lease.payments.length === 0) {
        const start = new Date(lease.startDate || now);
        for (let i = 0; i < 12; i++) {
          const month = new Date(start);
          month.setMonth(start.getMonth() + i);
          lease.payments.push({
            month: `${month.getFullYear()}-${String(
              month.getMonth() + 1
            ).padStart(2, "0")}`,
            amount: lease.monthlyRent,
            status: i === 0 ? "Paid" : "Pending",
          });
        }
      } else {
        // Find next unpaid month and mark it as paid
        const idx = lease.payments.findIndex((p) => p.status === "Pending");
        if (idx !== -1) {
          lease.payments[idx].status = "Paid";
        } else {
          // All paid, prevent accidental overflow
          console.log("All lease payments already completed");
        }
      }

      await lease.save();
    }

    // Return updated lease for frontend refresh
    const updatedLease = lease ? await Lease.findById(lease._id).lean() : null;

    res.json({
      msg: "Mock payment processed successfully",
      payment,
      lease: updatedLease,
    });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ msg: err.message });
  }
});

export default router;
