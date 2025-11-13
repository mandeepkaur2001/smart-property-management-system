// src/pages/dashboard/tenant.jsx
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("browse");
  const [properties, setProperties] = useState([]);
  const [lease, setLease] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [card, setCard] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const propRes = await axios.get("/api/properties");
      setProperties(propRes.data.properties || propRes.data || []);

      const leaseRes = await axios.get(`/api/tenant/lease/${user._id}`);
      const leaseData = leaseRes.data.lease || null;
      setLease(leaseData);

      if (leaseData && leaseData.payments?.length) {
        setPayments(leaseData.payments);
      }

      if (user.cards?.length) {
        setCard(user.cards[0]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async () => {
    try {
      const res = await axios.post("/api/cards/save", {
        userId: user._id,
        cardNumber: card.cardNumber,
        brand: card.brand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        cvv: card.cvv,
      });
      setCard(res.data.card);
      setMessage("Card saved successfully!");
    } catch {
      setMessage("Error saving card");
    }
  };

  const handleRequestProperty = async () => {
    if (!selectedProperty) return setMessage("Select a property first");
    try {
      await axios.post("/api/tenant/request", {
        tenantId: user._id,
        propertyId: selectedProperty,
      });
      setMessage("Request submitted successfully!");
    } catch {
      setMessage("Error sending request");
    }
  };

  const handlePay = async (amount, type) => {
    if (!lease) return setMessage("No active lease found");
    if (!card?.cardId && !card?.cardNumber)
      return setMessage("Please save a card first");

    try {
      const res = await axios.post("/api/payments/mock", {
        userId: user._id,
        propertyId: lease.propertyId?._id || lease.propertyId,
        cardId: card.cardId || card.cardNumber,
        amount,
        type,
      });

      if (res.data.lease) {
        setLease(res.data.lease);
        setPayments(res.data.lease.payments || []);
        setMessage(res.data.msg || "Payment successful!");
      } else {
        setMessage("Payment processed, but no lease update found.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage(err.response?.data?.msg || "Payment failed");
    }
  };

  // ✅ Determine payment progression logic based purely on backend months
  const initialPaid = payments.length > 0 && payments[0].status === "Paid";
  const paidMonths = payments.filter((p) => p.status === "Paid").length;
  const allMonthsPaid = paidMonths >= 12;

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;

  const sidebarItems = [
    { id: "browse", label: "Browse Properties" },
    { id: "request", label: "Request Property" },
    { id: "add-card", label: "Add Card" },
    { id: "leases", label: "Leases" },
    { id: "payment", label: "Payment" },
  ];

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 h-screen p-4 shadow-lg">
          {sidebarItems.map((btn) => (
            <button
              key={btn.id}
              className={`block w-full text-left p-2 rounded mb-2 ${
                activeSection === btn.id ? "bg-blue-300" : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveSection(btn.id)}
            >
              {btn.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1">
          {message && <p className="mb-3 text-green-600">{message}</p>}

          {/* Browse */}
          {activeSection === "browse" && (
            <>
              <h3 className="font-semibold mb-3">Available Properties</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {properties
                  .filter((p) => p.status === "available")
                  .map((p) => (
                    <div key={p._id} className="border p-3 rounded shadow-sm">
                      <h4 className="font-bold">{p.name}</h4>
                      <p>{p.location}</p>
                      <p>₹{p.rent} / month</p>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* Request */}
          {activeSection === "request" && (
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-semibold mb-2">Request a Property</h3>
              <select
                className="border p-2 rounded w-full mb-3"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="">Select property</option>
                {properties
                  .filter((p) => p.status === "available")
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — ₹{p.rent}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleRequestProperty}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Request Property
              </button>
            </div>
          )}

          {/* Add Card */}
          {activeSection === "add-card" && (
            <div className="p-4 bg-white rounded shadow max-w-md">
              <h3 className="font-semibold mb-3">Save Payment Card</h3>
              <input
                type="text"
                placeholder="Card Number"
                className="border p-2 rounded w-full mb-2"
                value={card.cardNumber || ""}
                onChange={(e) =>
                  setCard({ ...card, cardNumber: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Brand"
                className="border p-2 rounded w-full mb-2"
                value={card.brand || ""}
                onChange={(e) => setCard({ ...card, brand: e.target.value })}
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="MM"
                  className="border p-2 rounded flex-1"
                  value={card.expiryMonth || ""}
                  onChange={(e) =>
                    setCard({ ...card, expiryMonth: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="YY"
                  className="border p-2 rounded flex-1"
                  value={card.expiryYear || ""}
                  onChange={(e) =>
                    setCard({ ...card, expiryYear: e.target.value })
                  }
                />
              </div>
              <input
                type="text"
                placeholder="CVV"
                className="border p-2 rounded w-full mb-3"
                value={card.cvv || ""}
                onChange={(e) => setCard({ ...card, cvv: e.target.value })}
              />
              <button
                onClick={handleSaveCard}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Save Card
              </button>
            </div>
          )}

          {/* Leases */}
          {activeSection === "leases" && lease && (
            <div className="bg-white p-4 rounded shadow">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex justify-between w-full text-left font-semibold mb-2"
              >
                <span>{lease.propertyId.name}</span>
                <span>{expanded ? "▲" : "▼"}</span>
              </button>

              {expanded && (
                <>
                  <p>{lease.propertyId.location}</p>
                  <p>Rent: ₹{lease.monthlyRent}</p>

                  <h4 className="font-semibold mt-4 mb-2">Payment History</h4>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">Month</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length > 0 ? (
                        payments.map((p, i) => (
                          <tr key={i} className="border-b">
                            <td className="py-2">{p.month}</td>
                            <td className="py-2">₹{p.amount}</td>
                            <td
                              className={`py-2 font-semibold ${
                                p.status === "Paid"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {p.status}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-2 text-gray-500">
                            No payments yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {/* Payment */}
          {activeSection === "payment" && lease && (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Make Payment</h3>

              {/* Initial Payment */}
              <button
                disabled={initialPaid}
                onClick={() => handlePay(lease.totalAmount, "initial")}
                title={initialPaid ? "🚫 Already Paid" : "Pay Initial Price"}
                className={`px-3 py-1 rounded mr-2 ${
                  initialPaid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                Pay Initial Price: ₹{lease.totalAmount}
              </button>

              {/* Monthly Rent */}
              <button
                disabled={!initialPaid || allMonthsPaid}
                onClick={() => handlePay(lease.monthlyRent, "monthly")}
                title={
                  !initialPaid
                    ? "🚫 Complete initial payment first"
                    : allMonthsPaid
                    ? "🚫 All months paid"
                    : "Pay Monthly Rent"
                }
                className={`px-3 py-1 rounded ${
                  !initialPaid || allMonthsPaid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Pay Monthly Rent: ₹{lease.monthlyRent}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
