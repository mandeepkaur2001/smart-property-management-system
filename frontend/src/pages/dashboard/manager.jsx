// src/pages/dashboard/manager.jsx
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addForm, setAddForm] = useState({
    name: "",
    location: "",
    initialPrice: "",
    rent: "",
  });

  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchRequests();
    }
  }, [user]);

  // Fetch all properties
 // Fetch all properties
const fetchProperties = async () => {
  try {
    const res = await axios.get("/api/properties");

    // Update this line:
    // Ensure properties is always an array
    // If your API returns { properties: [...] } use res.data.properties
    setProperties(Array.isArray(res.data) ? res.data : res.data.properties || []);

  } catch (err) {
    console.error(err);
    setProperties([]); // fallback to empty array
  } finally {
    setLoading(false);
  }
};


  // Fetch tenant requests
  // Fetch tenant requests
const fetchRequests = async () => {
  try {
    const res = await axios.get("/api/manager/requests"); // backend endpoint
    // Transform requests into { tenantName, propertyName, propertyId } format
    const transformed = res.data.requests.map((p) => ({
      propertyId: p._id,
      propertyName: p.name,
      tenantName: p.tenantId?.name || "Unknown Tenant",
    }));
    setRequests(transformed);
  } catch (err) {
    console.error(err);
    setRequests([]);
  }
};


  // Add property handler
  const handleAddProperty = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("/api/properties", addForm);
      setMessage("Property added successfully!");
      setAddForm({ name: "", location: "", initialPrice: "", rent: "" });
      fetchProperties();
      setActiveSection("overview"); // Go back to overview
    } catch (err) {
      setMessage(err.response?.data?.message || "Error adding property");
    }
  };

  // Approve tenant request
  const handleApprove = async (propertyId) => {
    try {
      await axios.post("/api/manager/approve", { propertyId });
      fetchRequests();
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;

  // Sidebar options
  const sidebarButtons = [
    { id: "overview", label: "Overview" },
    { id: "add-property", label: "Add Property" },
    { id: "tenant-requests", label: "Tenant Requests" },
  ];

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 h-screen p-4 shadow-lg flex flex-col gap-3">
          {sidebarButtons.map((btn) => (
            <button
              key={btn.id}
              className={`p-2 rounded text-left ${
                activeSection === btn.id ? "bg-blue-200" : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveSection(btn.id)}
            >
              {btn.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div>
              <h1 className="text-2xl font-semibold mb-4">Manager Dashboard</h1>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg text-center shadow">
                  <h3 className="font-semibold text-green-800">Available</h3>
                  <p className="text-2xl font-bold">
                    {properties.filter((p) => p.status === "available").length}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg text-center shadow">
                  <h3 className="font-semibold text-blue-800">Occupied</h3>
                  <p className="text-2xl font-bold">
                    {properties.filter((p) => p.status === "occupied").length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center shadow">
                  <h3 className="font-semibold text-yellow-800">Total Properties</h3>
                  <p className="text-2xl font-bold">{properties.length}</p>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
                <Bar
                  data={{
                    labels: ["Available", "Occupied"],
                    datasets: [
                      {
                        label: "Property Status",
                        data: [
                          properties.filter((p) => p.status === "available").length,
                          properties.filter((p) => p.status === "occupied").length,
                        ],
                        backgroundColor: ["#22c55e", "#3b82f6"],
                      },
                    ],
                  }}
                />
              </div>

              {/* Property List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">All Properties</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {properties.map((p) => (
                    <div
                      key={p._id}
                      className="p-4 bg-white shadow rounded border hover:shadow-lg transition"
                    >
                      <h4 className="font-bold">{p.name}</h4>
                      <p className="text-gray-600">{p.location}</p>
                      <p className="text-sm text-gray-700">
                        Rent: <span className="font-semibold">₹{p.rent}</span>
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          p.status === "available" ? "text-green-600" : "text-blue-600"
                        }`}
                      >
                        Status: {p.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add Property Section */}
          {activeSection === "add-property" && (
            <div>
              <h1 className="text-2xl font-semibold mb-4">Add New Property</h1>
              {message && <p className="mb-4 text-green-600">{message}</p>}
              <form className="grid gap-4 max-w-md" onSubmit={handleAddProperty}>
                <input
                  type="text"
                  name="name"
                  placeholder="Property Name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={addForm.location}
                  onChange={(e) =>
                    setAddForm({ ...addForm, location: e.target.value })
                  }
                  required
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="initialPrice"
                  placeholder="Initial Price"
                  value={addForm.initialPrice}
                  onChange={(e) =>
                    setAddForm({ ...addForm, initialPrice: e.target.value })
                  }
                  required
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="rent"
                  placeholder="Rent"
                  value={addForm.rent}
                  onChange={(e) => setAddForm({ ...addForm, rent: e.target.value })}
                  required
                  className="p-2 border rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  Add Property
                </button>
              </form>
            </div>
          )}

          {/* Tenant Requests Section */}
          {activeSection === "tenant-requests" && (
            <div>
              <h1 className="text-2xl font-semibold mb-4">Tenant Requests</h1>
              {requests.length === 0 ? (
                <p>No pending requests.</p>
              ) : (
                <div className="grid gap-4">
                  {requests.map((r) => (
                    <div
                      key={r._id}
                      className="p-4 bg-white shadow rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold">{r.tenantName}</p>
                        <p className="text-gray-600">{r.propertyName}</p>
                      </div>
                      <button
                        onClick={() => handleApprove(r.propertyId)}
                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
