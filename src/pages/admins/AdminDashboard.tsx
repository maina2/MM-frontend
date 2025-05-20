// src/pages/admins/AdminDashboard.tsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useGetProfileQuery } from "../../api/apiSlice";
import { useAppSelector } from "../../store/hooks";

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: profile, isLoading, error } = useGetProfileQuery();

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error || !user || profile?.role !== "admin") {
    return <div className="flex justify-center items-center h-screen">Access Denied: Admin Only</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 fixed h-full">
        <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `block p-2 rounded ${
                    isActive ? "bg-blue-600 text-white" : "hover:bg-gray-700"
                  }`
                }
              >
                User Management
              </NavLink>
            </li>
            {/* Placeholder for future sections */}
            <li>
              <NavLink
                to="/admin/products"
                className="block p-2 rounded hover:bg-gray-700 opacity-50"
                onClick={(e) => e.preventDefault()}
              >
                Product Management (Soon)
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/orders"
                className="block p-2 rounded hover:bg-gray-700 opacity-50"
                onClick={(e) => e.preventDefault()}
              >
                Order Management (Soon)
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;