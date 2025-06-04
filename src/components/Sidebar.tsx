import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks"; // Assuming you have this custom hook
import { logout } from "../store/authSlice"; // Assuming you have this action
import {
  FaChartBar,
  FaUsers,
  FaBox,
  FaClipboardList,
  FaMoneyBillWave,
  FaTruck,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// Mock useAppDispatch if not available in this context for testing
// const useAppDispatch = () => jest.fn();
// Mock logout action
// const logout = () => ({ type: 'LOGOUT' });


const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // MODIFIED LINE: Set initial state of isCollapsed to true
  const [isCollapsed, setIsCollapsed] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMobileOpen(false); // Close mobile sidebar on logout
  };

  const navItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <FaChartBar className={isCollapsed ? "" : "mr-2"} />,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <FaUsers className={isCollapsed ? "" : "mr-2"} />,
    },
    {
      path: "/admin/products",
      label: "Products",
      icon: <FaBox className={isCollapsed ? "" : "mr-2"} />,
    },
    {
      path: "/admin/orders",
      label: "Orders",
      icon: <FaClipboardList className={isCollapsed ? "" : "mr-2"} />,
    },
    {
      path: "/admin/payments",
      label: "Payments",
      icon: <FaMoneyBillWave className={isCollapsed ? "" : "mr-2"} />,
    },
    {
      path: "/admin/deliveries",
      label: "Deliveries",
      icon: <FaTruck className={isCollapsed ? "" : "mr-2"} />,
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: <FaCog className={isCollapsed ? "" : "mr-2"} />,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-gray-600"
        onClick={toggleMobileSidebar}
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-900 text-white transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static ${
          isCollapsed ? "md:w-16" : "md:w-56" // This will now default to md:w-16
        } transition-all duration-300 ease-in-out z-40 md:min-h-screen overflow-y-auto box-border w-56`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b border-gray-700 ${
            isCollapsed ? "px-2" : ""
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* Consider a smaller or different logo when collapsed if needed */}
            <FaChartBar className="text-primary" size={isCollapsed ? 24 : 20} /> {/* Adjusted size slightly for example */}
            {!isCollapsed && (
              <h2 className="text-xl font-bold ml-2">Admin Panel</h2>
            )}
          </div>
        </div>

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden md:block pt-4">
          {" "}
          <button
            onClick={toggleCollapse}
            className={`w-full p-3 hover:bg-gray-700 transition-colors duration-200 flex items-center ${
              isCollapsed ? "justify-center" : "justify-end"
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? ( // Icon will now be FaChevronRight by default
              <FaChevronRight className="text-gray-400" size={16} />
            ) : (
              <FaChevronLeft className="text-gray-400" size={16} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`mt-2 ${isCollapsed ? "px-1" : "px-2"}`}
          aria-label="Admin navigation"
        >
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"} // Ensure Dashboard is only active on exact match
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full group relative ${
                      isActive
                        ? "bg-primary text-white shadow-md" // Ensure 'bg-primary' is defined in your Tailwind config
                        : "text-gray-300 hover:bg-gray-700 hover:text-primary" // Adjusted non-active text color
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                  onClick={() => {
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  aria-label={item.label}
                  title={isCollapsed ? item.label : ""} // Tooltip for collapsed state (HTML native)
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-2">{item.label}</span>} {/* Added ml-2 for consistency */}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden md:block">
                      {item.label}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-800"></div>
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-primary transition-all duration-200 group relative ${
                  isCollapsed ? "justify-center" : ""
                }`}
                aria-label="Logout"
                title={isCollapsed ? "Logout" : ""}
              >
                <FaSignOutAlt className={isCollapsed ? "" : "mr-2"} />
                {!isCollapsed && <span className="ml-2">Logout</span>} {/* Added ml-2 for consistency */}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden md:block">
                    Logout
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={toggleMobileSidebar}
          aria-hidden="true" // Added for accessibility
        ></div>
      )}
    </>
  );
};

export default Sidebar;