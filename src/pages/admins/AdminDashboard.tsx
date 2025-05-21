import React from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { FaUsers, FaBox, FaClipboardList } from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Authentication and authorization check
  if (!token || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h3>
          <p className="text-gray-600">This area is restricted to admin users only.</p>
        </div>
      </div>
    );
  }

  // Get current page title
  const getPageTitle = () => {
    return "Dashboard Overview"; // Only for /admin
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto w-full">
          {/* Page Title and Breadcrumb */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span>Admin</span>
              <span className="mx-2">›</span>
              <span>{getPageTitle()}</span>
            </div>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaUsers size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Total Users</h3>
                  <p className="text-2xl font-bold">1,248</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-500">↑ 12% from last month</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaBox size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Products</h3>
                  <p className="text-2xl font-bold">342</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-500">↑ 8% from last month</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow w-full">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FaClipboardList size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Orders</h3>
                  <p className="text-2xl font-bold">87</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-red-500">↓ 3% from last month</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;