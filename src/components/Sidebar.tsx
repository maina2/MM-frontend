import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";
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
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsOpen(false);
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: <FaChartBar className="mr-2" /> },
    { path: "/admin/users", label: "Users", icon: <FaUsers className="mr-2" /> },
    { path: "/admin/products", label: "Products", icon: <FaBox className="mr-2" /> },
    { path: "/admin/orders", label: "Orders", icon: <FaClipboardList className="mr-2" /> },
    { path: "/admin/payments", label: "Payments", icon: <FaMoneyBillWave className="mr-2" /> },
    { path: "/admin/deliveries", label: "Deliveries", icon: <FaTruck className="mr-2" /> },
    { path: "/admin/settings", label: "Settings", icon: <FaCog className="mr-2" /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-gray-600"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-56 transition-transform duration-300 ease-in-out z-40 md:min-h-screen overflow-y-auto box-border`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <FaChartBar className="text-primary mr-2" size={20} />
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
        </div>
        <nav className="mt-4 px-2" aria-label="Admin navigation">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-gray-700 hover:text-primary"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                  aria-label={item.label}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-sm hover:bg-gray-700 hover:text-primary transition-all duration-200"
                aria-label="Logout"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;