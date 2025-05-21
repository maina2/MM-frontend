// src/pages/admins/AdminDashboard.tsx
import React from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import {
  FaUsers,
  FaBox,
  FaClipboardList,
  FaMoneyBillWave,
  FaTruck,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

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

  // Get current page title based on path
  const getPageTitle = () => {
    if (location.pathname.includes("/admin/users")) return "User Management";
    if (location.pathname.includes("/admin/products")) return "Product Management";
    if (location.pathname.includes("/admin/orders")) return "Order Management";
    if (location.pathname.includes("/admin/payments")) return "Payment Management";
    if (location.pathname.includes("/admin/deliveries")) return "Delivery Management";
    if (location.pathname.includes("/admin/settings")) return "Settings";
    return "Dashboard Overview";
  };

  // Nav items with icons
  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <FaChartBar className="mr-3" /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers className="mr-3" /> },
    { path: "/admin/products", label: "Products", icon: <FaBox className="mr-3" /> },
    { path: "/admin/orders", label: "Orders", icon: <FaClipboardList className="mr-3" /> },
    { path: "/admin/payments", label: "Payments", icon: <FaMoneyBillWave className="mr-3" /> },
    { path: "/admin/deliveries", label: "Deliveries", icon: <FaTruck className="mr-3" /> },
    { path: "/admin/settings", label: "Settings", icon: <FaCog className="mr-3" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-gray-900 text-white fixed left-0 h-[calc(100vh-var(--desktop-nav-height))] top-[var(--desktop-nav-height)] p-6 shadow-lg z-20">
        <div className="flex items-center mb-8">
          <FaChartBar className="text-primary mr-2" size={24} />
          <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        </div>
        <nav aria-label="Admin navigation">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-gray-700 hover:text-primary"
                    }`
                  }
                  aria-label={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex-1 w-full">
        {/* Header Bar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 md:left-64 left-0 right-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800 md:block hidden">
            Welcome, {user.username}
          </h1>
          <h1 className="text-xl font-semibold text-gray-800 md:hidden">{getPageTitle()}</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
            aria-label="Logout"
          >
            <FaSignOutAlt className="mr-2" />
            <span className="text-sm">Logout</span>
          </button>
        </header>

        {/* Content Area */}
        <main className="pt-16 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb & Page Title (desktop only) */}
            <div className="hidden md:block mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>Admin</span>
                <span className="mx-2">›</span>
                <span>{getPageTitle()}</span>
              </div>
            </div>

            {/* Dashboard Stats Cards */}
            {location.pathname === "/admin" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
            )}

            {/* Page Content */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Spacer for mobile bottom navigation */}
      <div className="md:hidden h-16" />
    </div>
  );
};

export default AdminDashboard;