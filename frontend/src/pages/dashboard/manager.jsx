// src/pages/dashboard/manager.jsx
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Bar,
  Line,
  Pie,
  Doughnut, 
  Scatter
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

  // Energy dashboard states
  const [energyTab, setEnergyTab] = useState("live");
  const [energyData, setEnergyData] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchRequests();
      fetchEnergyData();
      const interval = setInterval(fetchEnergyData, 3000); // live polling
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const res = await axios.get("/api/properties");
      setProperties(Array.isArray(res.data) ? res.data : res.data.properties || []);
    } catch (err) {
      console.error(err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/manager/requests");
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

  const fetchEnergyData = async () => {
    try {
      const res = await axios.get("/api/energy/live"); // your energy API
      setEnergyData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("/api/properties", addForm);
      setMessage("Property added successfully!");
      setAddForm({ name: "", location: "", initialPrice: "", rent: "" });
      fetchProperties();
      setActiveSection("overview");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error adding property");
    }
  };

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

  const sidebarButtons = [
    { id: "overview", label: "Overview" },
    { id: "add-property", label: "Add Property" },
    { id: "tenant-requests", label: "Tenant Requests" },
    { id: "energy", label: "Energy Dashboard" }, // new sidebar
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
                        Rent: <span className="font-semibold">${p.rent}</span>
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

         {/* Energy Dashboard Section */}
            {activeSection === "energy" && (
              <div>
                <h1 className="text-2xl font-semibold mb-4">Energy Dashboard</h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    className={`px-4 py-2 rounded ${
                      energyTab === "live" ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => setEnergyTab("live")}
                  >
                    Live Data
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${
                      energyTab === "summary" ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => setEnergyTab("summary")}
                  >
                    Summary
                  </button>
                </div>

                {/* LIVE DATA TAB */}
                {energyTab === "live" && (
                  <div>
                    <div className="mb-4">
                      <label className="mr-2 font-semibold">Select Property:</label>
                      <select
                        value={selectedProperty || ""}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="p-2 border rounded"
                      >
                        <option value="">--Select--</option>
                        {properties
                          .filter((p) => p.status === "occupied")
                          .map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {selectedProperty ? (
                      <div>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          {/* Total Power */}
                          <div className="bg-red-100 p-4 rounded-lg text-center shadow">
                            <h3 className="font-semibold text-red-800">Total Power (kWh)</h3>
                            <p className="text-2xl font-bold">
                              {energyData
                                .filter((d) => d.propertyId === selectedProperty)
                                .reduce((sum, d) => sum + d.power_kWh, 0)
                                .toFixed(2)}
                            </p>
                          </div>
                          {/* Avg Voltage */}
                          <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
                            <h3 className="font-semibold text-purple-800">Avg Voltage (V)</h3>
                            <p className="text-2xl font-bold">
                              {(
                                energyData
                                  .filter((d) => d.propertyId === selectedProperty)
                                  .reduce((sum, d) => sum + d.voltage_V, 0) /
                                (energyData.filter((d) => d.propertyId === selectedProperty).length || 1)
                              ).toFixed(1)}
                            </p>
                          </div>
                          {/* Avg Temp */}
                          <div className="bg-yellow-100 p-4 rounded-lg text-center shadow">
                            <h3 className="font-semibold text-yellow-800">Avg Temp (°C)</h3>
                            <p className="text-2xl font-bold">
                              {(
                                energyData
                                  .filter((d) => d.propertyId === selectedProperty)
                                  .reduce((sum, d) => sum + d.temp_C, 0) /
                                (energyData.filter((d) => d.propertyId === selectedProperty).length || 1)
                              ).toFixed(1)}
                            </p>
                          </div>
                          {/* Avg Humidity */}
                          <div className="bg-green-100 p-4 rounded-lg text-center shadow">
                            <h3 className="font-semibold text-green-800">Avg Humidity (%)</h3>
                            <p className="text-2xl font-bold">
                              {(
                                energyData
                                  .filter((d) => d.propertyId === selectedProperty)
                                  .reduce((sum, d) => sum + d.humidity, 0) /
                                (energyData.filter((d) => d.propertyId === selectedProperty).length || 1)
                              ).toFixed(1)}
                            </p>
                          </div>
                          {/* Peak Power */}
                          <div className="bg-orange-100 p-4 rounded-lg text-center shadow">
                            <h3 className="font-semibold text-orange-800">Peak Power (kWh)</h3>
                            <p className="text-2xl font-bold">
                              {Math.max(
                                ...energyData
                                  .filter((d) => d.propertyId === selectedProperty)
                                  .map((d) => d.power_kWh)
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Graphs */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Power Usage Line */}
                          <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Power Usage (kWh)</h3>
                            <Line
                              data={{
                                labels: energyData
                                  .filter((d) => d.propertyId === selectedProperty)
                                  .map((d) => new Date(d.timestamp).toLocaleTimeString()),
                                datasets: [
                                  {
                                    label: "kWh",
                                    data: energyData
                                      .filter((d) => d.propertyId === selectedProperty)
                                      .map((d) => d.power_kWh),
                                    borderColor: "#3b82f6",
                                    backgroundColor: "rgba(59,130,246,0.2)",
                                    tension: 0.4,
                                  },
                                ],
                              }}
                            />
                          </div>

                          {/* Voltage & Current Scatter */}
                          <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Voltage & Current (Scatter)</h3>
                            <Scatter
                              data={{
                                datasets: [
                                  {
                                    label: "Voltage (V)",
                                    data: energyData
                                      .filter((d) => d.propertyId === selectedProperty)
                                      .map((d, i) => ({ x: i, y: d.voltage_V })),
                                    backgroundColor: "#8b5cf6",
                                  },
                                  {
                                    label: "Current (A)",
                                    data: energyData
                                      .filter((d) => d.propertyId === selectedProperty)
                                      .map((d, i) => ({ x: i, y: d.current_A })),
                                    backgroundColor: "#f97316",
                                  },
                                ],
                              }}
                              options={{ scales: { x: { title: { display: true, text: "Time index" } } } }}
                            />
                          </div>

                          {/* Temp & Humidity Bar */}
                          <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Temperature & Humidity</h3>
                            <Bar
                              data={{
                                labels: energyData
                                  .filter((d) => d.propertyId === selectedProperty)
                                  .map((d) => new Date(d.timestamp).toLocaleTimeString()),
                                datasets: [
                                  {
                                    label: "Temp (°C)",
                                    data: energyData
                                      .filter((d) => d.propertyId === selectedProperty)
                                      .map((d) => d.temp_C),
                                    backgroundColor: "#f59e0b",
                                  },
                                  {
                                    label: "Humidity (%)",
                                    data: energyData
                                      .filter((d) => d.propertyId === selectedProperty)
                                      .map((d) => d.humidity),
                                    backgroundColor: "#22c55e",
                                  },
                                ],
                              }}
                            />
                          </div>

                          {/* Temp vs Humidity Donut */}
                          <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Temp vs Humidity</h3>
                            <Doughnut
                              data={{
                                labels: ["Avg Temp (°C)", "Avg Humidity (%)"],
                                datasets: [
                                  {
                                    data: [
                                      energyData
                                        .filter((d) => d.propertyId === selectedProperty)
                                        .reduce((sum, d) => sum + d.temp_C, 0) /
                                        (energyData.filter((d) => d.propertyId === selectedProperty)
                                          .length || 1),
                                      energyData
                                        .filter((d) => d.propertyId === selectedProperty)
                                        .reduce((sum, d) => sum + d.humidity, 0) /
                                        (energyData.filter((d) => d.propertyId === selectedProperty)
                                          .length || 1),
                                    ],
                                    backgroundColor: ["#f59e0b", "#22c55e"],
                                  },
                                ],
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Select a property to see live data.</p>
                    )}
                  </div>
                )}

                {/* SUMMARY TAB */}
                {energyTab === "summary" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* KPI Cards */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-red-100 p-4 rounded-lg text-center shadow">
                        <h3 className="font-semibold text-red-800">Total Power (kWh)</h3>
                        <p className="text-2xl font-bold">
                          {energyData.reduce((sum, d) => sum + d.power_kWh, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
                        <h3 className="font-semibold text-purple-800">Avg Voltage (V)</h3>
                        <p className="text-2xl font-bold">
                          {(energyData.reduce((sum, d) => sum + d.voltage_V, 0) / (energyData.length || 1)).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-yellow-100 p-4 rounded-lg text-center shadow">
                        <h3 className="font-semibold text-yellow-800">Avg Temp (°C)</h3>
                        <p className="text-2xl font-bold">
                          {(energyData.reduce((sum, d) => sum + d.temp_C, 0) / (energyData.length || 1)).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-green-100 p-4 rounded-lg text-center shadow">
                        <h3 className="font-semibold text-green-800">Avg Humidity (%)</h3>
                        <p className="text-2xl font-bold">
                          {(energyData.reduce((sum, d) => sum + d.humidity, 0) / (energyData.length || 1)).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-orange-100 p-4 rounded-lg text-center shadow">
                        <h3 className="font-semibold text-orange-800">Peak Power (kWh)</h3>
                        <p className="text-2xl font-bold">
                          {Math.max(...energyData.map((d) => d.power_kWh)).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Summary Charts with varied types + Pie */}
                    {[ 
                      { label: "Avg Power (kWh)", key: "power_kWh", type: "bar", color: "#3b82f6" },
                      { label: "Avg Voltage (V)", key: "voltage_V", type: "horizontalBar", color: "#8b5cf6" },
                      { label: "Avg Temp (°C)", key: "temp_C", type: "horizontalBar", color: "#f59e0b" },
                      { label: "Avg Humidity (%)", key: "humidity", type: "doughnut", color: "#22c55e" },
                      { label: "Power Distribution", key: "power_kWh", type: "pie", color: "#f97316" }, // new pie
                    ].map((metric) => {
                      const readings = properties
                        .filter((p) => p.status === "occupied")
                        .map((p) => {
                          const data = energyData.filter((d) => d.propertyId === p._id);
                          if (metric.type === "pie") return data.reduce((sum, d) => sum + d.power_kWh, 0).toFixed(2);
                          return (data.reduce((sum, d) => sum + d[metric.key], 0) / (data.length || 1)).toFixed(2);
                        });

                      if (metric.type === "doughnut" || metric.type === "pie") {
                        return (
                          <div key={metric.key + metric.type} className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">{metric.label}</h3>
                            <Pie
                              data={{
                                labels: properties.filter((p) => p.status === "occupied").map((p) => p.name),
                                datasets: [
                                  {
                                    label: metric.label,
                                    data: readings,
                                    backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
                                  },
                                ],
                              }}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={metric.key} className="bg-white p-6 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-4">{metric.label}</h3>
                          <Bar
                            data={{
                              labels: properties.filter((p) => p.status === "occupied").map((p) => p.name),
                              datasets: [{ label: metric.label, data: readings, backgroundColor: metric.color }],
                            }}
                            options={{ indexAxis: metric.type === "horizontalBar" ? "y" : "x" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}



        </div>
      </div>
    </DashboardLayout>
  );
}
