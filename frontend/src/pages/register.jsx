// src/pages/register.jsx
import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tenant" });

  const handleSubmit = async (e) => {
    e.preventDefault();
   // await axios.post("http://localhost:4000/api/register", form);
    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api/register`, form);
    alert("Registration successful!");
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-blue-500"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-blue-500"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-blue-500"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-blue-500"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="tenant">Tenant</option>
          <option value="manager">Manager</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Register
        </button>

        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
