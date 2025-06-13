import React from "react";
import { useAppSelector } from "../../store/hooks";
import { useGetAdminStatsQuery } from "../../api/apiSlice";
import { FaUsers, FaBox, FaShoppingCart } from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const { data: stats, isLoading, error } = useGetAdminStatsQuery();

  // Authentication and authorization check
  if (!token || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            This area is restricted to admin users only.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-red-600 text-center">
          Error loading stats. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <main>
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.username || "Admin"}!
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Ready to manage your Muhindi Mweusi supermarket? Use the sidebar to
            explore.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">
                  Total Customers
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.users || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaBox size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Products</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.products || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaShoppingCart size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Orders</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.orders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 text-lg">
            Navigate to{" "}
            <span className="font-semibold text-blue-600">Users</span>,{" "}
            <span className="font-semibold text-blue-600">Products</span>, or{" "}
            <span className="font-semibold text-blue-600">Orders</span> in the
            sidebar to get started.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
