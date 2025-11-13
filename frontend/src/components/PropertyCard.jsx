// src/components/PropertyCard.jsx
export default function PropertyCard({ prop }) {
  return (
    <div className="border rounded-lg shadow p-4 hover:shadow-lg transition">
      <h3 className="font-bold text-lg">{prop.name}</h3>
      <p className="text-sm text-gray-600">{prop.location}</p>
      <p className="mt-2 font-semibold text-green-600">Rent: ₹{prop.rent}</p>
      <p className="text-sm mt-1">Status: <span className="font-medium">{prop.status}</span></p>
    </div>
  );
}
