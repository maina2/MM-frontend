import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";
import {
  FaChartBar,
  FaUsers,
  FaFolder,
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

const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMobileOpen(false);
  };

  const navItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <FaChartBar className={isCollapsed ? "" : "mr-3"} size={20} />,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <FaUsers className={isCollapsed ? "" : "mr-3"} size={20} />,
    },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: <FaFolder className={isCollapsed ? "" : "mr-3"} size={20} />,
    },
    {
      path: "/admin/products",
      label: "Products",
      icon: <FaBox className={isCollapsed ? "" : "mr-3"} size={20} />,
    },
    {
      path: "/admin/orders",
      label: "Orders",
      icon: <FaClipboardList className={isCollapsed ? "" : "mr-3"} size={20} />,
    },
    {
      path: "/admin/payments",
      label: "Payments",
      icon: <FaMoneyBillWave className={isCollapsed ? "" : "mr-3"} size={20} />,
    },
    {
      path: "/admin/deliveries",
      label: "Deliveries",
      icon: <FaTruck className={isCollapsed ? "" : "mr-3"} size={20} />,
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: <FaCog className={isCollapsed ? "" : "mr-3"} size={20} />,
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
          isCollapsed ? "md:w-16" : "md:w-56"
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
            <FaChartBar className="text-primary" size={isCollapsed ? 28 : 24} />
            {!isCollapsed && (
              <h2 className="text-xl font-bold ml-2">Admin Panel</h2>
            )}
          </div>
        </div>

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden md:block pt-4">
          <button
            onClick={toggleCollapse}
            className={`w-full p-3 hover:bg-gray-700 transition-colors duration-200 flex items-center ${
              isCollapsed ? "justify-center" : "justify-end"
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FaChevronRight className="text-gray-400" size={18} />
            ) : (
              <FaChevronLeft className="text-gray-400" size={18} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`mt-2 ${isCollapsed ? "px-1" : "px-2"}`}
          aria-label="Admin navigation"
        >
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg text-sm transition-all duration-200 w-full group relative ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-700 hover:text-primary"
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                  onClick={() => {
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  aria-label={item.label}
                  title={isCollapsed ? item.label : ""}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
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
                className={`flex items-center w-full px-3 py-3 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-primary transition-all duration-200 group relative ${
                  isCollapsed ? "justify-center" : ""
                }`}
                aria-label="Logout"
                title={isCollapsed ? "Logout" : ""}
              >
                <FaSignOutAlt className={isCollapsed ? "" : "mr-3"} size={20} />
                {!isCollapsed && <span className="ml-3">Logout</span>}
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
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;