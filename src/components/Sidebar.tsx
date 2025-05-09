import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaBox, FaTruck, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-dark text-white transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:shadow-md z-50`}
    >
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Categories</h2>
        <button className="md:hidden" onClick={toggleSidebar}>
          <FaTimes size={24} />
        </button>
      </div>
      <nav className="space-y-2 p-4">
        <Link
          to="/products?category=groceries"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaShoppingBag /> Groceries
        </Link>
        <Link
          to="/products?category=beverages"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaShoppingBag /> Beverages
        </Link>
        <Link
          to="/orders"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaBox /> Orders
        </Link>
        <Link
          to="/delivery"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaTruck /> Delivery Status
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;