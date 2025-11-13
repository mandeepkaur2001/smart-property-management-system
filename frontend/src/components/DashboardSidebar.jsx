// src/components/DashboardSidebar.jsx
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardSidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-gray-100 h-screen p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-6">{user.name}</h2>
      <nav className="flex flex-col gap-3">
        {user.role === "manager" && (
          <>
            <Link href="/dashboard/manager">
              <a className="p-2 rounded hover:bg-gray-200">Dashboard</a>
            </Link>
            <Link href="/dashboard/manager/add-property">
              <a className="p-2 rounded hover:bg-gray-200">Add Property</a>
            </Link>
            <Link href="/dashboard/manager/tenant-requests">
              <a className="p-2 rounded hover:bg-gray-200">Tenant Requests</a>
            </Link>
          </>
        )}
        {user.role === "tenant" && (
          <>
            <Link href="/dashboard/tenant">
              <a className="p-2 rounded hover:bg-gray-200">Dashboard</a>
            </Link>
            <Link href="/dashboard/tenant/browse">
              <a className="p-2 rounded hover:bg-gray-200">Browse Properties</a>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
