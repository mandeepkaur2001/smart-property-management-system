// src/components/DashboardLayout.jsx
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-700">
            Smart PMS
          </Link>

          <nav className="flex items-center space-x-6">
            {user?.role === "manager" && (
              <Link
                href="/dashboard/manager"
                className="text-gray-700 hover:text-blue-600"
              >
                Manager Dashboard
              </Link>
            )}
            {user?.role === "tenant" && (
              <Link
                href="/dashboard/tenant"
                className="text-gray-700 hover:text-blue-600"
              >
                Tenant Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Smart Property Management System · Built for Dissertation Demo
      </footer>
    </div>
  );
}
