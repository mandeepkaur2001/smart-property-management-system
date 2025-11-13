// src/components/Navbar.jsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Smart Property Management System
        </h1>
        <div className="space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
          <Link href="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
        </div>
      </div>
    </nav>
  );
}
