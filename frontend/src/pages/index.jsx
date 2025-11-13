// src/pages/index.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);

  const fetchProps = async (pg = 1) => {
    const res = await axios.get(`http://localhost:4000/api/properties?page=${pg}`);
    setProperties(res.data.properties || res.data);
  };

  useEffect(() => {
    fetchProps(page);
  }, [page]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Available Properties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div
            key={prop._id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{prop.name}</h3>
            <p className="text-gray-500 mb-1">{prop.location}</p>
            <p className="text-green-600 font-semibold mb-1">Rent: ₹{prop.rent}</p>
            <p className="text-sm text-gray-600">Status: {prop.status}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </main>
  );
}
